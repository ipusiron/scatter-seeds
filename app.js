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
  render();
}());
