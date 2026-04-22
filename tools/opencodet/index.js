#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function summarizeDocs(dir) {
  const files = [];
  function walk(d, prefix) {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full, path.join(prefix, name));
      else if (name.endsWith('.md')) files.push(path.join(prefix, name));
    }
  }
  walk(dir, '');
  return files;
}

const cmd = process.argv[2] || 'docs';
if (cmd === 'docs') {
  const docs_root = path.resolve(__dirname, '../../docs');
  const list = summarizeDocs(docs_root);
  console.log('OpenCodet Doc Summary:');
  list.forEach(p => console.log('- ' + p));
  process.exit(0);
}
console.log('Oh My OpenCodet CLI placeholder.');
process.exit(0);
