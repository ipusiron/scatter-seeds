'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('source files remain readable and not minified', () => {
  const files = ['app.js', 'sss-core.js', 'bip39.js', 'qr.js', 'messages.js', 'style.css',
    'restore.py', 'test/core.test.js', 'test/static.test.js', 'test/readme.test.js',
    'test/format.test.js', 'test/contrast.test.js', 'test/interface.browser.py',
    'test/restore-output.test.js', 'test/improvements.browser.py'];
  const minimum = { 'app.js': 250, 'sss-core.js': 150, 'bip39.js': 50,
    'messages.js': 100, 'style.css': 250, 'qr.js': 12, 'restore.py': 100 };
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/);
    assert.ok(lines.length >= (minimum[file] || 15), `${file}: line count`);
    assert.ok(Math.max(...lines.map(line => line.length)) <= 160, `${file}: long line`);
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').split(/\r?\n/);
  assert.ok(html.length >= 100);
  assert.ok(Math.max(...html.map(line => line.length)) <= 250);
});
