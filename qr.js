/* Scatter Seeds - MIT (c) 2026 ipusiron. QR browser adapters. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScatterQR = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function make(value) {
    const qr = qrcode(0, 'M');
    qr.addData(value, 'Alphanumeric'); qr.make();
    return qr;
  }
  function scan(data, width, height) { return jsQR(data, width, height, { inversionAttempts: 'dontInvert' }); }
  return Object.freeze({ make, scan });
}));
