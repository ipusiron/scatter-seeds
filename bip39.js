/* Scatter Seeds - MIT (c) 2026 ipusiron. English BIP-39 conversion. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./sha256-core.js'), require('./bip39-english.js'));
  else root.ScatterBIP39 = factory(root.SHA256ByteCore, root.BIP39English);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (SHA, WORDS) {
  'use strict';
  const INDEX = new Map(WORDS.map((word, i) => [word, i]));
  const LENGTHS = [16, 20, 24, 28, 32];
  const words = () => WORDS;
  function suggest(word) {
    const prefix = word.slice(0, 4);
    const close = WORDS.filter(w => w.startsWith(prefix));
    if (close.length) return close.slice(0, 5);
    const distance = (a, b) => {
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) {
        let diagonal = row[0]; row[0] = i;
        for (let j = 1; j <= b.length; j++) {
          const prior = row[j];
          row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
          diagonal = prior;
        }
      }
      return row[b.length];
    };
    return WORDS.map(w => ({ w, d: distance(word, w) })).filter(v => v.d <= 2)
      .sort((a, b) => a.d - b.d || a.w.localeCompare(b.w)).slice(0, 5).map(v => v.w);
  }
  function entropyToMnemonic(entropy) {
    if (!(entropy instanceof Uint8Array) || !LENGTHS.includes(entropy.length)) throw new RangeError('entropy length');
    const checksumLength = entropy.length / 4;
    const bits = Array.from(entropy, b => b.toString(2).padStart(8, '0')).join('') +
      Array.from(SHA.hash(entropy).digest, b => b.toString(2).padStart(8, '0')).join('').slice(0, checksumLength);
    return bits.match(/.{11}/g).map(chunk => WORDS[parseInt(chunk, 2)]).join(' ');
  }
  function mnemonicToEntropy(mnemonic) {
    if (typeof mnemonic !== 'string') throw new TypeError('mnemonic');
    const pieces = mnemonic.normalize('NFKD').trim().toLowerCase().split(/\s+/);
    if (![12, 15, 18, 21, 24].includes(pieces.length)) throw new Error('word count');
    const indexes = pieces.map(word => {
      const index = INDEX.get(word);
      if (index === undefined) {
        const error = new Error('unknown word: ' + word);
        error.word = word; error.suggestions = suggest(word);
        throw error;
      }
      return index;
    });
    const bits = indexes.map(index => index.toString(2).padStart(11, '0')).join('');
    const checksumLength = pieces.length / 3;
    const entropyBits = bits.slice(0, -checksumLength);
    const entropy = Uint8Array.from(entropyBits.match(/.{8}/g), chunk => parseInt(chunk, 2));
    const wanted = Array.from(SHA.hash(entropy).digest, b => b.toString(2).padStart(8, '0')).join('').slice(0, checksumLength);
    if (bits.slice(-checksumLength) !== wanted) throw new Error('checksum');
    return entropy;
  }
  return Object.freeze({ words, suggest, entropyToMnemonic, mnemonicToEntropy });
}));
