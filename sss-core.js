/* Scatter Seeds - MIT (c) 2026 ipusiron. Secret sharing and format v1. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./sha256-core.js'));
  else root.ScatterCore = factory(root.SHA256ByteCore);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (SHA) {
  'use strict';
  const TYPE = Object.freeze({ TEXT: 1, BYTES: 2, BIP39: 3 });
  const VERSION = 1;
  const PREFIX = 'SSS1-';
  const MAX_SECRET = 256;

  // GF(2^8) arithmetic copied from Day123 gf-core.js, without GF(p) or tables.
  function mul256(a, b) {
    let result = 0, x = a & 255, y = b & 255;
    for (let i = 0; i < 8; i++) {
      result ^= x & -(y & 1);
      const carry = (x >>> 7) & 1;
      x = ((x << 1) & 255) ^ (0x1b & -carry);
      y >>>= 1;
    }
    return result;
  }
  function pow256(a, exponent) {
    let result = 1, base = a;
    for (let i = 0; i < 8; i++) {
      const factor = (exponent >>> i) & 1;
      const product = mul256(result, base);
      result ^= (result ^ product) & -factor;
      base = mul256(base, base);
    }
    return result;
  }
  function inv256(a) { if (!a) throw new RangeError('zero has no inverse'); return pow256(a, 254); }
  const div256 = (a, b) => mul256(a, inv256(b));
  const eval256 = (coefficients, x) => coefficients.reduceRight((v, c) => mul256(v, x) ^ c, 0);
  function split256(secretBytes, k, n, randomBytes) {
    if (!(secretBytes instanceof Uint8Array) || !Number.isInteger(k) || k < 2 || !Number.isInteger(n) || n < k || n > 16 || typeof randomBytes !== 'function')
      throw new RangeError('invalid split input');
    const shares = Array.from({ length: n }, (_, i) => ({ x: i + 1, y: new Uint8Array(secretBytes.length) }));
    secretBytes.forEach((byte, index) => {
      const drawn = randomBytes(k - 1);
      if (!(drawn instanceof Uint8Array) || drawn.length !== k - 1) throw new RangeError('random byte source failed');
      const coefficients = [byte, ...drawn];
      shares.forEach(share => { share.y[index] = eval256(coefficients, share.x); });
    });
    return shares;
  }
  function validateShares256(shares, k) {
    if (!Array.isArray(shares) || !Number.isInteger(k) || k < 2 || shares.length < k) throw new RangeError('insufficient shares');
    const length = shares[0].y && shares[0].y.length, xs = new Set();
    for (const share of shares) {
      if (!Number.isInteger(share.x) || share.x < 1 || share.x > 16 || xs.has(share.x) || !(share.y instanceof Uint8Array) || share.y.length !== length)
        throw new RangeError('invalid or duplicate share');
      xs.add(share.x);
    }
  }
  function lagrange256(shares) {
    return shares.map((share, i) => {
      let numerator = 1, denominator = 1;
      shares.forEach((other, j) => { if (i !== j) {
        numerator = mul256(numerator, other.x);
        denominator = mul256(denominator, other.x ^ share.x);
      }});
      return { x: share.x, numerator, denominator, inverse: inv256(denominator), lambda: div256(numerator, denominator) };
    });
  }
  function combine256(shares, k) {
    validateShares256(shares, k);
    const terms = lagrange256(shares), out = new Uint8Array(shares[0].y.length);
    out.forEach((_, byte) => { out[byte] = shares.reduce((value, share, i) => value ^ mul256(terms[i].lambda, share.y[byte]), 0); });
    return { terms, out };
  }
  function evaluateAt(shares, x) {
    const out = new Uint8Array(shares[0].y.length);
    for (let i = 0; i < shares.length; i++) {
      let numerator = 1, denominator = 1;
      for (let j = 0; j < shares.length; j++) if (i !== j) {
        numerator = mul256(numerator, x ^ shares[j].x);
        denominator = mul256(denominator, shares[i].x ^ shares[j].x);
      }
      const factor = div256(numerator, denominator);
      for (let b = 0; b < out.length; b++) out[b] ^= mul256(shares[i].y[b], factor);
    }
    return out;
  }
  const CRC_TABLE = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[n] = c >>> 0;
  }
  function crc32(bytes) {
    let c = 0xffffffff;
    for (const b of bytes) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  function unhex(value) {
    if (typeof value !== 'string' || value.length % 2 || !/^[0-9a-f]*$/i.test(value)) throw new Error('hex');
    return Uint8Array.from(value.match(/../g) || [], pair => parseInt(pair, 16));
  }
  function buildM(type, secret) {
    if (![1, 2, 3].includes(type) || !(secret instanceof Uint8Array) || !secret.length || secret.length > MAX_SECRET)
      throw new RangeError('secret');
    const typed = new Uint8Array(1 + secret.length);
    typed[0] = type; typed.set(secret, 1);
    const m = new Uint8Array(typed.length + 4);
    m.set(typed); m.set(SHA.hash(typed).digest.slice(0, 4), typed.length);
    return m;
  }
  function encodeShare({ setId, k, n, x, data }) {
    if (!(setId instanceof Uint8Array) || setId.length !== 4 || !(data instanceof Uint8Array) || data.length < 6 || data.length > MAX_SECRET + 5 ||
        !Number.isInteger(k) || !Number.isInteger(n) || !Number.isInteger(x) || k < 2 || k > n || n > 16 || x < 1 || x > n)
      throw new RangeError('share');
    const body = new Uint8Array(8 + data.length);
    body[0] = VERSION; body.set(setId, 1); body.set([k, n, x], 5); body.set(data, 8);
    const crc = crc32(body), all = new Uint8Array(body.length + 4);
    all.set(body); all.set([crc >>> 24, crc >>> 16, crc >>> 8, crc], body.length);
    return PREFIX + hex(all);
  }
  function parseShare(raw) {
    if (typeof raw !== 'string') throw new Error('prefix');
    const s = raw.replace(/[\s-]/g, '').toUpperCase();
    if (!s.startsWith('SSS1')) throw new Error('prefix');
    const bodyHex = s.slice(4), bytes = unhex(bodyHex);
    if (bytes.length < 18 || bytes.length > MAX_SECRET + 17) throw new Error('length');
    const body = bytes.slice(0, -4);
    const stored = ((bytes.at(-4) << 24) | (bytes.at(-3) << 16) | (bytes.at(-2) << 8) | bytes.at(-1)) >>> 0;
    if (crc32(body) !== stored) throw new Error('crc');
    if (body[0] !== VERSION) throw new Error('version');
    const setId = hex(body.slice(1, 5)), k = body[5], n = body[6], x = body[7], data = body.slice(8);
    if (x === 0) throw new Error('x=0');
    if (!(2 <= k && k <= n && n <= 16)) throw new Error('k/n');
    if (x > n) throw new Error('x>n');
    return { setId, k, n, x, data };
  }
  function split(type, secret, k, n, randomBytes, setId) {
    if (!(setId instanceof Uint8Array) || setId.length !== 4) throw new RangeError('setId');
    const m = buildM(type, secret);
    return split256(m, k, n, randomBytes).map(share => encodeShare({ setId, k, n, x: share.x, data: share.y }));
  }
  function combine(raws) {
    if (!Array.isArray(raws) || !raws.length) return { need: null, parsed: [], inconsistent: [] };
    const parsed = raws.map(parseShare), first = parsed[0], xs = new Set();
    for (const p of parsed) {
      if (p.setId !== first.setId) throw new Error('setId');
      if (p.k !== first.k || p.n !== first.n) throw new Error('k/n mismatch');
      if (p.data.length !== first.data.length) throw new Error('length mismatch');
      if (xs.has(p.x)) throw new Error('dup x');
      xs.add(p.x);
    }
    if (parsed.length < first.k) return { need: first.k - parsed.length, parsed, inconsistent: [] };
    const base = parsed.slice(0, first.k).map(p => ({ x: p.x, y: p.data }));
    const m = combine256(base, first.k).out;
    const typed = m.slice(0, -4), fp = m.slice(-4);
    const expected = SHA.hash(typed).digest.slice(0, 4);
    const fingerprintOk = fp.every((value, i) => value === expected[i]);
    const inconsistent = parsed.slice(first.k).filter(p => {
      const predicted = evaluateAt(base, p.x);
      return predicted.some((value, i) => value !== p.data[i]);
    }).map(p => p.x);
    return { type: typed[0], S: typed.slice(1), fingerprintOk, inconsistent, parsed, setId: first.setId };
  }
  function combinations(n, k) {
    const out = [], current = [];
    function visit(next) {
      if (current.length === k) { out.push([...current]); return; }
      for (let i = next; i <= n - (k - current.length); i++) { current.push(i); visit(i + 1); current.pop(); }
    }
    visit(0);
    return out;
  }
  const group4 = value => value.slice(PREFIX.length).match(/.{1,4}/g).join(' ');
  return Object.freeze({ TYPE, VERSION, PREFIX, MAX_SECRET, mul256, inv256, div256, eval256, split256,
    validateShares256, lagrange256, combine256, evaluateAt, crc32, hex, unhex, buildM, encodeShare, parseShare,
    split, combine, combinations, group4 });
}));
