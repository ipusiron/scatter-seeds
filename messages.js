/* Scatter Seeds - MIT (c) 2026 ipusiron. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScatterMessages = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return Object.freeze({
    ja: {
      theme: '明暗を切り替える', language: '英語に切り替える', help: 'ヘルプ', tablist: '操作のタブ',
      subtitle: '秘密をn枚の紙に分け、k枚が集まれば戻せます。',
      privacy: 'この画面は外部と通信しません。オフラインの端末で使うのが最も安全です。',
      splitTab: '分ける', restoreTab: '戻す', guideTab: '保管の指針',
      splitTitle: '秘密を分ける', splitIntro: '証書のような共有を作り、離れた場所に保管します。',
      restoreTitle: '共有から戻す', restoreIntro: '共有の文字列またはQRを読み取ります。',
      guideTitle: '保管の指針', guideIntro: '失ってもよい枚数と、盗まれても漏れない枚数を確認します。',
      helpTitle: 'Scatter Seedsについて', helpBody: 'Shamirの秘密分散を使い、k枚で戻せるn枚の共有を作ります。印刷経路と端末の安全にも注意してください。',
      close: '閉じる'
    },
    en: {
      theme: 'Switch light or dark theme', language: 'Switch to Japanese', help: 'Help', tablist: 'Tool tabs',
      subtitle: 'Split a secret into n paper shares; any k can restore it.',
      privacy: 'This page makes no external connections. An offline device is safest.',
      splitTab: 'Split', restoreTab: 'Restore', guideTab: 'Storage guide',
      splitTitle: 'Split a secret', splitIntro: 'Create certificate style shares and store them separately.',
      restoreTitle: 'Restore from shares', restoreIntro: 'Enter share strings or scan a QR code.',
      guideTitle: 'Storage guide', guideIntro: 'Check how many shares you can lose or expose.',
      helpTitle: 'About Scatter Seeds', helpBody: 'Shamir secret sharing creates n shares, any k of which restore the secret. Protect your device and print path.',
      close: 'Close'
    }
  });
}));
