// server.local.js — local blog API (no auth)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fse = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;
const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const INDEX_JSON = path.join(BLOG_DIR, 'index.json');

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '2mb' }));

async function ensure() {
  await fse.ensureDir(POSTS_DIR);
  if (!(await fse.pathExists(INDEX_JSON))) {
    await fse.writeJson(INDEX_JSON, []);
  }
}
function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

app.get('/posts', async (_req, res) => {
  try {
    await ensure();
    const list = await fse.readJson(INDEX_JSON);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'LIST_FAILED', details: String(e) });
  }
});

app.get('/posts/:slug', async (req, res) => {
  try {
    await ensure();
    const slug = req.params.slug;
    const list = await fse.readJson(INDEX_JSON);
    const meta = list.find(p => p.slug === slug) || null;
    const mdPath = path.join(POSTS_DIR, `${slug}.md`);
    const body = (await fse.pathExists(mdPath)) ? await fse.readFile(mdPath, 'utf-8') : '';
    res.json({ ...meta, body });
  } catch (e) {
    res.status(500).json({ error: 'GET_FAILED', details: String(e) });
  }
});

app.post('/posts', async (req, res) => {
  try {
    await ensure();
    const { title, slug, date, minutes = 3, tags = [], excerpt = '', body = '' } = req.body || {};
    if (!title || !slug || !date || !validDate(date)) {
      return res.status(400).json({ error: 'REQUIRED:title,slug,date(YYYY-MM-DD)' });
    }
    // write md
    await fse.writeFile(path.join(POSTS_DIR, `${slug}.md`), body, 'utf-8');
    // upsert index
    const list = await fse.readJson(INDEX_JSON);
    const meta = { title, slug, date, minutes, tags, excerpt };
    const i = list.findIndex(p => p.slug === slug);
    if (i >= 0) list[i] = meta; else list.push(meta);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    await fse.writeJson(INDEX_JSON, list, { spaces: 2 });
    res.json({ ok: true, meta });
  } catch (e) {
    res.status(500).json({ error: 'SAVE_FAILED', details: String(e) });
  }
});

app.delete('/posts/:slug', async (req, res) => {
  try {
    await ensure();
    const slug = req.params.slug;
    await fse.remove(path.join(POSTS_DIR, `${slug}.md`)).catch(() => {});
    const list = await fse.readJson(INDEX_JSON);
    const next = list.filter(p => p.slug !== slug);
    await fse.writeJson(INDEX_JSON, next, { spaces: 2 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'DELETE_FAILED', details: String(e) });
  }
});

app.listen(PORT, () => console.log(`[local-blog] http://localhost:${PORT}`));
