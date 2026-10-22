'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

function vars(selector) {
  const start = css.indexOf(selector + ' {');
  assert.ok(start >= 0, selector);
  const block = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)]
    .map(match => [match[1], match[2]]));
}
function luminance(hex) {
  const digits = hex.slice(1);
  const values = (digits.length === 3 ? [...digits].map(c => c + c) : digits.match(/../g))
    .map(pair => parseInt(pair, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function ratio(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
test('light and dark text colors reach at least 4.5:1', () => {
  for (const selector of [':root', ':root[data-theme="dark"]']) {
    const color = vars(selector);
    for (const [foreground, background] of [['--ink', '--paper'], ['--ink', '--card'],
      ['--muted', '--card'], ['--button-ink', '--button'], ['--line', '--card']]) {
      const measured = ratio(color[foreground], color[background]);
      assert.ok(measured >= 4.5, `${selector} ${foreground}/${background} ${measured.toFixed(2)}`);
    }
  }
});
