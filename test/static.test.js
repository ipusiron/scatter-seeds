'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

test('G: copied code and vendor files match pinned sources', () => {
  const expected = {
    'sha256-core.js': '8b8f66a17ac3dd93503c8390652cb9150b6d8a9e8788364e9d6f26b9c3e67246',
    'vendor/qrcode.min.js': 'bb2365e4902f4f84852cf4025e6f6a60325a682aeafa43fb63b7fc8f098d1ef2',
    'vendor/jsQR.js': 'bc40c8a15196236b2314db0856f72ca0b49980cd5413b8c852a7349f5fee0859',
    'vendor/LICENSE-qrcode-generator.txt': '3a850fa5f08101db6f40676c2786e10bd2cd5fff7b12ffdf1e0c434d4e49d90c',
    'vendor/LICENSE-jsQR.txt': 'c6596eb7be8581c18be736c846fb9173b69eccf6ef94c5135893ec56bd92ba08'
  };
  for (const [file, hash] of Object.entries(expected)) assert.equal(digest(file), hash, file);
});
test('G: core modules remain DOM independent and page has strict CSP', () => {
  const html = read('index.html');
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.doesNotMatch(html, /\son\w+=|\sstyle=/i);
  for (const file of ['sss-core.js', 'bip39.js']) assert.doesNotMatch(read(file), /\bdocument\b|\bwindow\b|\blocalStorage\b/);
  for (const file of ['sss-core.js', 'bip39.js', 'app.js']) {
    assert.doesNotMatch(read(file), /Math\.random|XMLHttpRequest|WebSocket|innerHTML|\bfetch\s*\(/);
  }
  const app = read('app.js');
  assert.deepEqual([...app.matchAll(/localStorage\.(?:getItem|setItem)\('scatter-seeds\.' \+ key/g)].length, 2);
});
test('G: Japanese and English message keys match', () => {
  const messages = require('../messages.js');
  assert.deepEqual(Object.keys(messages.ja).sort(), Object.keys(messages.en).sort());
  for (const language of ['ja', 'en']) for (const value of Object.values(messages[language])) assert.ok(value);
});
