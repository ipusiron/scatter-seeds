'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const C = require('../sss-core.js');
const B = require('../bip39.js');
const W = require('../bip39-english.js');
const qrcode = require('../vendor/qrcode.min.js');
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/vectors.json'), 'utf8'));
const rand = () => { let i = 0; return count => Uint8Array.from({ length: count }, () => (37 * i++ + 11) & 255); };
const text = 'Scatter Seeds';
const zero = 'abandon '.repeat(11) + 'about';
const middle = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
const full = 'zoo '.repeat(23) + 'vote';

test('A: branchless GF multiplication equals bitwise reference for 65,536 pairs', () => {
  const bitwise = (a, b) => {
    let value = 0, x = a, y = b;
    while (y) { if (y & 1) value ^= x; x = ((x << 1) ^ ((x & 128) ? 0x11b : 0)) & 255; y >>>= 1; }
    return value;
  };
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) assert.equal(C.mul256(a, b), bitwise(a, b));
});
test('A: all nonzero bytes have inverses', () => {
  for (let a = 1; a < 256; a++) assert.equal(C.mul256(a, C.inv256(a)), 1);
  assert.throws(() => C.inv256(0));
});
test('B: CRC-32 check value and reference vectors', () => {
  assert.equal(C.crc32(new TextEncoder().encode('123456789')).toString(16), V.checks.crc32_123456789);
  for (const v of V.vectors) {
    const shares = C.split(v.type, C.unhex(v.S_hex), v.k, v.n, rand(), C.unhex('5EED1234'));
    assert.deepEqual(shares, v.shares, v.name);
    assert.deepEqual(shares.map(s => s.length), v.lengths);
    assert.equal(C.hex(C.buildM(v.type, C.unhex(v.S_hex))), v.M_hex);
    const back = C.combine(shares.slice(0, v.k));
    assert.equal(C.hex(back.S), v.S_hex.toUpperCase()); assert.equal(back.fingerprintOk, v.roundtrip);
  }
});
test('B: formula, tolerant parse and strict field checks', () => {
  for (const row of V.lengthFormula) {
    const actual = C.split(2, new Uint8Array(row.L), 2, 2, rand(), C.unhex('5EED1234'))[0];
    assert.equal(actual.length, row.chars); assert.equal(actual.length, row.formula);
  }
  const first = V.vectors[0].shares[0];
  assert.equal(C.parseShare(first.toLowerCase()).x, 1);
  assert.equal(C.parseShare('sss1 ' + C.group4(first)).x, 1);
  assert.throws(() => C.parseShare(first.replace('SSS1', 'ABC1')), /prefix/);
  assert.throws(() => C.parseShare(first.slice(0, -1) + 'X'), /hex/);
  assert.throws(() => C.parseShare(first.slice(0, -2)), /crc|length/);
  const p = C.parseShare(first);
  assert.throws(() => C.encodeShare({ ...p, setId: C.unhex(p.setId), x: 0 }), /share/);
  assert.throws(() => C.split(2, new Uint8Array(1), 1, 3, rand(), C.unhex('5EED1234')), /invalid/);
});
test('C: reference error cases, including CRC, set and fingerprint', () => {
  const [a, b, c] = V.vectors[0].shares;
  assert.equal(C.combine([a]).need, 1);
  assert.throws(() => C.combine([a, b.slice(0, -1) + (b.endsWith('0') ? '1' : '0')]), /crc/);
  assert.throws(() => C.combine([a, a]), /dup x/);
  assert.equal(C.combine([a.toLowerCase(), 'sss1 ' + C.group4(b)]).fingerprintOk, true);
  assert.deepEqual(C.combine([a, b, c]).inconsistent, []);
  const p = C.parseShare(b); p.data[3] ^= 1;
  const forged = C.encodeShare({ ...p, setId: C.unhex(p.setId) });
  assert.equal(C.combine([a, forged]).fingerprintOk, false);
  const p3 = C.parseShare(c); p3.data[0] ^= 1;
  const forged3 = C.encodeShare({ ...p3, setId: C.unhex(p3.setId) });
  assert.deepEqual(C.combine([a, b, forged3]).inconsistent, [3]);
  const x0 = C.unhex(b.slice(5)); x0[7] = 0;
  const rebuilt = C.PREFIX + C.hex(x0.slice(0, -4)) + C.crc32(x0.slice(0, -4)).toString(16).padStart(8, '0').toUpperCase();
  assert.throws(() => C.parseShare(rebuilt), /x=0/);
  const other = C.split(1, new TextEncoder().encode(text), 2, 3, rand(), C.unhex('0BADF00D'));
  assert.throws(() => C.combine([a, other[1]]), /setId/);
});
test('D: official BIP-39 values, full words, checksum and word list', () => {
  assert.equal(W.length, V.checks.words);
  const reference = fs.readFileSync(path.join(__dirname, 'fixtures/bip39-english.txt'));
  assert.equal(crypto.createHash('sha256').update(reference).digest('hex'), '2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda');
  assert.deepEqual(W, reference.toString('utf8').trim().split(/\s+/));
  const pairs = [[V.checks.bip39_official[0].e, zero], [V.checks.bip39_official[1].e, middle], [V.checks.bip39_official[2].e, full]];
  for (const [hex, mnemonic] of pairs) {
    assert.equal(B.entropyToMnemonic(C.unhex(hex)), mnemonic);
    assert.equal(C.hex(B.mnemonicToEntropy(mnemonic)), hex.toUpperCase());
  }
  assert.throws(() => B.mnemonicToEntropy('abandon '.repeat(12)), /checksum/);
  assert.throws(() => B.mnemonicToEntropy(zero.replace('about', 'abou')), /unknown word/);
  assert.ok(B.suggest('abou').includes('about'));
  assert.deepEqual(B.suggest('x'.repeat(10000)), []);
  for (const length of [16, 20, 24, 28, 32]) {
    const entropy = crypto.randomBytes(length);
    assert.deepEqual(B.mnemonicToEntropy(B.entropyToMnemonic(entropy)), new Uint8Array(entropy));
  }
});
test('E: every threshold subset restores random secrets', () => {
  for (const [k, n, length] of [[2, 3, 1], [3, 5, 20], [4, 6, 64], [2, 4, 256]]) {
    const secret = crypto.randomBytes(length);
    const shares = C.split(2, secret, k, n, crypto.randomBytes, crypto.randomBytes(4));
    for (const indices of C.combinations(n, k)) {
      const result = C.combine(indices.map(i => shares[i]));
      assert.equal(result.fingerprintOk, true); assert.deepEqual(result.S, new Uint8Array(secret));
    }
  }
  assert.equal(C.combinations(16, 8).length, V.maxSubsets);
});
test('B: QR alphanumeric versions match every reference capacity row', () => {
  for (const [index, row] of V.qr.entries()) {
    // The reference generator uses L as its error-correction key, overwriting the input length.
    const secretLength = [16, 32, 64, 128, 256][index];
    const share = C.split(2, new Uint8Array(secretLength), 2, 2, rand(), C.unhex('5EED1234'))[0];
    assert.equal(share.length, row.chars);
    for (const level of ['L', 'M', 'Q', 'H']) {
      const qr = qrcode(0, level); qr.addData(share, 'Alphanumeric'); qr.make();
      assert.equal(qr.getModuleCount(), row[level]);
      assert.equal((qr.getModuleCount() - 17) / 4, row[level + '_ver']);
    }
  }
});

