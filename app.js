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
  let splitMessage = null;
  let restoreRows = [];
  let restored = null;
  let restoreMessage = null;
  let cameraMessage = null;
  let revealed = false;
  let cameraStream = null;
  let cameraFrame = null;
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
    if (splitMessage) setSplitMessage(splitMessage.key, splitMessage.args);
    renderGuideThreshold();
    renderRestoration();
    if (cameraMessage) $('camera-status').textContent = t(cameraMessage);
  }
  tabs.forEach((name, index) => {
    const button = $('tab-' + name);
    button.addEventListener('click', () => { if (name !== 'restore') stopCamera(); active = name; render(); });
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
      if (!raw.trim() || !/^(?:[0-9a-f]{2})+$/i.test(raw.trim())) throw taggedError('invalidHex');
      type = 2; secret = ScatterCore.unhex(raw.trim());
    } else {
      type = 3;
      try { secret = ScatterBIP39.mnemonicToEntropy(raw); }
      catch (error) { throw error.word ? taggedError('unknownWord', [error.word, error.suggestions]) : taggedError('invalidBip39'); }
    }
    if (secret.length < 1 || secret.length > 256) throw taggedError('invalidSecret');
    return { type, secret };
  }
  function taggedError(key, args) { const error = new Error(key); error.key = key; error.args = args || []; return error; }
  function setSplitMessage(key, args) {
    splitMessage = { key, args: args || [] };
    const value = t(key);
    $('split-status').textContent = typeof value === 'function' ? value(...splitMessage.args) : value;
  }
  const yieldFrame = () => new Promise(resolve => setTimeout(resolve, 0));
  function discardShares() {
    shares = []; shareMeta = null;
    $('share-cards').replaceChildren(); $('print-controls').hidden = true;
    $('instruction-page').hidden = true;
  }
  async function splitSecret() {
    const generation = ++splitGeneration;
    discardShares(); splitMessage = null; $('split-status').textContent = '';
    $('split-progress').hidden = true;
    let candidates;
    try {
      if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') throw taggedError('noRandom');
      const k = Number($('split-k').value), n = Number($('split-n').value);
      if (!Number.isInteger(k) || !Number.isInteger(n) || !(2 <= k && k <= n && n <= 16)) throw taggedError('invalidThreshold');
      const label = $('share-label').value;
      if ([...label].length > 40) throw taggedError('invalidLabel');
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
            result.S.length !== secret.length || result.S.some((b, j) => b !== secret[j])) throw taggedError('verificationFailed');
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
      setSplitMessage('verified', [subsets.length]);
    } catch (error) {
      discardShares(); setSplitMessage(error.key || 'verificationFailed', error.args);
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
        try { await navigator.clipboard.writeText(share); setSplitMessage('copied'); }
        catch (_) { setSplitMessage('copyFailed'); }
      });
      actions.append(copy); card.append(actions); root.append(card);
    });
  }
  $('split-button').addEventListener('click', splitSecret);
  $('clear-split').addEventListener('click', () => {
    splitGeneration++; discardShares();
    $('secret-input').value = ''; $('share-label').value = ''; $('print-date').value = '';
    setSplitMessage('clipboardNote'); $('split-progress').hidden = true;
    $('split-button').disabled = false;
  });
  $('print-instructions').addEventListener('change', () => { $('instruction-page').hidden = !$('print-instructions').checked; });
  $('print-button').addEventListener('click', () => window.print());
  function renderGuideThreshold() {
    const k = Number($('guide-k').value), n = Number($('guide-n').value);
    $('guide-threshold').textContent = Number.isInteger(k) && Number.isInteger(n) && 2 <= k && k <= n && n <= 16
      ? t('thresholdHint')(n - k, k - 1) + (k === n ? ' ' + t('thresholdAll') : '') : t('invalidThreshold');
  }
  $('guide-k').addEventListener('input', renderGuideThreshold);
  $('guide-n').addEventListener('input', renderGuideThreshold);
  function setRestoreMessage(key, args) {
    restoreMessage = { key, args: args || [] };
    const value = t(key);
    $('restore-status').textContent = typeof value === 'function' ? value(...restoreMessage.args) : value;
  }
  function renderRestoration() {
    if (restoreMessage) setRestoreMessage(restoreMessage.key, restoreMessage.args);
    const body = $('check-rows'); body.replaceChildren();
    $('check-table').hidden = restoreRows.length === 0;
    for (const row of restoreRows) {
      const tr = document.createElement('tr');
      [row.index, ...row.cells].forEach((cell, i) => {
        const td = document.createElement('td');
        td.dataset.label = [t('shareColumn'), t('formatColumn'), 'CRC', t('setColumn'), 'k / n', 'x'][i];
        td.textContent = i === 0 ? String(cell) : t(cell);
        tr.append(td);
      });
      body.append(tr);
    }
    $('restored').hidden = !restored;
    $('restored-value').hidden = !revealed;
    $('restored-mask').hidden = revealed;
    $('reveal').textContent = t(revealed ? 'conceal' : 'reveal');
    if (restored && revealed) $('restored-value').textContent = formatRestored(restored);
  }
  function formatRestored(result) {
    if (result.type === 1) {
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(result.S);
      return decoded.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,
        ch => '\\u' + ch.codePointAt(0).toString(16).padStart(4, '0').toUpperCase());
    }
    if (result.type === 2) return ScatterCore.hex(result.S);
    const phrase = ScatterBIP39.entropyToMnemonic(result.S).split(' ');
    return phrase.map((word, i) => `${String(i + 1).padStart(2, '0')}. ${word}`).join('\n') +
      '\n\n' + t('entropyHex') + ': ' + ScatterCore.hex(result.S);
  }
  function checkShareRows(lines) {
    const parsed = [], rows = [], xs = new Set();
    let first = null, invalid = false;
    for (let i = 0; i < lines.length; i++) {
      let p, error = null;
      try { p = ScatterCore.parseShare(lines[i]); } catch (caught) { error = caught.message; }
      const cells = ['pending', 'pending', 'pending', 'pending', 'pending'];
      if (error) {
        invalid = true;
        if (error === 'crc') { cells[0] = 'ok'; cells[1] = 'bad'; }
        else if (error === 'x=0' || error === 'x>n') { cells[0] = 'ok'; cells[1] = 'ok'; cells[4] = 'bad'; }
        else if (error === 'k/n') { cells[0] = 'ok'; cells[1] = 'ok'; cells[3] = 'bad'; }
        else { cells[0] = 'bad'; }
      } else {
        cells[0] = 'ok'; cells[1] = 'ok';
        if (!first) first = p;
        cells[2] = p.setId === first.setId ? 'ok' : 'bad';
        cells[3] = p.k === first.k && p.n === first.n && p.data.length === first.data.length ? 'ok' : 'bad';
        cells[4] = xs.has(p.x) ? 'duplicate' : 'ok';
        if (cells.slice(2).some(cell => cell !== 'ok')) invalid = true;
        xs.add(p.x); parsed.push(p);
      }
      rows.push({ index: i + 1, cells });
    }
    return { rows, parsed, invalid };
  }
  function restoreSecret() {
    restored = null; revealed = false;
    const lines = $('restore-input').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) { restoreRows = []; setRestoreMessage('noShares'); renderRestoration(); return; }
    const checked = checkShareRows(lines);
    restoreRows = checked.rows;
    if (checked.invalid) { setRestoreMessage('mixed'); renderRestoration(); return; }
    let result;
    try { result = ScatterCore.combine(lines); }
    catch (_) { setRestoreMessage('mixed'); renderRestoration(); return; }
    if (result.need) { setRestoreMessage('need', [result.need]); renderRestoration(); return; }
    if (!result.fingerprintOk) { setRestoreMessage('fingerprintBad'); renderRestoration(); return; }
    if (![1, 2, 3].includes(result.type)) { setRestoreMessage('badType'); renderRestoration(); return; }
    try { formatRestored(result); }
    catch (_) { setRestoreMessage(result.type === 1 ? 'badText' : 'badType'); renderRestoration(); return; }
    restored = result;
    setRestoreMessage(result.inconsistent.length ? 'inconsistent' : 'restoredReady',
      result.inconsistent.length ? [result.inconsistent] : []);
    renderRestoration();
  }
  $('restore-button').addEventListener('click', restoreSecret);
  $('reveal').addEventListener('click', () => { revealed = !revealed; renderRestoration(); });
  $('clear-restore').addEventListener('click', () => {
    stopCamera(); $('restore-input').value = ''; restoreRows = []; restored = null; revealed = false;
    restoreMessage = null; cameraMessage = null;
    $('restore-status').textContent = ''; $('camera-status').textContent = '';
    renderRestoration();
  });
  function stopCamera() {
    if (cameraFrame !== null) cancelAnimationFrame(cameraFrame);
    cameraFrame = null;
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    $('camera-video').srcObject = null;
    $('camera-canvas').width = 0; $('camera-canvas').height = 0;
    $('camera-view').hidden = true; $('stop-camera').hidden = true;
  }
  function scanCamera() {
    if (!cameraStream) return;
    const video = $('camera-video'), canvas = $('camera-canvas');
    if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(video, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const found = ScatterQR.scan(pixels.data, canvas.width, canvas.height);
      if (found) {
        try {
          ScatterCore.parseShare(found.data);
          const current = $('restore-input').value.trim();
          $('restore-input').value = current ? current + '\n' + found.data : found.data;
          stopCamera(); cameraMessage = 'cameraRead'; $('camera-status').textContent = t(cameraMessage);
          restoreSecret(); return;
        } catch (_) {
          stopCamera(); cameraMessage = 'cameraInvalid'; $('camera-status').textContent = t(cameraMessage); return;
        }
      }
    }
    cameraFrame = requestAnimationFrame(scanCamera);
  }
  $('camera-button').addEventListener('click', async () => {
    stopCamera(); cameraMessage = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unavailable');
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      $('camera-video').srcObject = cameraStream;
      $('camera-view').hidden = false; $('stop-camera').hidden = false;
      await $('camera-video').play();
      cameraMessage = 'cameraRunning'; $('camera-status').textContent = t(cameraMessage);
      cameraFrame = requestAnimationFrame(scanCamera);
    } catch (_) {
      stopCamera(); cameraMessage = 'cameraUnavailable'; $('camera-status').textContent = t(cameraMessage);
    }
  });
  $('stop-camera').addEventListener('click', stopCamera);
  window.addEventListener('pagehide', stopCamera);
  render();
}());
