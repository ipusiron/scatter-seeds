/* Scatter Seeds - MIT (c) 2026 ipusiron. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const stored = key => { try { return localStorage.getItem('scatter-seeds.' + key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem('scatter-seeds.' + key, value); } catch (_) { /* storage unavailable */ } };
  const langParam = new URLSearchParams(location.search).get('lang');
  let language = ['ja', 'en'].includes(langParam) ? langParam : stored('language') || (navigator.language.startsWith('ja') ? 'ja' : 'en');
  let theme = stored('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const tabs = ['split', 'restore', 'guide'];
  let active = 'split';
  let shares = [];
  let shareMeta = null;
  let splitGeneration = 0;
  const t = key => ScatterMessages[language][key];
  function render() {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.label)); });
    $('language').textContent = language === 'ja' ? 'EN' : '日';
    tabs.forEach(name => {
      const selected = name === active;
      $('tab-' + name).setAttribute('aria-selected', String(selected));
      $('tab-' + name).tabIndex = selected ? 0 : -1;
      $('panel-' + name).hidden = !selected;
    });
    renderThreshold();
    if (shares.length) renderCards();
  }
  tabs.forEach((name, index) => {
    const button = $('tab-' + name);
    button.addEventListener('click', () => { active = name; render(); });
    button.addEventListener('keydown', event => {
      const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!delta && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + delta + tabs.length) % tabs.length;
      $('tab-' + tabs[next]).focus(); $('tab-' + tabs[next]).click();
    });
  });
  $('theme').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; save('theme', theme); render(); });
  $('language').addEventListener('click', () => { language = language === 'ja' ? 'en' : 'ja'; save('language', language); render(); });
  $('help').addEventListener('click', () => $('help-dialog').showModal());
  $('help-close').addEventListener('click', () => $('help-dialog').close());
  function renderThreshold() {
    const k = Number($('split-k').value), n = Number($('split-n').value);
    $('threshold-hint').textContent = Number.isInteger(k) && Number.isInteger(n) && k >= 2 && n >= k && n <= 16
      ? t('thresholdHint')(n - k, k - 1) + (k === n ? ' ' + t('thresholdAll') : '') : t('invalidThreshold');
    $('bip39-note').hidden = $('secret-kind').value !== 'bip39';
  }
  for (const id of ['split-k', 'split-n', 'secret-kind']) $(id).addEventListener('input', renderThreshold);
  function readSecret() {
    const raw = $('secret-input').value, kind = $('secret-kind').value;
    let secret, type;
    if (kind === 'text') { type = 1; secret = new TextEncoder().encode(raw); }
    else if (kind === 'bytes') {
      if (!raw.trim() || !/^(?:[0-9a-f]{2})+$/i.test(raw.trim())) throw new Error(t('invalidHex'));
      type = 2; secret = ScatterCore.unhex(raw.trim());
    } else {
      type = 3;
      try { secret = ScatterBIP39.mnemonicToEntropy(raw); }
      catch (error) { throw new Error(error.word ? t('unknownWord')(error.word, error.suggestions) : t('invalidBip39')); }
    }
    if (secret.length < 1 || secret.length > 256) throw new Error(t('invalidSecret'));
    return { type, secret };
  }
  const yieldFrame = () => new Promise(resolve => setTimeout(resolve, 0));
  function discardShares() {
    shares = []; shareMeta = null;
    $('share-cards').replaceChildren(); $('print-controls').hidden = true;
    $('instruction-page').hidden = true;
  }
  async function splitSecret() {
    const generation = ++splitGeneration;
    discardShares(); $('split-status').textContent = '';
    $('split-progress').hidden = true;
    let candidates;
    try {
      if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') throw new Error(t('noRandom'));
      const k = Number($('split-k').value), n = Number($('split-n').value);
      if (!Number.isInteger(k) || !Number.isInteger(n) || !(2 <= k && k <= n && n <= 16)) throw new Error(t('invalidThreshold'));
      const label = $('share-label').value;
      if ([...label].length > 40) throw new Error(t('invalidLabel'));
      const { type, secret } = readSecret();
      const setId = crypto.getRandomValues(new Uint8Array(4));
      candidates = ScatterCore.split(type, secret, k, n, count => crypto.getRandomValues(new Uint8Array(count)), setId);
      const subsets = ScatterCore.combinations(n, k);
      $('split-button').disabled = true;
      $('split-progress').hidden = false;
      $('progress-bar').max = subsets.length;
      for (let i = 0; i < subsets.length; i++) {
        if (generation !== splitGeneration) return;
        const result = ScatterCore.combine(subsets[i].map(index => candidates[index]));
        if (!result.fingerprintOk || result.inconsistent.length || result.type !== type ||
            result.S.length !== secret.length || result.S.some((b, j) => b !== secret[j])) throw new Error(t('verificationFailed'));
        if (i % 32 === 31 || i === subsets.length - 1) {
          $('progress-bar').value = i + 1;
          $('progress-text').textContent = t('verifying')(i + 1, subsets.length);
          await yieldFrame();
        }
      }
      if (generation !== splitGeneration) return;
      shares = candidates;
      shareMeta = { k, n, setId: ScatterCore.hex(setId), label, date: $('print-date').value };
      renderCards(); $('print-controls').hidden = false;
      $('split-status').textContent = t('verified')(subsets.length);
    } catch (error) {
      discardShares(); $('split-status').textContent = error.message || t('verificationFailed');
    } finally {
      if (generation === splitGeneration) { $('split-button').disabled = false; $('split-progress').hidden = true; }
      if (!shares.length) candidates = null;
    }
  }
  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function renderCards() {
    const root = $('share-cards'); root.replaceChildren();
    shares.forEach((share, index) => {
      const card = element('article', 'certificate');
      const head = element('div', 'certificate-head');
      head.append(element('h3', '', 'Scatter Seeds'), element('span', 'certificate-number', t('shareHeading')(index + 1, shareMeta.n)));
      card.append(head, element('p', '', 'v1 · ' + t('restoreCount')(shareMeta.k)));
      const seal = element('p', 'seal', t('setId') + ' · ' + shareMeta.setId);
      card.append(seal);
      if (shareMeta.date) card.append(element('p', '', shareMeta.date));
      if (shareMeta.label) card.append(element('p', '', shareMeta.label));
      card.append(element('p', 'share-string', 'SSS1- ' + ScatterCore.group4(share)));
      const qr = element('img', 'qr-image');
      qr.alt = 'QR · ' + t('shareHeading')(index + 1, shareMeta.n);
      qr.src = ScatterQR.make(share).createDataURL(3, 8);
      card.append(qr, element('p', '', t('printHelp')),
        element('p', 'url', 'https://ipusiron.github.io/scatter-seeds/'));
      const actions = element('div', 'card-actions');
      const copy = element('button', '', t('copy')); copy.type = 'button';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(share); $('split-status').textContent = t('copied'); }
        catch (_) { $('split-status').textContent = t('copyFailed'); }
      });
      actions.append(copy); card.append(actions); root.append(card);
    });
  }
  $('split-button').addEventListener('click', splitSecret);
  $('clear-split').addEventListener('click', () => {
    splitGeneration++; discardShares();
    $('secret-input').value = ''; $('share-label').value = ''; $('print-date').value = '';
    $('split-status').textContent = t('clipboardNote'); $('split-progress').hidden = true;
    $('split-button').disabled = false;
  });
  $('print-instructions').addEventListener('change', () => { $('instruction-page').hidden = !$('print-instructions').checked; });
  $('print-button').addEventListener('click', () => window.print());
  render();
}());
