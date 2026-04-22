#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs');
const md = require('markdown-it')({ html: true, linkify: true, typography: true });

const app = express();
const docsDir = path.resolve(__dirname, '..');

function renderMd(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const html = md.render(raw);
  const title = path.basename(filePath, '.md');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,Helvetica,sans-serif; padding:20px; max-width:900px; margin:auto; background:#111; color:#eee;} a{color:#f59e0b}</style></head><body><h1>${title}</h1>${html}</body></html>`;
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch (e) { return false; }
}

app.get('/docs', (req, res) => {
  // Simple index of available docs
  const items = ["overview.md","architecture.md","api/v1.md"]; // extend as docs are added
  const links = items.map(i => `<li><a href="/docs/${i.replace('.md','')}" >${i}</a></li>`).join('');
  res.send(`<!doctype html><html><body><h1>文档索引</h1><ul>${links}</ul></body></html>`);
});

app.get('/docs/*', (req, res) => {
  const slug = req.params[0] || '';
  // Normalize and map to actual md file
  const candidates = [
    path.join(docsDir, slug + '.md'),
    path.join(docsDir, slug, 'index.md')
  ];
  const file = candidates.find(p => fileExists(p));
  if (!file) {
    res.status(404).send('<h2>文档未找到</h2>');
    return;
  }
  try {
    const html = renderMd(file);
    res.send(html);
  } catch (e) {
    res.status(500).send('<h2>渲染文档失败</h2><pre>' + e.message + '</pre>');
  }
});

const port = process.env.DOCS_PORT || 3001;
app.listen(port, () => {
  console.log(`Docs server running at http://localhost:${port}/docs`);
});
