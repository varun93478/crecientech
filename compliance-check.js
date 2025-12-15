#!/usr/bin/env node
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

function log(msg) {
  console.log(`[compliance] ${msg}`);
}

function nowIso() {
  return new Date().toISOString();
}

function readTextSafe(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch (e) { return ''; }
}

function listFiles(dir) {
  const out = [];
  (function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const ent of entries) {
      const fp = path.join(d, ent.name);
      if (ent.isDirectory()) walk(fp); else out.push(fp);
    }
  })(dir);
  return out;
}

function isHtml(fp) { return fp.endsWith('.html') || fp.endsWith('.htm'); }
function isCss(fp) { return fp.endsWith('.css'); }
function isImage(fp) { return /(\.(png|jpg|jpeg|gif|svg|webp|avif))$/i.test(fp); }

function parseHeadTags(html) {
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : html;
  const title = (head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const metaDesc = (head.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || [])[1] || '';
  const canonals = [ ...head.matchAll(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/ig) ].map(m=>m[1]);
  const jsonLd = [ ...head.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig) ].map(m=>m[1]);
  const ogTitle = (head.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i) || [])[1] || '';
  const ogDesc = (head.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || [])[1] || '';
  const twitterCard = (head.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["'][^>]*>/i) || [])[1] || '';
  const viewport = /<meta[^>]*name=["']viewport["']/i.test(head);
  return { title, metaDesc, canonals, jsonLd, ogTitle, ogDesc, twitterCard, viewport };
}

function analyzeHtml(fp, html, guidelines) {
  const findings = [];
  const htmlNC = html.replace(/<!--[\s\S]*?-->/g, '');
  const head = parseHeadTags(html);

  // Canonical
  if (head.canonals.length === 0) {
    findings.push({
      category: 'SEO', severity: 'High', rule: 'Canonical Tag Missing', file: fp,
      evidence: 'No <link rel="canonical"> found',
      recommendation: 'Add a single canonical link referencing the preferred absolute HTTPS URL.',
      guideline: 'Technical SEO > Canonical Tags'
    });
  }
  if (head.canonals.length > 1) {
    findings.push({
      category: 'SEO', severity: 'High', rule: 'Multiple Canonical Tags', file: fp,
      evidence: `Found ${head.canonals.length} canonical tags`,
      recommendation: 'Ensure exactly one canonical tag per page.',
      guideline: 'Technical SEO > Canonical Tags'
    });
  }

  // Title and description
  if (!head.title.trim()) {
    findings.push({ category: 'SEO', severity: 'High', rule: 'Missing Title Tag', file: fp,
      evidence: 'No <title> in head', recommendation: 'Add unique, keyword-focused title (50–60 chars).', guideline: 'On-Page SEO > Title Tags' });
  }
  if (!head.metaDesc.trim()) {
    findings.push({ category: 'SEO', severity: 'High', rule: 'Missing Meta Description', file: fp,
      evidence: 'No meta description', recommendation: 'Add unique meta description (150–160 chars).', guideline: 'On-Page SEO > Meta Descriptions' });
  }

  // OpenGraph / Twitter
  if (!head.ogTitle || !head.ogDesc || !head.twitterCard) {
    findings.push({ category: 'SEO', severity: 'Medium', rule: 'Missing Social Meta', file: fp,
      evidence: 'og:title/og:description/twitter:card not fully present', recommendation: 'Add OpenGraph and Twitter Card tags.', guideline: 'On-Page SEO > User Engagement Signals' });
  }

  // Viewport
  if (!head.viewport) {
    findings.push({ category: 'Performance', severity: 'Medium', rule: 'Missing Viewport', file: fp,
      evidence: 'No viewport meta tag', recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">', guideline: 'Technical SEO > Mobile Optimization' });
  }

  // Headers
  const h1s = [ ...htmlNC.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/ig) ];
  if (h1s.length === 0) {
    findings.push({ category: 'SEO', severity: 'High', rule: 'Missing H1', file: fp,
      evidence: 'No <h1> in page', recommendation: 'Include one H1 reflecting the primary topic.', guideline: 'On-Page SEO > Header Tags' });
  }
  if (h1s.length > 1) {
    findings.push({ category: 'SEO', severity: 'High', rule: 'Multiple H1', file: fp,
      evidence: `Found ${h1s.length} H1 tags`, recommendation: 'Limit to a single H1; use H2/H3 for sections.', guideline: 'On-Page SEO > Header Tags' });
  }

  // Images: alt and lazy and dimensions
  const imgs = [ ...htmlNC.matchAll(/<img\s+[^>]*>/ig) ].map(m=>m[0]);
  for (const tag of imgs) {
    const hasAlt = /\balt=/.test(tag);
    const altVal = (tag.match(/alt=["']([^"']*)["']/i) || [])[1] || '';
    const hasLazy = /\bloading=["']lazy["']/.test(tag);
    const hasDim = /\b(width|height)=/.test(tag);
    if (!hasAlt || !altVal.trim() || /^(image|logo|featured creator)$/i.test(altVal.trim())) {
      findings.push({ category: 'SEO', severity: 'Medium', rule: 'Weak Image Alt', file: fp,
        evidence: `<img> missing/weak alt="${altVal}"`, recommendation: 'Provide descriptive keyword-relevant alt text.', guideline: 'On-Page SEO > Image Optimization' });
    }
    if (!hasLazy) {
      findings.push({ category: 'Performance', severity: 'Medium', rule: 'Image Not Lazy-Loaded', file: fp,
        evidence: '<img> missing loading="lazy"', recommendation: 'Add loading="lazy" to non-critical images.', guideline: 'Technical SEO > Speed Optimization' });
    }
    if (!hasDim) {
      findings.push({ category: 'Performance', severity: 'Low', rule: 'Image Missing Dimensions', file: fp,
        evidence: '<img> missing width/height', recommendation: 'Specify width and height to avoid CLS.', guideline: 'Technical SEO > Core Web Vitals (CLS)' });
    }
  }

  // Structured data
  if (!head.jsonLd.length) {
    findings.push({ category: 'SEO', severity: 'Critical', rule: 'Structured Data Missing', file: fp,
      evidence: 'No JSON-LD script tags found', recommendation: 'Add appropriate JSON-LD (Organization/Article/Breadcrumb).', guideline: 'Technical SEO > Structured Data' });
  }

  // Internal linking: breadcrumb
  if (!/breadcrumb/i.test(html) && !/BreadcrumbList/.test(html)) {
    findings.push({ category: 'SEO', severity: 'Medium', rule: 'Breadcrumb Missing', file: fp,
      evidence: 'No breadcrumb nav or schema detected', recommendation: 'Implement breadcrumb navigation or BreadcrumbList schema.', guideline: 'Technical SEO > Site Architecture' });
  }

  // Social meta evidence already above

  return findings;
}

function analyzeProject(rootDir, guidelinesPath) {
  const files = listFiles(rootDir);
  const htmlFiles = files.filter(isHtml);
  const cssFiles = files.filter(isCss);
  const imageFiles = files.filter(isImage);
  const findings = [];

  const guidelines = readTextSafe(guidelinesPath);

  // Project-level checks: robots.txt and sitemap.xml
  const robotsExists = fs.existsSync(path.join(rootDir, 'robots.txt'));
  const sitemapExists = fs.existsSync(path.join(rootDir, 'sitemap.xml'));
  if (!robotsExists) {
    findings.push({ category: 'SEO', severity: 'Critical', rule: 'robots.txt Missing', file: rootDir,
      evidence: 'No robots.txt in project root', recommendation: 'Add robots.txt with appropriate directives and Sitemap hint.', guideline: 'Technical SEO > Robots.txt Configuration' });
  }
  if (!sitemapExists) {
    findings.push({ category: 'SEO', severity: 'Critical', rule: 'Sitemap Missing', file: rootDir,
      evidence: 'No sitemap.xml in project root', recommendation: 'Generate and place sitemap.xml; submit to Search Console.', guideline: 'Technical SEO > XML Sitemap' });
  }

  // Performance heuristics: large images
  for (const img of imageFiles) {
    try {
      const st = fs.statSync(img);
      if (st.size > 100 * 1024) {
        const ext = path.extname(img).toLowerCase();
        const base = img.slice(0, -ext.length);
        const altCandidates = [ `${base}.webp`, `${base}.avif` ];
        const hasOptimizedAlt = altCandidates.some(p => {
          try { return fs.existsSync(p) && fs.statSync(p).size <= 100*1024; } catch { return false; }
        });
        if (!hasOptimizedAlt) {
          findings.push({ category: 'Performance', severity: st.size > 500*1024 ? 'High' : 'Medium', rule: 'Large Image File', file: img,
            evidence: `Image size ${(st.size/1024).toFixed(0)}KB`, recommendation: 'Compress and convert to WebP/AVIF; aim <100KB.', guideline: 'On-Page SEO > Image Optimization' });
        }
      }
    } catch {}
  }

  // CSS font-display swap
  for (const css of cssFiles) {
    const cssText = readTextSafe(css);
    const usesGoogleFonts = /@import\s+url\(https:\/\/fonts\.googleapis\.com\//.test(cssText);
    const hasFontDisplaySwapRule = /font-display:\s*swap/.test(cssText);
    const hasDisplaySwapParam = /display=swap/.test(cssText);
    if (usesGoogleFonts && !(hasFontDisplaySwapRule || hasDisplaySwapParam)) {
      findings.push({ category: 'Performance', severity: 'Low', rule: 'Fonts Without Swap', file: css,
        evidence: 'Google Fonts without display swap', recommendation: 'Use display=swap parameter or font-display: swap.', guideline: 'Technical SEO > Speed Optimization' });
    }
  }

  // HTML per-file analysis
  for (const hf of htmlFiles) {
    const html = readTextSafe(hf);
    const per = analyzeHtml(hf, html, guidelines);
    findings.push(...per);
    // URL structure checks: lowercase, hyphens
    const base = path.basename(hf);
    if (/[A-Z_\s]/.test(base)) {
      findings.push({ category: 'SEO', severity: 'Low', rule: 'URL Naming Not Ideal', file: hf,
        evidence: `Filename '${base}' contains uppercase/underscores/spaces`, recommendation: 'Prefer lowercase and hyphens for URLs.', guideline: 'Technical SEO > URL Structure' });
    }
  }

  // Social meta at least on index.html
  const home = htmlFiles.find(f=>path.basename(f)==='index.html');
  if (home) {
    const htxt = readTextSafe(home);
    const head = parseHeadTags(htxt);
    if (!head.ogTitle || !head.ogDesc) {
      findings.push({ category: 'SEO', severity: 'High', rule: 'Homepage Missing OG Meta', file: home,
        evidence: 'og:title/og:description not present', recommendation: 'Add comprehensive OpenGraph tags to homepage.', guideline: 'On-Page SEO > User Engagement Signals' });
    }
  }

  // Mobile responsiveness heuristic: viewport check across files
  const noViewport = htmlFiles.filter(fp => !parseHeadTags(readTextSafe(fp)).viewport);
  if (noViewport.length) {
    findings.push({ category: 'Performance', severity: 'Medium', rule: 'Missing Viewport On Pages', file: noViewport[0],
      evidence: `Pages without viewport: ${noViewport.length}`, recommendation: 'Add viewport meta to all pages.', guideline: 'Technical SEO > Mobile Optimization' });
  }

  // Structured data coverage: none across project
  const anyJsonLd = htmlFiles.some(fp => parseHeadTags(readTextSafe(fp)).jsonLd.length > 0);
  if (!anyJsonLd) {
    findings.push({ category: 'SEO', severity: 'Critical', rule: 'Project Lacks Structured Data', file: rootDir,
      evidence: 'No JSON-LD in any HTML file', recommendation: 'Implement Organization schema on homepage and Article schema on blog posts.', guideline: 'Technical SEO > Structured Data' });
  }

  // Summary and status
  const severityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const summary = {
    counts: findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity]||0)+1; return acc; }, {}),
    total: findings.length,
  };
  const status = findings.some(f=>severityRank[f.severity]>=3) ? 'fail' : 'pass';
  return { findings, summary, status };
}

function toMarkdown(report, pkg) {
  const lines = [];
  lines.push(`# SEO Compliance Report`);
  lines.push(`Version: ${pkg.version || 'N/A'}`);
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`Status: ${report.status.toUpperCase()}`);
  lines.push('');
  lines.push(`## Summary`);
  lines.push(`- Total findings: ${report.summary.total}`);
  for (const sev of ['Critical','High','Medium','Low']) {
    lines.push(`- ${sev}: ${report.summary.counts[sev]||0}`);
  }
  lines.push('');
  lines.push(`## Findings`);
  for (const f of report.findings) {
    lines.push(`- Category: ${f.category} | Severity: ${f.severity}`);
    lines.push(`  - Rule: ${f.rule}`);
    lines.push(`  - File: ${f.file}`);
    if (f.evidence) lines.push(`  - Evidence: ${f.evidence}`);
    lines.push(`  - Recommendation: ${f.recommendation}`);
    if (f.guideline) lines.push(`  - Guideline: ${f.guideline}`);
  }
  return lines.join('\n');
}

async function run(opts = {}) {
  const cwd = opts.targetDir || process.cwd();
  const verifyOnly = !!opts.verify || process.argv.includes('--verify');
  const guidelinesPath = process.env.GUIDELINES_PATH || path.join(cwd, 'SEO_Guidelines.md');
  const reportDir = process.env.REPORT_DIR || path.join(cwd, 'doc', 'report');

  const pkgPath = path.join(cwd, 'package.json');
  const pkg = fse.pathExistsSync(pkgPath) ? fse.readJsonSync(pkgPath) : { version: 'N/A' };

  log(`Analyzing directory: ${cwd}`);
  if (!fse.pathExistsSync(guidelinesPath)) {
    throw new Error(`Guidelines not found at ${guidelinesPath}`);
  }

  const res = analyzeProject(cwd, guidelinesPath);
  const report = { ...res, timestamp: nowIso(), version: pkg.version };

  await fse.ensureDir(reportDir);
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const latestMd = path.join(reportDir, 'compliance-latest.md');
  const latestJson = path.join(reportDir, 'compliance-latest.json');
  const histMd = path.join(reportDir, `compliance-${ts}.md`);
  const histJson = path.join(reportDir, `compliance-${ts}.json`);

  const md = toMarkdown(report, pkg);
  await fse.writeFile(latestMd, md, 'utf-8');
  await fse.writeJson(latestJson, report, { spaces: 2 });
  await fse.writeFile(histMd, md, 'utf-8');
  await fse.writeJson(histJson, report, { spaces: 2 });

  log(`Reports written: ${latestMd}, ${latestJson}`);

  if (verifyOnly) {
    const hasBlocking = report.findings.some(f => ['Critical','High'].includes(f.severity));
    if (hasBlocking) {
      log('Verification failed: Critical/High issues present');
      const err = new Error('VERIFICATION_FAILED'); err.code = 'VERIFICATION_FAILED'; throw err;
    } else {
      log('Verification passed: No Critical/High issues');
    }
  }

  return report;
}

if (require.main === module) {
  run().catch(err => {
    console.error(`[compliance] ERROR: ${err.code||''} ${err.message}`);
    process.exit(err.code === 'VERIFICATION_FAILED' ? 2 : 1);
  });
} else {
  module.exports = { run, analyzeProject };
}
