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
      kindLabel: '入力の種別', kindText: 'テキスト', kindBytes: '16進のバイト列', kindBip39: 'BIP-39（英語）',
      secretLabel: '秘密', kLabel: '戻すのに必要な枚数 k', nLabel: '作る枚数 n', labelLabel: '共有のラベル（任意）',
      dateLabel: '証書の作成日（任意）', labelNote: 'ラベルには中身・保管場所・持ち主を書かないでください。',
      bip39Note: 'チェックサムは4〜8ビットです。12語で1語を取り違えても約1/16の確率で通ります。元の紙と1語ずつ見比べてください。25番目のパスフレーズは扱いません。別に保管してください。',
      splitAction: '分ける', clear: 'すべて消す', printAction: '証書を印刷', printInstructions: '手順書ページも印刷する',
      printWarning: '⚠ プリンターの記憶・印刷キュー・PDF保存先のクラウド同期に注意してください。',
      thresholdHint: (lost, stolen) => `${lost}枚まで失っても戻せます。${stolen}枚まで盗まれても秘密は漏れません。`,
      thresholdAll: '⚠ 1枚でも失うと戻せません。',
      noRandom: '安全な乱数を使えないため分けられません。',
      invalidSecret: '秘密は1〜256バイトで入力してください。', invalidHex: '16進は偶数桁の0〜9・A〜Fで入力してください。',
      invalidThreshold: '2 ≤ k ≤ n ≤ 16 で入力してください。', invalidLabel: 'ラベルは40文字以内にしてください。',
      invalidBip39: 'BIP-39の語数・語彙・チェックサムを確認してください。',
      unknownWord: (word, suggestions) => `語彙にない語「${word}」。候補: ${suggestions.join('、') || 'なし'}`, 
      verifying: (done, total) => `すべての組を検査中: ${done}/${total}`, verified: count => `${count}組すべてで復元できました。`,
      verificationFailed: '共有の復元検査に失敗しました。共有は表示しません。',
      shareHeading: (x, n) => `No. ${x} / ${n}`, restoreCount: k => `復元に${k}枚`, setId: 'セットID',
      copy: '文字列をコピー', copied: 'コピーしました。', copyFailed: 'コピーできませんでした。手で写してください。',
      printHelp: 'このセットからk枚を集め、Scatter Seedsで戻します。',
      instructionTitle: '復元手順書 · 書式 v1',
      instructionBody: 'SSS1-の後は16進。版1バイト・セットID4バイト・k・n・x各1バイト・分散データ・CRC-32 4バイトです。GF(2⁸)の多項式は0x11B、加算はXOR。x=0の値をラグランジュ補間で求めます。種別は01=テキスト、02=バイト列、03=BIP-39。末尾4バイトはSHA-256(種別‖秘密)の先頭4バイトです。READMEのPythonスクリプトも保存してください。',
      clipboardNote: 'クリップボードは消せません。コピーした場合は端末側で処理してください。',
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
      kindLabel: 'Input type', kindText: 'Text', kindBytes: 'Hex bytes', kindBip39: 'BIP-39 (English)',
      secretLabel: 'Secret', kLabel: 'Shares needed k', nLabel: 'Shares created n', labelLabel: 'Share label (optional)',
      dateLabel: 'Certificate date (optional)', labelNote: 'Do not put the contents, storage location or owner in the label.',
      bip39Note: 'The checksum is only 4–8 bits. For 12 words, one wrong word may pass about 1 in 16 times. Compare every word with the original paper. This tool does not handle the 25th passphrase; store it separately.',
      splitAction: 'Split', clear: 'Clear all', printAction: 'Print certificates', printInstructions: 'Also print an instruction page',
      printWarning: '⚠ Check printer memory, the print queue and cloud sync of saved PDFs.',
      thresholdHint: (lost, stolen) => `You may lose ${lost} shares and still restore. Up to ${stolen} stolen shares reveal nothing.`,
      thresholdAll: '⚠ Losing even one share prevents restoration.',
      noRandom: 'Secure randomness is unavailable. Splitting is disabled.',
      invalidSecret: 'Enter a secret of 1–256 bytes.', invalidHex: 'Enter an even number of hexadecimal digits (0–9, A–F).',
      invalidThreshold: 'Enter 2 ≤ k ≤ n ≤ 16.', invalidLabel: 'Keep the label within 40 characters.',
      invalidBip39: 'Check the BIP-39 word count, words and checksum.',
      unknownWord: (word, suggestions) => `Unknown word “${word}”. Suggestions: ${suggestions.join(', ') || 'none'}`,
      verifying: (done, total) => `Checking all subsets: ${done}/${total}`, verified: count => `All ${count} subsets restored successfully.`,
      verificationFailed: 'Share verification failed. No shares are shown.',
      shareHeading: (x, n) => `No. ${x} / ${n}`, restoreCount: k => `${k} shares to restore`, setId: 'Set ID',
      copy: 'Copy share string', copied: 'Copied.', copyFailed: 'Copy failed. Transcribe it manually.',
      printHelp: 'Collect k shares from this set and restore with Scatter Seeds.',
      instructionTitle: 'Restoration instructions · format v1',
      instructionBody: 'After SSS1- comes hex: version (1 byte), set ID (4), k, n and x (1 each), share data, CRC-32 (4). The GF(2⁸) polynomial is 0x11B; addition is XOR. Use Lagrange interpolation at x=0. Type 01=text, 02=bytes, 03=BIP-39. The last four restored bytes are the first four bytes of SHA-256(type‖secret). Keep the Python script from README.',
      clipboardNote: 'This cannot clear the clipboard. Clear it on your device if you copied a share.',
      restoreTitle: 'Restore from shares', restoreIntro: 'Enter share strings or scan a QR code.',
      guideTitle: 'Storage guide', guideIntro: 'Check how many shares you can lose or expose.',
      helpTitle: 'About Scatter Seeds', helpBody: 'Shamir secret sharing creates n shares, any k of which restore the secret. Protect your device and print path.',
      close: 'Close'
    }
  });
}));
