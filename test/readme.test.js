'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const C = require('../sss-core.js');
const B = require('../bip39.js');
const V = require('./fixtures/vectors.json');
const root = path.join(__dirname, '..');
const normalize = value => value.replace(/\r\n/g, '\n');
const ja = normalize(fs.readFileSync(path.join(root, 'README.md'), 'utf8'));
const en = normalize(fs.readFileSync(path.join(root, 'README.en.md'), 'utf8'));
const py = normalize(fs.readFileSync(path.join(root, 'restore.py'), 'utf8')).trim();

test('README metadata and section order match the series format', () => {
  assert.match(ja, /^<!--\n---\nid: day124\nslug: scatter-seeds/m);
  for (const value of ['category_ja:\n  - プレッパー\n  - 現代暗号\n  - 物理的セキュリティ',
    'category_en:\n  - Prepping / Survival\n  - Modern Cryptography\n  - Physical Security',
    'difficulty: 3', 'hub: true', 'repo_url: "https://github.com/ipusiron/scatter-seeds"',
    'demo_url: "https://ipusiron.github.io/scatter-seeds/"']) assert.ok(ja.includes(value), value);
  const headings = content => [...content.matchAll(/^## /gm)].map(match => match.index);
  assert.equal(headings(ja).length, 14); assert.equal(headings(en).length, 14);
  for (const content of [ja, en]) {
    assert.ok(content.indexOf('## 🌐') < content.indexOf('## 📸'));
    assert.ok(content.indexOf('## 📁') < content.indexOf('## 💻'));
    assert.ok(content.indexOf('## 💻') < content.indexOf('## 📄'));
    assert.ok(content.indexOf('## 📄') < content.indexOf('## 🛠️'));
    assert.equal((content.match(/!\[GitHub/g) || []).length, 5);
  }
});
test('README numeric examples follow the reference vectors', () => {
  for (const [i, length] of [16, 32, 64, 128, 256].entries()) {
    const row = V.qr[i];
    for (const content of [ja, en]) {
      assert.ok(content.includes(`| ${length}バイト | ${row.chars} | ${row.M_ver} |`) ||
        content.includes(`| ${length} bytes | ${row.chars} | ${row.M_ver} |`), length);
    }
  }
  assert.equal(C.combinations(16, 8).length, V.maxSubsets);
  assert.equal(B.entropyToMnemonic(C.unhex(V.vectors[1].S_hex)),
    'legal winner thank year wave sausage worth useful legal winner thank yellow');
});
test('README screenshots and directory entries refer to present files', () => {
  for (const [content, language] of [[ja, 'ja'], [en, 'en']]) {
    const images = [...content.matchAll(/!\[[^\]]+\]\((assets\/[a-z]+\/(?:light|dark)\/[a-z]+\.png)\)/g)]
      .map(match => match[1]);
    assert.equal(images.length, 10);
    assert.equal(new Set(images).size, 10);
    for (const image of images) {
      assert.ok(image.startsWith(`assets/${language}/`));
      assert.ok(fs.existsSync(path.join(root, image)), image);
    }
  }
  const files = ['index.html', 'style.css', 'app.js', 'sss-core.js', 'sha256-core.js', 'bip39.js',
    'bip39-english.js', 'qr.js', 'messages.js', 'restore.py', 'README.md', 'README.en.md',
    'LICENSE', 'package.json', 'vendor/qrcode.min.js', 'vendor/jsQR.js',
    'vendor/LICENSE-qrcode-generator.txt', 'vendor/LICENSE-jsQR.txt', 'test/core.test.js',
    'test/static.test.js', 'test/contrast.test.js', 'test/format.test.js',
    'test/readme.test.js', 'test/interface.browser.py',
    'test/fixtures/vectors.json', 'test/fixtures/bip39-english.txt', '.github/workflows/test.yml'];
  for (const file of files) {
    const name = path.basename(file);
    assert.ok(ja.includes(name) && en.includes(name), file);
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
  for (const content of [ja, en]) {
    const tree = content.match(/```text\n([\s\S]*?)\n```/)[1];
    assert.ok(tree.split('\n').every(line => line.includes(' # ')));
  }
});
test('README Python script exactly matches independent restore.py', () => {
  for (const content of [ja, en]) {
    const matches = [...content.matchAll(/```python\n([\s\S]*?)\n```/g)];
    assert.equal(matches.length, 1);
    assert.equal(matches[0][1].trim(), py);
  }
});
test('F: README Python script restores every reference set', t => {
  const python = spawnSync('python', ['--version'], { encoding: 'utf8' });
  if (python.error || python.status !== 0) { t.skip('python is unavailable'); return; }
  for (const vector of V.vectors) {
    const result = spawnSync('python', ['restore.py'], {
      cwd: root, input: vector.shares.slice(0, vector.k).join('\n') + '\n', encoding: 'utf8'
    });
    assert.equal(result.status, 0, `${vector.name}: ${result.stderr}`);
    if (vector.type === 1) assert.equal(result.stdout.trim(), 'Scatter Seeds');
    else {
      assert.ok(result.stdout.includes(vector.S_hex.toUpperCase()));
      assert.equal(result.stdout.trim().split(/\r?\n/)[0], B.entropyToMnemonic(C.unhex(vector.S_hex)));
    }
  }
  const [a, b] = V.vectors[0].shares;
  const broken = b.slice(0, -1) + (b.endsWith('0') ? '1' : '0');
  const failure = spawnSync('python', ['restore.py'], { cwd: root, input: a + '\n' + broken + '\n', encoding: 'utf8' });
  assert.notEqual(failure.status, 0); assert.equal(failure.stdout, '');
});
