const fs = require('node:fs');
const path = require('node:path');

const file = path.join(process.cwd(), 'dist', 'index.html');
const tag = '<link rel="stylesheet" href="/artistic.css">';

let html = fs.readFileSync(file, 'utf8');
if (!html.includes('/artistic.css')) {
  html = html.replace('</head>', `${tag}</head>`);
  fs.writeFileSync(file, html);
}
