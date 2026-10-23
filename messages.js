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
      printHelp: k => `このセットから${k}枚を集め、Scatter Seedsで戻します。`,
      instructionTitle: '復元手順書 · 書式 v1',
      instructionBody: 'SSS1-の後は16進。版1バイト・セットID4バイト・k・n・x各1バイト・分散データ・CRC-32 4バイトです。' +
        'GF(2⁸)の多項式は0x11B、加算はXOR。x=0の値をラグランジュ補間で求めます。' +
        '種別は01=テキスト、02=バイト列、03=BIP-39。末尾4バイトはSHA-256(種別‖秘密)の先頭4バイトです。' +
        'READMEのPythonスクリプトも保存してください。',
      clipboardNote: 'クリップボードは消せません。コピーした場合は端末側で処理してください。',
      restoreTitle: '共有から戻す', restoreIntro: '共有の文字列またはQRを読み取ります。',
      sharesLabel: '共有の文字列（1行に1枚）', restoreAction: '検査して戻す', cameraAction: 'カメラで読む',
      stopCamera: 'カメラを止める', cameraRunning: 'カメラのQRを読み取っています。',
      cameraUnavailable: 'このブラウザーではカメラを使えません。GitHub Pages版で読むか、文字列を貼り付けてください。',
      cameraInvalid: '読み取ったQRは有効な共有ではありません。', cameraRead: '共有を1枚読み取りました。',
      checkCaption: '共有ごとの検査', shareColumn: '共有', formatColumn: '書式', setColumn: 'セットID',
      ok: '✓ 正常', bad: '✕ 異常', pending: '—', duplicate: '✕ 重複', noShares: '共有を入力してください。',
      need: count => `あと${count}枚必要です。`, mixed: '異なるセット、k・n、または重複したxがあります。',
      fingerprintBad: '改ざんか、別の秘密の共有が混ざっています。値は表示しません。',
      inconsistent: xs => `✕ x=${xs.join(', ')} は最初のk枚から決まる多項式に乗りません。`,
      restoredReady: '指紋が一致しました。秘密は目隠ししています。',
      restoredTitle: '戻した秘密', reveal: '表示', conceal: '隠す', entropyHex: '元の乱数（16進）',
      badText: 'テキストとして復号できません。値は表示しません。', badType: '種別が不正です。値は表示しません。',
      guideTitle: '保管の指針', guideIntro: '失ってもよい枚数と、盗まれても漏れない枚数を確認します。',
      guideExamplesTitle: '枚数の例', guideExamples: '2-of-3なら自宅・実家・貸金庫など。3-of-5なら家族と信頼できる第三者などに分けて保管します。',
      guideAvoidTitle: 'してはいけないこと',
      guideInspectTitle: '定期点検', guideInspect: '年に1回、紙がそろい読めるかを確かめます。戻すタブでk枚を検査し、秘密を表示せずに確認できます。',
      guideSurviveTitle: 'ツールが無くなっても戻せるように', guideSurvive: 'リポジトリーのZIP、印刷できる手順書ページ、READMEの標準ライブラリーだけのPythonスクリプトを保存してください。',
      guideLimitsTitle: '限界',
      guideLimit1: '唯一のバックアップにしないでください。分ける人は秘密を見るため、端末とブラウザー拡張にも注意が必要です。',
      guideLimit2: 'k人が集まれば戻せます。共謀を防ぐ仕組みではありません。',
      guideLimit3: 'ブラウザーの乱数と印刷経路を信頼します。プリンターの記憶やキューも確認してください。',
      guideLimit4: '独自書式であり、SLIP-39対応機器とは互換性がありません。CRCや指紋は誤入力や食い違いを検出しますが、作成者や改ざんがないことを保証しません。',
      guideLimit5: 'JavaScriptは定数時間の処理を保証できません。',
      guideCasesTitle: "本ツールの活用例",
      guideCase1: "相続や家族への引き継ぎ：復旧情報を2-of-3で家族や信頼できる第三者に分け、必要な2枚の集め方と復元手順を残す。相続手続きや本人確認は別に必要。",
      guideCase2: "災害への備え：3-of-5の共有を異なる地域へ保管する。2枚を失っても残り3枚から戻せる。紙が読めるか定期的に点検する。",
      guideCase3: "暗号資産のシード：英語BIP-39の語を検査し、元の乱数を紙の共有に分ける。追加のパスフレーズは別に管理し、元の語句と1語ずつ見比べる。",
      guideCase4: "会社の復旧キーや金庫の番号：2-of-3で別々の管理者に預ける。復元には2枚を集める必要があるため、担当者1人の不在に備えられる。利用権限や復元の承認手順も決めておく。",
      guideAvoid1: "復元に必要なk枚以上を同じ場所や同じクラウドアカウントにまとめない。1か所から秘密を戻せる状態になる。",
      guideAvoid2: "共有の写真やPDFを、クラウドへ自動同期される場所に保存しない。共有プリンターに印刷物を放置しない。",
      guideAvoid3: "ラベルに秘密の内容、保管場所、持ち主を書かない。",
      guideAvoid4: "紛失への備えが必要なときにk=nを選ばない。1枚でも失うと戻せない。",
      guideAvoid5: "復元を確かめる前に元のバックアップを捨てない。確認後も元の秘密を無防備な平文ファイルに残さない。このツールだけを唯一のバックアップ手段にしない。",
      guideAvoid6: "同じ共有のコピーを別の共有として数えない。異なるセットの共有を混ぜない。復元には同じセットの異なる番号が必要。",
      guideAvoid7: "「すべて消す」でクリップボードや印刷済みデータまで消えたと思わない。コピー先、印刷キュー、プリンターの記憶も確認する。",
      helpTitle: "使い方と保管のヘルプ",
      helpIntro: "Scatter Seedsは、1つの秘密から複数の共有（シェア）を作り、必要な枚数を集めて戻すツールです。共有は文字列とQRを載せた証書として印刷できます。",
      helpThresholdTitle: "しきい値法：n枚のうちk枚で戻す",
      helpThreshold: "シャミアの秘密分散では、秘密と乱数からn個の共有を作ります。そのうち異なるk個が集まれば、どの組み合わせでも元の秘密を戻せます。この必要数kを「しきい値」と呼びます。",
      helpN: "n：作る共有の総数。たとえばn=3なら、番号の異なる3枚を作る。",
      helpK: "k：復元に必要な枚数。たとえばk=2なら、どの2枚を集めても戻せる。本ツールでは2 ≤ k ≤ n ≤ 16。",
      helpShare: "共有：秘密と乱数から計算したデータ。秘密の文字を前半・後半に切り分けたものではない。正しい乱数で作った共有だけなら、k−1枚以下から秘密の値はわからない。",
      helpExample: "例：n=3、k=2（2-of-3）。共有①＋②、①＋③、②＋③のどの組でも戻せます。1枚を失っても残り2枚で戻せます。同じ①を2枚コピーしても、2枚分にはなりません。",
      helpTradeoff: "n−k枚まで失っても復元でき、k−1枚以下の共有だけでは秘密の値はわかりません。kを増やすと復元に必要な枚数が増え、同じnなら失ってよい枚数は減ります。共有には長さやk・nなど" +
        "の情報は残ります。",
      helpLearn: "Day123 ShamirSharing CipherLabでは、座標平面、手計算、バイト表を通して、なぜk枚で戻せるのかを学べます。",
      helpDay123: "Day123で仕組みを学ぶ（新しいタブ）",
      helpLearningNote: "Day123は学習用です。実際のパスワードやシードは入力せず、練習用の値を使ってください。Day123では必要数kを先に書く「(k,n)しきい値法」という表記を使っています。",
      helpTabsTitle: "各タブの役割と操作",
      helpSplit1: "「分ける」では、テキスト・16進のバイト列・英語BIP-39から種別を選び、秘密を入力する。上限は256バイト。BIP-39は12・15・18・21・24語の完全な英単語を使う" +
        "。",
      helpSplit2: "必要な枚数kと作る枚数nを決め、「分ける」を押す。すべてのk枚の組で復元できることを検査したあと、共有の証書が表示される。",
      helpSplit3: "「証書を印刷」で1ページに1共有を印刷し、別々の場所へ保管する。任意のラベルや日付、追加の手順書ページも印刷できる。配布前に紙からの読み取りと復元を試す。",
      helpRestore1: "「戻す」では、同じセットIDの異なる共有をk枚以上集め、文字列を1行に1枚ずつ貼り付ける。",
      helpRestore2: "QRなら「カメラで読む」を押す。1枚読むとカメラが止まるので、次の1枚はもう一度押す。画像ファイルの読み込みには対応していない。",
      helpRestore3: "「検査して戻す」で各共有の検査表とメッセージを確認する。復元値は最初は目隠しされ、「表示」で見られる。不足枚数や食い違いが示されたら、元の証書を確認する。",
      helpGuide: "「保管の指針」ではk・nを変えて、失ってよい枚数と秘密を知られずに済む枚数を確認できます。保管例、禁止事項、定期点検、限界も読めます。ここで選ぶk・nは「分ける」の設定には反映" +
        "されません。",
      helpPracticeTitle: "初めて使うときの練習",
      helpPractice: "秘密にする必要のない「Scatter Seeds」をテキストとして入力し、k=2、n=3で分けてください。異なる2枚を「戻す」へ貼り付け、復元結果が元の文字と同じか確かめます。" +
        "別の2枚の組でも試すと、「どのk枚でも戻せる」を体験できます。",
      helpDataTitle: "保存と検査の範囲",
      helpData: "秘密・共有・ラベルをブラウザーの保存領域やURLには保存しません。保存するのは言語と明暗だけです。カメラ映像も保存せず、外部への送信はありません。実際の秘密を扱うときは信頼でき" +
        "るオフライン端末を使ってください。",
      helpChecks: "BIP-39のチェックサムが通っても、入力が元の語句と同じとは限りません。CRCと指紋も誤入力や共有の食い違いを見つけるための検査で、作成者や意図的な改ざんがないことを保証しま" +
        "せん。",
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
      bip39Note: 'The checksum is only 4–8 bits. For 12 words, one wrong word may pass about 1 in 16 times. ' +
        'Compare every word with the original paper. This tool does not handle the 25th passphrase; store it separately.',
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
      printHelp: k => `Collect ${k} shares from this set and restore with Scatter Seeds.`,
      instructionTitle: 'Restoration instructions · format v1',
      instructionBody: 'After SSS1- comes hex: version (1 byte), set ID (4), k, n and x (1 each), share data, CRC-32 (4). ' +
        'The GF(2⁸) polynomial is 0x11B; addition is XOR. Use Lagrange interpolation at x=0. ' +
        'Type 01=text, 02=bytes, 03=BIP-39. The last four restored bytes are the first four bytes of ' +
        'SHA-256(type‖secret). Keep the Python script from README.',
      clipboardNote: 'This cannot clear the clipboard. Clear it on your device if you copied a share.',
      restoreTitle: 'Restore from shares', restoreIntro: 'Enter share strings or scan a QR code.',
      sharesLabel: 'Share strings (one per line)', restoreAction: 'Check and restore', cameraAction: 'Scan with camera',
      stopCamera: 'Stop camera', cameraRunning: 'Scanning for a QR code.',
      cameraUnavailable: 'Camera access is unavailable here. Use the GitHub Pages version or paste the share string.',
      cameraInvalid: 'The scanned QR is not a valid share.', cameraRead: 'One share was scanned.',
      checkCaption: 'Checks for each share', shareColumn: 'Share', formatColumn: 'Format', setColumn: 'Set ID',
      ok: '✓ OK', bad: '✕ Invalid', pending: '—', duplicate: '✕ Duplicate', noShares: 'Enter at least one share.',
      need: count => `${count} more share${count === 1 ? '' : 's'} needed.`, mixed: 'Different set, k/n, or duplicate x detected.',
      fingerprintBad: 'A share was changed or belongs to another secret. No value is shown.',
      inconsistent: xs => `✕ x=${xs.join(', ')} does not lie on the polynomial defined by the first k shares.`,
      restoredReady: 'Fingerprint matched. The secret is concealed.',
      restoredTitle: 'Restored secret', reveal: 'Show', conceal: 'Hide', entropyHex: 'Original entropy (hex)',
      badText: 'Cannot decode as text. No value is shown.', badType: 'Invalid type. No value is shown.',
      guideTitle: 'Storage guide', guideIntro: 'Check how many shares you can lose or expose.',
      guideExamplesTitle: 'Example thresholds',
      guideExamples: 'For 2-of-3, consider home, a relative’s home and a safe deposit box. ' +
        'For 3-of-5, use family and a trusted third party.',
      guideAvoidTitle: 'What not to do',
      guideInspectTitle: 'Periodic checks',
      guideInspect: 'Once a year, check that the paper is present and legible. ' +
        'Test k shares in Restore without revealing the secret.',
      guideSurviveTitle: 'If this tool disappears',
      guideSurvive: 'Keep a ZIP of the repository, the printed instruction page, ' +
        'and the standard-library-only Python script in README.',
      guideLimitsTitle: 'Limits',
      guideLimit1: 'Do not make this your only backup. The person splitting sees the secret. Protect the device and browser extensions.',
      guideLimit2: 'Any k people can combine their shares; this does not prevent collusion.',
      guideLimit3: 'You trust the browser random generator and print path. Check printer memory and queues.',
      guideLimit4: 'This custom format is incompatible with SLIP-39. CRC and fingerprints detect errors, but do not authenticate shares.',
      guideLimit5: 'JavaScript cannot guarantee constant-time execution.',
      guideCasesTitle: "Ways to use this tool",
      guideCase1: "Family handover or inheritance: distribute a recovery secret as 2-of-3 among family and " +
        "trusted custodians. Leave instructions for collecting two shares and restoring it. Legal" +
        " procedures and identity checks remain separate.",
      guideCase2: "Disaster preparation: store 3-of-5 shares in different regions. Any three can restore th" +
        "e secret even if two are lost. Check paper legibility regularly.",
      guideCase3: "Cryptocurrency seeds: validate an English BIP-39 phrase and split its original entropy i" +
        "nto paper shares. Manage an additional passphrase separately and compare every word with" +
        " the original.",
      guideCase4: "Company recovery keys or safe combinations: give 2-of-3 shares to separate custodians. R" +
        "ecovery requires two shares and can proceed if one custodian is unavailable. Define acce" +
        "ss rights and approval procedures too.",
      guideAvoid1: "Do not keep k or more shares together in one place or cloud account. That location alone" +
        " would hold enough to restore the secret.",
      guideAvoid2: "Do not save share photos or PDFs where they will sync to the cloud. Do not leave certifi" +
        "cates on a shared printer.",
      guideAvoid3: "Do not put the secret contents, storage location or owner in a label.",
      guideAvoid4: "Do not choose k=n when you need protection against loss. Losing even one share prevents " +
        "restoration.",
      guideAvoid5: "Do not discard an existing backup before testing restoration. Do not leave the original " +
        "secret in an unprotected plaintext file, or make this tool your only backup method.",
      guideAvoid6: "Do not count copies of one share as distinct shares or mix different sets. Restoration n" +
        "eeds different share numbers from the same set.",
      guideAvoid7: "Do not assume Clear all clears the clipboard or printed data. Check copied data, print q" +
        "ueues and printer memory too.",
      helpTitle: "Help with use and storage",
      helpIntro: "Scatter Seeds creates several shares from one secret and restores it when enough shares " +
        "are collected. Each share can be printed as a certificate with a string and QR code.",
      helpThresholdTitle: "Threshold sharing: any k of n shares",
      helpThreshold: "Shamir secret sharing uses a secret and random values to create n shares. Any k distinct" +
        " shares can restore the original secret, regardless of which ones you choose. The requir" +
        "ed number k is the threshold.",
      helpN: "n: the total number of shares created. For n=3, you get three shares with different numb" +
        "ers.",
      helpK: "k: the number needed to restore. For k=2, any two shares work. This tool supports 2 ≤ k " +
        "≤ n ≤ 16.",
      helpShare: "A share is data calculated from the secret and randomness. It is not a slice of the orig" +
        "inal text. With correct randomness, k−1 or fewer shares alone reveal nothing about the s" +
        "ecret value.",
      helpExample: "Example: n=3, k=2 (2-of-3). Shares 1+2, 1+3 or 2+3 all work. You may lose one share and " +
        "restore from the other two. Two copies of share 1 still count as only one share.",
      helpTradeoff: "You may lose n−k shares and still restore. Up to k−1 shares alone reveal nothing about t" +
        "he secret value. Raising k requires more shares; with the same n, fewer may be lost. Sha" +
        "res still reveal metadata such as length, k and n.",
      helpLearn: "Day123 ShamirSharing CipherLab uses coordinate plots, worked calculations and byte table" +
        "s to explain why k shares can restore a secret.",
      helpDay123: "Learn the mechanism with Day123 (new tab)",
      helpLearningNote: "Day123 is educational. Use practice values, never real passwords or seed phrases. It wri" +
        "tes the required number first in the notation “(k,n) threshold sharing”.",
      helpTabsTitle: "What each tab does",
      helpSplit1: "In Split, choose text, hexadecimal bytes or English BIP-39 and enter the secret. The lim" +
        "it is 256 bytes. BIP-39 accepts 12, 15, 18, 21 or 24 complete English words.",
      helpSplit2: "Set the required number k and total number n, then select Split. Certificates appear aft" +
        "er every subset of k shares passes a restoration check.",
      helpSplit3: "Use Print certificates for one share per page, then store them separately. You can add a" +
        "n optional label, date and instruction page. Test reading and restoring from the paper b" +
        "efore distributing it.",
      helpRestore1: "In Restore, collect at least k distinct shares with the same set ID. Paste one complete " +
        "share string per line.",
      helpRestore2: "For QR codes, select Scan with camera. It stops after each successful scan; select it ag" +
        "ain for the next share. Image file uploads are not supported.",
      helpRestore3: "Select Check and restore, then review the table and messages. The restored value is conc" +
        "ealed until you select Show. Check the original certificates if shares are missing or in" +
        "consistent.",
      helpGuide: "In Storage guide, change k and n to explore how many shares may be lost or exposed. Read" +
        " storage examples, prohibitions, periodic checks and limits. These values do not change " +
        "the settings in Split.",
      helpPracticeTitle: "Try a practice secret first",
      helpPractice: "Enter the nonsecret text “Scatter Seeds” and split with k=2, n=3. Paste two distinct sha" +
        "res into Restore and check that the result matches the original text. Try another pair t" +
        "o see that any k shares work.",
      helpDataTitle: "Storage and verification limits",
      helpData: "Secrets, shares and labels are not saved in browser storage or URLs. Only language and t" +
        "heme are saved. Camera video is not recorded and no data is sent externally. Use a trust" +
        "ed offline device for real secrets.",
      helpChecks: "A passing BIP-39 checksum does not prove the words match the original. CRC and fingerpri" +
        "nts help find input errors and inconsistent shares; they do not authenticate the creator" +
        " or guarantee that deliberate changes are absent.",
      close: 'Close'
    }
  });
}));
