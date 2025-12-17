const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const assert = require('assert');

const { run } = require('../compliance-check.js');

async function withTempSite(name, fn) {
  const root = path.join(__dirname, 'tmp', name);
  await fse.remove(root);
  await fse.ensureDir(root);
  await fse.ensureDir(path.join(root, 'doc', 'report'));
  return fn(root).finally(() => fse.remove(root));
}

async function testReportGeneration() {
  await withTempSite('site1', async (root) => {
    const html = `<!doctype html><html><head><title>Test</title><meta name="description" content="Desc"></head><body><h1>One</h1><img src="a.jpg" alt="image"></body></html>`;
    await fse.writeFile(path.join(root, 'index.html'), html, 'utf-8');
    await fse.writeFile(path.join(root, 'SEO_Guidelines.md'), '# SEO');
    process.env.GUIDELINES_PATH = path.join(root, 'SEO_Guidelines.md');
    process.env.REPORT_DIR = path.join(root, 'doc', 'report');

    const report = await run({ targetDir: root });
    assert(report && report.findings, 'Report should be returned');
    const mdPath = path.join(root, 'doc', 'report', 'compliance-latest.md');
    const jsonPath = path.join(root, 'doc', 'report', 'compliance-latest.json');
    assert(fs.existsSync(mdPath), 'Markdown report should exist');
    assert(fs.existsSync(jsonPath), 'JSON report should exist');
  });
}

async function testVerifyMode() {
  await withTempSite('site2', async (root) => {
    // Create duplicate canonicals to trigger High severity
    const html = `<!doctype html><html><head><title>Test</title><meta name="description" content="Desc"><link rel="canonical" href="https://x" /><link rel="canonical" href="https://y" /></head><body><h1>One</h1></body></html>`;
    await fse.writeFile(path.join(root, 'index.html'), html, 'utf-8');
    await fse.writeFile(path.join(root, 'SEO_Guidelines.md'), '# SEO');
    process.env.GUIDELINES_PATH = path.join(root, 'SEO_Guidelines.md');
    process.env.REPORT_DIR = path.join(root, 'doc', 'report');

    let failed = false;
    try {
      await run({ targetDir: root, verify: true });
    } catch (e) {
      failed = (e && e.code === 'VERIFICATION_FAILED');
    }
    assert(failed, 'Verify mode should fail on High severity issues');
  });
}

async function testErrorHandling() {
  let threw = false;
  try {
    // Missing guidelines path
    delete process.env.GUIDELINES_PATH;
    await run({ targetDir: path.join(__dirname, 'does-not-exist') });
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Should throw when guidelines are missing');
}

async function testProductsKnowMoreButtonRepo() {
  const repoRoot = path.join(__dirname, '..');
  const productsPath = path.join(repoRoot, 'products.html');
  const html = fs.readFileSync(productsPath, 'utf-8');
  const hasAnchor = /<a[^>]*href=["']services\.html["'][^>]*>/i.test(html);
  const hasText = /Know more/i.test(html);
  assert(hasAnchor && hasText, 'Products page should include Know more button linking to services.html');
}

async function testServicesKnowMoreButtonRepo() {
  const repoRoot = path.join(__dirname, '..');
  const servicesPath = path.join(repoRoot, 'services.html');
  const html = fs.readFileSync(servicesPath, 'utf-8');
  const hasAnchor = /<a[^>]*href=["']products\.html["'][^>]*>/i.test(html);
  const hasText = /Know more/i.test(html);
  assert(hasAnchor && hasText, 'Services page should include Know more button linking to products.html');
}

async function testBlogMenuAndPagesExist() {
  const repoRoot = path.join(__dirname, '..');
  const blogList = path.join(repoRoot, 'blog.html');
  assert(fs.existsSync(blogList), 'blog.html should exist');
  const listHtml = fs.readFileSync(blogList, 'utf-8');
  assert(/<h1[^>]*>\s*Blog\s*<\/h1>/i.test(listHtml), 'blog.html should include Blog heading');
  assert(/Read More/i.test(listHtml), 'blog.html should include Read More buttons');

  const navFiles = ['index.html'];
  for (const f of navFiles) {
    const html = fs.readFileSync(path.join(repoRoot, f), 'utf-8');
    assert(/<a[^>]*href=["']blog\.html["'][^>]*>\s*Blog\s*<\/a>/i.test(html), `Navbar should include Blog link in ${f}`);
  }

  const details = [
    'blog-elevating-business.html',
    'blog-how-ai-is-revolutionizing-netSuite.html',
    'blog-cloud-erp-powerhouse.html',
    'blog-the-build-vs-buy-dilemma.html',
    'blog-software-supply-chain-security.html',
    'blog-web-and-mobile-development.html',
    'blog-driving-business-evolution.html'
  ];
  for (const f of details) {
    const candidates = [path.join(repoRoot, f), path.join(repoRoot, 'blogs', f)];
    const fp = candidates.find(p => fs.existsSync(p));
    assert(fp, `${f} should exist in root or blogs/`);
    const html = fs.readFileSync(fp, 'utf-8');
    assert(/Back to Blog/i.test(html) || /Back to Blogs/i.test(html), `${f} should include back link`);
  }
}

async function testBlogCardImagesConsistent() {
  const repoRoot = path.join(__dirname, '..');
  const blogList = path.join(repoRoot, 'blog.html');
  assert(fs.existsSync(blogList), 'blog.html should exist');
  const listHtml = fs.readFileSync(blogList, 'utf-8');
  const articles = listHtml.match(/<article[^>]*class=["'][^"']*card[^"']*["']/gi) || [];
  assert(articles.length === 7, `Expected 7 blog cards, found ${articles.length}`);
}

(async function main(){
  try {
    await testReportGeneration();
    await testVerifyMode();
    await testErrorHandling();
    await testProductsKnowMoreButtonRepo();
    await testServicesKnowMoreButtonRepo();
    await testBlogMenuAndPagesExist();
    await testBlogCardImagesConsistent();
    console.log('[tests] All tests passed');
  } catch (e) {
    console.error('[tests] Failed:', e);
    process.exit(1);
  }
})();
