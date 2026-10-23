'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const C = require('../sss-core.js');
const root = path.join(__dirname, '..');
const python = spawnSync('python', ['--version']);
const options = { skip: python.error || python.status !== 0 ? 'python is unavailable' : false };
const encoder = new TextEncoder();

function sharesFor(secret, type = 1) {
  const bytes = typeof secret === 'string' ? encoder.encode(secret) : secret;
  return C.split(type, bytes, 2, 3, count => new Uint8Array(count).fill(17), C.unhex('5EED1234'));
}
function run(shares, args = [], extraEnv = {}) {
  return spawnSync('python', ['restore.py', ...args], {
    cwd: root,
    input: shares.join('\n') + '\n',
    env: { ...process.env, ...extraEnv }
  });
}
function success(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr.toString('utf8'));
  assert.equal(result.stderr.length, 0);
}
function failure(result, message) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout.length, 0, 'invalid input must not expose a restored value');
  assert.match(result.stderr.toString('utf8'), message);
}

test('Python text output is quoted JSON and distinguishes controls from literal escapes', options, () => {
  const cases = [
    ['A\nB', '"A\\nB"\n'],
    ['A\tB', '"A\\tB"\n'],
    ['A\\u000AB', '"A\\\\u000AB"\n'],
    ['A\\nB', '"A\\\\nB"\n'],
    ['"quoted"\\path', '"\\"quoted\\"\\\\path"\n'],
    ['A\u0000B', '"A\\u0000B"\n'],
    ['A\u007FB\u0085C', '"A\\u007FB\\u0085C"\n'],
    ['A\u2028B\u2029C', '"A\\u2028B\\u2029C"\n'],
    ['A\u202EB\u2066C', '"A\\u202EB\\u2066C"\n'],
    ['\uFEFFABC', '"\\uFEFFABC"\n'],
    ['\u{1F600}', '"\u{1F600}"\n'],
    ['\u3042', '"\u3042"\n']
  ];
  const outputs = [];
  for (const [secret, expected] of cases) {
    const result = run(sharesFor(secret).slice(0, 2));
    success(result);
    assert.deepEqual(result.stdout, Buffer.from(expected, 'utf8'));
    assert.equal(JSON.parse(result.stdout.toString('utf8')), secret);
    outputs.push(result.stdout.toString('utf8'));
  }
  assert.notEqual(outputs[0], outputs[2]);
  assert.notEqual(outputs[0], outputs[3]);
});

test('Python piped output remains UTF-8 when the text stream is configured as CP932', options, () => {
  const secret = '\u{1F600}\u3042';
  const result = run(sharesFor(secret).slice(0, 2), [], { PYTHONIOENCODING: 'cp932', PYTHONUTF8: '0' });
  success(result);
  assert.deepEqual(result.stdout, Buffer.from('"' + secret + '"\n', 'utf8'));
});

test('Python --raw preserves exact UTF-8, BOM, controls and the original final newline', options, () => {
  const cases = ['plain', 'A\nB', 'A\tB', 'A\\u000AB', 'A\\nB', '\uFEFFABC',
    '\u{1F600}', 'A\u0000\u0085\u2028\u2029\u202E\u2066B', 'ends with newline\n', '\u{1F600}'.repeat(64)];
  for (const secret of cases) {
    const result = run(sharesFor(secret).slice(0, 2), ['--raw'], { PYTHONIOENCODING: 'cp932', PYTHONUTF8: '0' });
    success(result);
    assert.deepEqual(result.stdout, Buffer.from(secret, 'utf8'));
  }
});

test('Python default output retains hexadecimal bytes and BIP-39 word/entropy output', options, () => {
  const bytes = run(sharesFor(Uint8Array.of(0, 127, 255), 2).slice(0, 2));
  success(bytes);
  assert.deepEqual(bytes.stdout, Buffer.from('007FFF\n', 'utf8'));
  const phrase = 'abandon '.repeat(11) + 'about';
  const bip39 = run(sharesFor(new Uint8Array(16), 3).slice(0, 2));
  success(bip39);
  assert.deepEqual(bip39.stdout, Buffer.from(phrase + '\nEntropy (hex): ' + '00'.repeat(16) + '\n', 'utf8'));
});

test('Python --raw rejects nontext secrets without writing restored data', options, () => {
  for (const [type, secret] of [[2, Uint8Array.of(0, 127, 255)], [3, new Uint8Array(16)]]) {
    failure(run(sharesFor(secret, type).slice(0, 2), ['--raw']), /--raw requires a text secret/);
  }
});

test('Python invalid shares and malformed text fail without stdout in both output modes', options, () => {
  const shares = sharesFor('synthetic test secret');
  const broken = shares[1].slice(0, -1) + (shares[1].endsWith('0') ? '1' : '0');
  for (const args of [[], ['--raw']]) {
    failure(run([shares[0], broken], args), /Restore failed: CRC/);
    failure(run([shares[0]], args), /Restore failed: need 1 more shares/);
    failure(run(sharesFor(Uint8Array.of(255), 1).slice(0, 2), args), /Restore failed: .*utf-8/);
  }
  failure(run(shares.slice(0, 2), ['--unknown-output']), /unrecognized arguments/);
});
