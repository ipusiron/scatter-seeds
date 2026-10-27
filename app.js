/* Scatter Seeds - MIT (c) 2026 ipusiron. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const stored = key => { try { return localStorage.getItem('scatter-seeds.' + key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem('scatter-seeds.' + key, value); } catch (_) { /* storage unavailable */ } };
  const langParam = new URLSearchParams(location.search).get('lang');
  let language = ['ja', 'en'].includes(langParam) ? langParam : stored('language') || (navigator.language.startsWith('ja') ? 'ja' : 'en');
  // theme-init.js sets data-theme in <head> before the first paint; keep that value here.
  let theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const tabs = ['split', 'restore', 'guide'];
  let active = 'split';
  let shares = [];
  let shareMeta = null;
  let splitGeneration = 0;
  let splitMessage = null;
  let restoreRows = [];
  let restored = null;
  let restoreMessage = { key: 'restoreIdle', args: [] };
  let restoreSummary = null;
  let cameraMessage = null;
  let revealed = false;
  let cameraStream = null;
  let cameraFrame = null;
  let cameraGeneration = 0;
  let cameraPending = false;
  let splitSnapshot = null;
  let qrOpener = null;
  const t = key => ScatterMessages[language][key];
  function render() {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.label)); });
    $('language').textContent = language === 'ja' ? 'EN' : 'JA';
    tabs.forEach(name => {
      const selected = name === active;
      $('tab-' + name).setAttribute('aria-selected', String(selected));
      $('tab-' + name).tabIndex = selected ? 0 : -1;
      $('panel-' + name).hidden = !selected;
    });
    renderThreshold();
    renderInputSize();
    if (shares.length) ensureCurrentShares();
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
  $('help').addEventListener('click', () => {
    $('help-dialog').showModal();
    $('help-content').scrollTop = 0;
    $('help-title').focus({ preventScroll: true });
  });
  $('help-close').addEventListener('click', () => $('help-dialog').close());
  $('help-dialog').addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const first = $('help-close');
    const last = $('help-dialog').querySelector('.help-link');
    if (event.shiftKey && [first, $('help-title')].includes(document.activeElement)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  function renderThreshold() {
    const k = Number($('split-k').value), n = Number($('split-n').value);
    $('threshold-hint').textContent = Number.isInteger(k) && Number.isInteger(n) && k >= 2 && n >= k && n <= 16
      ? t('thresholdHint')(n - k, k - 1) + (k === n ? ' ' + t('thresholdAll') : '') : t('invalidThreshold');
    $('bip39-note').hidden = $('secret-kind').value !== 'bip39';
  }
  const splitFields = ['secret-input', 'secret-kind', 'split-k', 'split-n', 'share-label', 'print-date'];
  const currentSplitSnapshot = () => JSON.stringify(splitFields.map(id => $(id).value));
  function invalidateSplit() {
    const hadOutput = shares.length || $('split-button').disabled;
    splitGeneration++; discardShares();
    $('split-button').disabled = false;
    $('split-progress').hidden = true; $('progress-text').textContent = '';
    if (hadOutput) setSplitMessage('splitEdited');
  }
  function ensureCurrentShares() {
    if (shares.length && splitSnapshot === currentSplitSnapshot()) return true;
    invalidateSplit(); return false;
  }
  for (const id of splitFields) $(id).addEventListener('input', () => {
    invalidateSplit(); renderThreshold(); renderInputSize();
  });
  function renderInputSize() {
    const raw = $('secret-input').value, kind = $('secret-kind').value;
    let size = 0, issue = '';
    if (raw.length > 4096) issue = t('inputTooLong');
    else if (kind === 'text') size = new TextEncoder().encode(raw).length;
    else if (kind === 'bytes') {
      if (raw.trim() && !/^(?:[0-9a-f]{2})+$/i.test(raw.trim())) issue = t('inputHexPending');
      else size = raw.trim().length / 2;
    } else if (raw.trim()) {
      try { size = ScatterBIP39.mnemonicToEntropy(raw).length; }
      catch (_) { issue = t('inputBip39Pending'); }
    }
    const invalid = !!issue || size > ScatterCore.MAX_SECRET;
    const counter = $('input-size');
    counter.textContent = issue || t(kind === 'bip39' ? 'inputEntropySize' : 'inputSize')(size);
    if (!issue && size > ScatterCore.MAX_SECRET) counter.textContent += ' ' + t('inputOverLimit');
    counter.classList.toggle('input-error', invalid);
    $('secret-input').setAttribute('aria-invalid', String(invalid));
  }
  function readSecret() {
    const raw = $('secret-input').value, kind = $('secret-kind').value;
    if (raw.length > 4096) throw taggedError(kind === 'bip39' ? 'invalidBip39' : 'invalidSecret');
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
    shares = []; shareMeta = null; splitSnapshot = null;
    if ($('qr-dialog').open) $('qr-dialog').close();
    $('qr-large-image').removeAttribute('src');
    $('print-button').disabled = true;
    $('share-cards').replaceChildren(); $('print-controls').hidden = true;
    $('instruction-page').hidden = true; $('print-instructions').checked = false;
  }
  async function splitSecret() {
    const generation = ++splitGeneration;
    const snapshot = currentSplitSnapshot();
    const date = $('print-date').value;
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
      if (snapshot !== currentSplitSnapshot()) { invalidateSplit(); return; }
      shares = candidates; splitSnapshot = snapshot;
      shareMeta = { k, n, setId: ScatterCore.hex(setId), label, date };
      $('print-button').disabled = false;
      renderCards(); $('print-controls').hidden = false;
      setSplitMessage('verified', [subsets.length]);
    } catch (error) {
      if (generation === splitGeneration) {
        discardShares(); setSplitMessage(error.key || 'verificationFailed', error.args);
      }
    } finally {
      if (generation === splitGeneration) {
        $('split-button').disabled = false; $('split-progress').hidden = true;
        $('progress-text').textContent = '';
      }
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
      qr.src = ScatterQR.make(share).createDataURL(3, 12);
      card.append(qr, element('p', '', t('printHelp')(shareMeta.k)),
        element('p', 'url', 'https://ipusiron.github.io/scatter-seeds/'));
      const actions = element('div', 'card-actions');
      const copy = element('button', '', t('copy')); copy.type = 'button';
      copy.addEventListener('click', async () => {
        if (!ensureCurrentShares()) return;
        const generation = splitGeneration;
        try {
          await navigator.clipboard.writeText(share);
          if (generation === splitGeneration) setSplitMessage('copied');
        } catch (_) {
          if (generation === splitGeneration) setSplitMessage('copyFailed');
        }
      });
      const enlarge = element('button', 'qr-enlarge', t('qrEnlarge'));
      enlarge.type = 'button'; enlarge.setAttribute('aria-haspopup', 'dialog');
      enlarge.setAttribute('aria-label', t('qrEnlarge') + ' · ' + t('shareHeading')(index + 1, shareMeta.n));
      enlarge.addEventListener('click', () => {
        if (!ensureCurrentShares()) return;
        qrOpener = enlarge;
        $('qr-title').textContent = t('shareHeading')(index + 1, shareMeta.n);
        $('qr-set').textContent = t('setId') + ' · ' + shareMeta.setId + ' · ' + t('restoreCount')(shareMeta.k);
        $('qr-large-image').src = ScatterQR.make(share).createDataURL(8, 32);
        $('qr-large-image').alt = qr.alt;
        $('qr-dialog').showModal(); $('qr-close').focus();
      });
      actions.append(copy, enlarge); card.append(actions); root.append(card);
    });
  }
  $('qr-close').addEventListener('click', () => $('qr-dialog').close());
  $('qr-dialog').addEventListener('keydown', event => {
    if (event.key === 'Tab') { event.preventDefault(); $('qr-close').focus(); }
  });
  $('qr-dialog').addEventListener('close', () => {
    $('qr-large-image').removeAttribute('src');
    $('qr-title').textContent = ''; $('qr-set').textContent = '';
    if (qrOpener && qrOpener.isConnected) qrOpener.focus();
    qrOpener = null;
  });
  $('split-button').addEventListener('click', splitSecret);
  $('clear-split').addEventListener('click', () => {
    splitGeneration++; discardShares();
    $('secret-input').value = ''; $('share-label').value = ''; $('print-date').value = '';
    setSplitMessage('clipboardNote'); $('split-progress').hidden = true; $('progress-text').textContent = '';
    $('split-button').disabled = false; renderInputSize();
  });
  $('print-instructions').addEventListener('change', () => { $('instruction-page').hidden = !$('print-instructions').checked; });
  $('print-button').addEventListener('click', () => { if (ensureCurrentShares()) window.print(); });
  window.addEventListener('beforeprint', () => { if (shares.length) ensureCurrentShares(); });
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
    $('restore-checks').hidden = restoreRows.length === 0;
    $('restore-summary').hidden = !restoreSummary;
    $('restore-summary').textContent = restoreSummary ? t('restoreSummary')(...restoreSummary) : '';
    const issues = $('restore-issues'); issues.replaceChildren();
    const labels = [t('shareColumn'), t('formatColumn'), 'CRC', t('setColumn'), t('thresholdColumn'), t('xColumn')];
    for (const row of restoreRows) {
      const tr = document.createElement('tr');
      [row.index, ...row.cells].forEach((cell, i) => {
        const td = document.createElement('td');
        td.dataset.label = labels[i];
        const content = element('span', 'check-cell-content', i === 0 ? String(cell) : t(cell));
        if (row.meta && i >= 3) {
          const value = [row.meta.setId, `${row.meta.k} / ${row.meta.n}`, row.meta.x][i - 3];
          content.append(element('span', 'check-meta', String(value)));
        }
        td.append(content);
        tr.append(td);
      });
      body.append(tr);
      for (const key of row.issues) issues.append(element('li', '', t('restoreRowIssue')(row.index, t(key))));
    }
    issues.hidden = !issues.children.length;
    $('restored').hidden = !restored;
    $('restored-value').hidden = !revealed;
    $('restored-mask').hidden = revealed;
    $('reveal').textContent = t(revealed ? 'conceal' : 'reveal');
    $('restored-value').textContent = restored && revealed ? formatRestored(restored) : '';
    const showTextActions = !!restored && revealed && restored.type === 1;
    $('restored-text-help').hidden = !showTextActions;
    $('copy-restored').hidden = !showTextActions;
    $('restored-copy-status').textContent = '';
  }
  function decodeRestoredText(result) {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(result.S);
  }
  function formatRestored(result) {
    if (result.type === 1) {
      const decoded = decodeRestoredText(result);
      return JSON.stringify(decoded).replace(/[\u007f-\u009f\u2028-\u202e\u2066-\u2069\ufeff]/g,
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
      const issues = [];
      if (error) {
        invalid = true;
        issues.push(error === 'crc' ? 'rowCrc' : error === 'version' ? 'rowVersion' :
          error === 'x=0' || error === 'x>n' ? 'rowX' : error === 'k/n' ? 'rowThreshold' : 'rowFormat');
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
        if (cells[2] !== 'ok') issues.push('rowSet');
        if (cells[3] !== 'ok') issues.push('rowThreshold');
        if (cells[4] !== 'ok') issues.push('rowDuplicate');
        if (issues.length) invalid = true;
        xs.add(p.x); parsed.push(p);
      }
      rows.push({ index: i + 1, cells, issues, meta: p || null });
    }
    return { rows, parsed, invalid };
  }
  function restoreSecret() {
    restored = null; revealed = false; restoreSummary = null;
    const lines = $('restore-input').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) { restoreRows = []; setRestoreMessage('noShares'); renderRestoration(); return; }
    const checked = checkShareRows(lines);
    restoreRows = checked.rows;
    if (checked.invalid) { setRestoreMessage('invalidShares'); renderRestoration(); return; }
    const first = checked.parsed[0];
    restoreSummary = [first.setId, first.k, first.n, checked.parsed.length];
    let result;
    try { result = ScatterCore.combine(lines); }
    catch (_) { setRestoreMessage('mixed'); renderRestoration(); return; }
    if (result.need) { setRestoreMessage('need', [result.need]); renderRestoration(); return; }
    if (!result.fingerprintOk) { setRestoreMessage('fingerprintBad'); renderRestoration(); return; }
    if (![1, 2, 3].includes(result.type)) { setRestoreMessage('badType'); renderRestoration(); return; }
    try { formatRestored(result); }
    catch (_) { setRestoreMessage(result.type === 1 ? 'badText' : 'badType'); renderRestoration(); return; }
    restored = result;
    for (const row of restoreRows) {
      if (result.inconsistent.includes(row.meta.x)) row.issues.push('rowExtra');
    }
    setRestoreMessage(result.inconsistent.length ? 'inconsistent' : 'restoredReady',
      result.inconsistent.length ? [result.inconsistent] : []);
    renderRestoration();
  }
  $('restore-input').addEventListener('input', () => {
    restoreRows = []; restored = null; revealed = false; restoreSummary = null;
    setRestoreMessage('restoreEdited'); renderRestoration();
  });
  $('copy-restored').addEventListener('click', async () => {
    const result = restored;
    if (!result || !revealed || result.type !== 1) return;
    try {
      await navigator.clipboard.writeText(decodeRestoredText(result));
      if (restored === result && revealed) $('restored-copy-status').textContent = t('restoredCopied');
    } catch (_) {
      if (restored === result && revealed) $('restored-copy-status').textContent = t('restoredCopyFailed');
    }
  });
  $('restore-button').addEventListener('click', restoreSecret);
  $('reveal').addEventListener('click', () => { revealed = !revealed; renderRestoration(); });
  $('clear-restore').addEventListener('click', () => {
    stopCamera(); $('restore-input').value = ''; restoreRows = []; restored = null; revealed = false;
    restoreSummary = null; cameraMessage = null;
    setRestoreMessage('restoreCleared'); $('camera-status').textContent = '';
    renderRestoration();
  });
  function stopCamera() {
    cameraGeneration++; cameraPending = false;
    $('camera-button').disabled = false;
    if (cameraFrame !== null) cancelAnimationFrame(cameraFrame);
    cameraFrame = null;
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    $('camera-video').srcObject = null;
    $('camera-canvas').width = 0; $('camera-canvas').height = 0;
    $('camera-view').hidden = true; $('stop-camera').hidden = true;
    if (cameraMessage === 'cameraRunning' || cameraMessage === 'cameraStarting') {
      cameraMessage = 'cameraStopped'; $('camera-status').textContent = t(cameraMessage);
    }
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
    if (cameraPending) return;
    stopCamera();
    const generation = cameraGeneration;
    cameraPending = true; $('camera-button').disabled = true;
    $('stop-camera').hidden = false;
    cameraMessage = 'cameraStarting'; $('camera-status').textContent = t(cameraMessage);
    let stream = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unavailable');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (generation !== cameraGeneration) { stream.getTracks().forEach(track => track.stop()); return; }
      cameraStream = stream;
      $('camera-video').srcObject = stream;
      $('camera-view').hidden = false;
      await $('camera-video').play();
      if (generation !== cameraGeneration) { stream.getTracks().forEach(track => track.stop()); return; }
      cameraPending = false;
      cameraMessage = 'cameraRunning'; $('camera-status').textContent = t(cameraMessage);
      cameraFrame = requestAnimationFrame(scanCamera);
    } catch (_) {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (generation !== cameraGeneration) return;
      stopCamera(); cameraMessage = 'cameraUnavailable'; $('camera-status').textContent = t(cameraMessage);
    }
  });
  $('stop-camera').addEventListener('click', stopCamera);
  window.addEventListener('pagehide', stopCamera);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });
  render();
}());
