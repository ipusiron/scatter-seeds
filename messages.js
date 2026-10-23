/* Scatter Seeds - MIT (c) 2026 ipusiron. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScatterMessages = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return Object.freeze({
    ja: {
      inputSize: size => "現在 {size} / 256 バイト".replace("{size}", String(size)),
      inputEntropySize: size => "元の乱数：{size} / 256 バイト".replace("{size}", String(size)),
      inputTooLong: "入力が長すぎます。上限は256バイトです。BIP-39は12〜24語を入力してください。",
      inputHexPending: "16進は0〜9・A〜Fを偶数桁で入力してください。上限は512桁（256バイト）です。",
      inputBip39Pending: "BIP-39の完全な英単語を入力してください。12・15・18・21・24語とチェックサムの検査後、元の乱数のサイズを表示します。",
      inputOverLimit: "256バイトを超えています。入力を短くしてください。",
      splitEdited: "入力が変わったため、前の証書を消しました。もう一度「分ける」を押してください。",
      qrEnlarge: "QRを拡大",
      qrHelp: "選んだ共有1枚のQRです。証書の共有番号とセットIDを確認してください。",
      cameraStarting: "カメラの開始を待っています。「カメラを止める」で中止できます。",
      copyRestored: "元のテキストをコピー",
      restoredTextHelp: "テキストは引用符付きのJSON形式で表示します。改行・タブ・バックスラッシュなどはエスケープして区別します。" +
        "「元のテキストをコピー」で、引用符や表示用のエスケープを含めず、元のテキストを取得できます。",
      restoredCopied: "元のテキストをコピーしました。使用後はクリップボードの内容にも注意してください。",
      restoredCopyFailed: "コピーできませんでした。表示用の引用符やエスケープをそのまま使わず、別の対応ブラウザーかREADMEのPython --raw手順で元のテキストを取得してください。",
      helpSplitUpdates: "入力欄の下で現在のバイト数を確認できる。BIP-39は元の乱数のバイト数を表示する。入力や枚数・ラベル・日付を変えると前の証書は消えるので、もう一度分ける。証書の「QRを拡大」で選んだ1枚を大きく確認できる。",
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
      restoreTitle: '共有から戻す',
      sharesLabel: '共有の文字列（1行に1枚）', restoreAction: '検査して戻す', cameraAction: 'カメラで読む',
      stopCamera: 'カメラを止める',
      cameraUnavailable: 'このブラウザーではカメラを使えません。GitHub Pages版で読むか、文字列を貼り付けてください。',
      checkCaption: '共有ごとの検査', formatColumn: '書式', setColumn: 'セットID',
      ok: '✓ 正常', bad: '✕ 異常', pending: '—', duplicate: '✕ 重複',
      need: count => `あと${count}枚必要です。同じセットの別の番号を追加して、もう一度検査してください。`,
      inconsistent: xs => `✕ 共有番号 x=${xs.join(', ')} が先頭k枚と食い違います。` +
        `先頭k枚から復元した値の指紋は一致しましたが、追加分を含む全体の検査は通っていません。元の証書を確認してください。`,
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
      helpInputSizeTitle: "入力サイズの上限と換算例",
      helpInputSizeLimit: "分けられる秘密は1〜256バイト（最大2,048ビット）です。テキストは空白・改行も含め、UTF-8に変換した後のバイト数で判定します。",
      helpInputAscii: "半角英数字（ASCII）だけ：最大256文字。1文字が1バイト。",
      helpInputJapanese: "「あ」だけ：最大85文字（255バイト）。1文字が3バイトなので、86文字では258バイトとなり上限を超える。",
      helpInputEmoji: "「😀」だけ：最大64個（256バイト）。この絵文字は1個が4バイト。",
      helpInputHex: "16進のバイト列：最大512桁。2桁で1バイトになるため、偶数桁で入力する。",
      helpInputBip39: "BIP-39（英語）：12・15・18・21・24語に対応。単語列を元の乱数（16〜32バイト）に変換して分ける。",
      helpInputSizeNote: "日本語や絵文字のバイト数は、文字の種類や組み合わせで変わります。「あ」85文字・「😀」64個は、それぞれ同じ文字だけを繰り返した場合の上限です。",
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
      restoreIntro: "「分ける」で作った証書の文字列やQRから、元の秘密を復元します。必要な枚数と秘密の種別は共有から読み取るため、ここで設定する必要はありません。",
      restorePrepareTitle: "1. 同じセットの共有を集める",
      restorePrepare: "証書に書かれた「復元にk枚」以上を用意します。セットIDが同じで、No.の番号が異なる共有を選んでください。同じ共有のコピーは1枚として数えます。",
      restoreInputTitle: "2. 共有の文字列を貼る、またはQRを読む",
      restoreInputHelp: "入力するのは証書の「SSS1-」で始まる文字列全体です。元のパスワードやBIP-39の単語、セットIDだけを入力する欄ではありません。",
      restoreLineHelp: "1枚の共有を1行に入力し、次の共有の前で改行します。紙の折り返しは1行につなげてください。空白・ハイフン・小文字は受け付けますが、抜けた文字の補完はしません。",
      restoreCameraHelp: "カメラはQRを1枚読むと入力欄の末尾に追加し、自動で検査して停止します。次の1枚はもう一度「カメラで読む」を押してください。画像ファイルの読み込みには対応していません。",
      restoreClearHelp: "「すべて消す」は、このタブの入力・検査結果・復元値を消し、カメラを止めます。クリップボード、印刷物、「分ける」タブの内容は消しません。",
      restoreCheckTitle: "3. 検査結果を確認して秘密を表示する",
      restoreIdle: "未検査です。共有を入力して「検査して戻す」を押してください。",
      restoreEdited: "入力を変更したため、前の検査結果と復元値を消しました。「検査して戻す」を押してください。",
      restoreCleared: "このタブの入力と結果を消しました。コピーした共有はクリップボード側で消してください。",
      restoreTableNote: "表の「入力順」は空行を除いた上からの順番です。証書のNo.は「共有番号 x」に表示します。表がすべて✓でも、復元後の指紋検査が通るまでは秘密を表示しません。",
      restoreLegendTitle: "検査表の見方と、✕が出たときの確認方法",
      restoreLegendFormat: "書式：SSS1の接頭辞、文字、長さなどを確認する。✕なら証書から文字列全体を写し直す。",
      restoreLegendCrc: "CRC：入力ミスを検出するための検査値。✕なら抜けた文字や取り違えがないか確認し、貼り直すかQRを読み直す。",
      restoreLegendSet: "セットID：同時に分けて作った共有の目印。最初に正常に読み取れた共有と比べる。✕なら別のセットが混ざっていないか確認する。",
      restoreLegendThreshold: "枚数 k/n・長さ：復元に必要な枚数k、作った総数n、共有データの長さが一致するか確認する。✕なら同じセットの元の証書を使う。",
      restoreLegendX: "共有番号 x：証書のNo.。同じ番号を2回入力すると重複になる。重複行を取り除き、異なる番号の共有を追加する。",
      restoreLegendSymbols: "✓はその項目の検査に合格、✕は確認が必要、—は前の項目で止まり未検査。CRCや指紋が合っても、作成者や意図的な改ざんがないことを保証しない。",
      restoreRevealHelp: "検査直後は秘密を目隠しします。「表示」で確認し、「隠す」で再び隠せます。BIP-39は番号つきの単語と元の乱数を表示します。使い終わったら「すべて消す」を押してください。",
      shareColumn: "入力順",
      thresholdColumn: "枚数 k/n・長さ",
      xColumn: "共有番号 x",
      noShares: "共有がありません。SSS1-で始まる文字列を貼り付けるか、証書のQRを読んでください。",
      mixed: "共有を検査できませんでした。入力した各行が同じセットの完全な共有か確認してください。",
      invalidShares: "復元を止めました。表の✕と下の説明を確認し、該当する共有を直してから再検査してください。",
      fingerprintBad: "復元後の指紋（内容の確認用データ）が一致しません。改ざんか、別の秘密の共有が混ざっている可能性があります。値は表示しません。元の証書を確認して読み直してください。",
      restoredReady: "復元後の指紋（内容の確認用データ）が一致しました。下の欄で秘密を表示したり、隠したりできます。",
      cameraRunning: "カメラに証書のQR全体を映してください。1枚読むと自動で停止します。",
      cameraRead: "共有を1枚追加し、自動で検査しました。続ける場合は「カメラで読む」をもう一度押してください。",
      cameraStopped: "カメラを止めました。追加した共有は入力欄に残っています。",
      cameraInvalid: "このQRは有効なSSS1の共有ではありません。Scatter Seedsの証書を使うか、文字列を貼り付けてください。",
      rowFormat: "文字列の形式を読めません。SSS1-から末尾までを1行に写し直してください。",
      rowVersion: "この共有の版には対応していません。作成に使ったツールと復元手順を確認してください。",
      rowCrc: "CRCが一致しません。証書から貼り直すか、QRを読み直してください。",
      rowSet: "セットIDが先頭の有効な共有と異なります。同じセットの証書を集めてください。",
      rowThreshold: "必要枚数・総数またはデータ長が一致しないか、不正です。元の証書を確認してください。",
      rowX: "共有番号が範囲外です。証書から文字列全体を読み直してください。",
      rowDuplicate: "同じ共有番号をすでに入力しています。この重複行を取り除き、必要なら別の番号を追加してください。",
      rowExtra: "先頭k枚からの復元結果と食い違います。元の証書を確認してください。どの共有が改ざんされたかは、この結果だけでは決まりません。",
      restoreSummary: (id, k, n, count) => `セットID ${id}：入力${count}枚／復元に${k}枚（作成${n}枚）。`,
      restoreRowIssue: (index, message) => `入力順${index}：${message}`,
      close: '閉じる'
    },
    en: {
      inputSize: size => "Current size: {size} / 256 bytes".replace("{size}", String(size)),
      inputEntropySize: size => "Original entropy: {size} / 256 bytes".replace("{size}", String(size)),
      inputTooLong: "The input is too long. The limit is 256 bytes. For BIP-39, enter 12 to 24 words.",
      inputHexPending: "Enter an even number of hexadecimal digits (0–9, A–F). The limit is 512 digits (256 bytes).",
      inputBip39Pending: "Enter complete English BIP-39 words. The original entropy size ap" +
        "pears after checking 12, 15, 18, 21 or 24 words and their checksu" +
        "m.",
      inputOverLimit: "The 256-byte limit has been exceeded. Shorten the input.",
      splitEdited: "The input changed, so the previous certificates were removed. Select Split again.",
      qrEnlarge: "Enlarge QR",
      qrHelp: "This is the QR code for one selected share. Check its share number and set ID against the certificate.",
      cameraStarting: "Waiting for the camera to start. Select Stop camera to cancel.",
      copyRestored: "Copy original text",
      restoredTextHelp: "Text is shown as a quoted JSON string with escapes for newlines, tabs and backslashes. " +
        "Copy original text retrieves the original text without the display quotes or escapes.",
      restoredCopied: "Original text copied. Remember to manage the clipboard contents after use.",
      restoredCopyFailed: "Copy failed. Do not use the display quotes or escapes as the orig" +
        "inal text. Use another supported browser or the Python --raw proc" +
        "edure in the README.",
      helpSplitUpdates: "The input counter shows the current byte size, or the original en" +
        "tropy size for BIP-39. Changing the input, counts, label or date " +
        "removes the previous certificates; split again. Enlarge QR shows " +
        "one selected share at a larger size.",
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
      restoreTitle: 'Restore from shares',
      sharesLabel: 'Share strings (one per line)', restoreAction: 'Check and restore', cameraAction: 'Scan with camera',
      stopCamera: 'Stop camera',
      cameraUnavailable: 'Camera access is unavailable here. Use the GitHub Pages version or paste the share string.',
      checkCaption: 'Checks for each share', formatColumn: 'Format', setColumn: 'Set ID',
      ok: '✓ OK', bad: '✕ Invalid', pending: '—', duplicate: '✕ Duplicate',
      need: count => `${count} more share${count === 1 ? '' : 's'} needed. Add a different share number from the same set and check again.`,
      inconsistent: xs => `✕ Share number x=${xs.join(', ')} disagrees with the first k shares. ` +
        `The fingerprint from the first k shares matched, but the full set did not pass. Check the original certificates.`,
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
      helpInputSizeTitle: "Input size limit and examples",
      helpInputSizeLimit: "The secret must be 1–256 bytes (at most 2,048 bits). Text is measured after UTF-8 encoding, includin" +
        "g spaces and line breaks.",
      helpInputAscii: "ASCII letters and digits only: up to 256 characters, at one byte each.",
      helpInputJapanese: "Only “あ”: up to 85 characters (255 bytes). Each is three bytes; 86 characters use 258 bytes and exce" +
        "ed the limit.",
      helpInputEmoji: "Only “😀”: up to 64 copies (256 bytes). This emoji uses four bytes per copy.",
      helpInputHex: "Hexadecimal bytes: up to 512 digits. Two digits encode one byte, so enter an even number of digits.",
      helpInputBip39: "English BIP-39: 12, 15, 18, 21 or 24 words. The words are converted to their original entropy (16–32" +
        " bytes) before splitting.",
      helpInputSizeNote: "The byte size of Japanese text and emoji depends on the characters and their combinations. The limit" +
        "s of 85 “あ” characters and 64 “😀” copies apply when repeating only that character.",
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
      restoreIntro: "Restore the original secret from certificate strings or QR codes created in Split. The req" +
        "uired number of shares and secret type are read from the shares; you do not need to set th" +
        "em here.",
      restorePrepareTitle: "1. Gather shares from the same set",
      restorePrepare: "Collect at least the number shown as “k shares to restore” on the certificate. Choose shar" +
        "es with the same set ID and different No. values. Copies of one share count as one.",
      restoreInputTitle: "2. Paste share strings or scan QR codes",
      restoreInputHelp: "Enter the entire certificate string beginning with SSS1-. This field is for shares, not th" +
        "e original password, BIP-39 words or a set ID alone.",
      restoreLineHelp: "Put one whole share on each line; start a new line before the next share. Join printed lin" +
        "e wraps into one line. Spaces, hyphens and lowercase are accepted, but missing characters " +
        "are not repaired.",
      restoreCameraHelp: "A scan appends one share to the input, checks it automatically and stops the camera. Selec" +
        "t Scan with camera again for the next share. Image file uploads are not supported.",
      restoreClearHelp: "Clear all removes this tab’s input, checks and restored value, and stops the camera. It do" +
        "es not clear the clipboard, printed copies or the Split tab.",
      restoreCheckTitle: "3. Review the checks and reveal the secret",
      restoreIdle: "Not checked yet. Enter shares, then select Check and restore.",
      restoreEdited: "The input changed, so previous checks and the restored value were cleared. Select Check an" +
        "d restore again.",
      restoreCleared: "This tab’s input and results were cleared. Clear copied shares from the clipboard on your " +
        "device.",
      restoreTableNote: "Input order counts nonempty lines from top to bottom. The certificate No. appears as Share" +
        " number x. All ✓ marks in the table are not enough: the restored fingerprint must also pas" +
        "s before the secret is shown.",
      restoreLegendTitle: "How to read the checks and resolve ✕ marks",
      restoreLegendFormat: "Format: checks the SSS1 prefix, characters and length. For ✕, copy the " +
        "complete string from the certificate again.",
      restoreLegendCrc: "CRC: a check value for input errors. For ✕, check for missing or mistyped characters, past" +
        "e the share again or rescan its QR code.",
      restoreLegendSet: "Set ID: identifies shares created together. It is compared with the first successfully par" +
        "sed share. For ✕, check whether different sets were mixed.",
      restoreLegendThreshold: "k/n and length: checks the required number k, total number n and share data length. For ✕," +
        " use the original certificates from the same set.",
      restoreLegendX: "Share number x: the certificate No. Entering one number twice is a duplicate. Remove the d" +
        "uplicate line and add a different share number if needed.",
      restoreLegendSymbols: "✓ means that check passed, ✕ needs attention, and — means an earlier check stopped further" +
        " checks. CRC and fingerprints do not authenticate the creator or rule out deliberate chang" +
        "es.",
      restoreRevealHelp: "The secret is initially concealed after verification. Select Show to reveal it and Hide to concea" +
        "l it again. BIP-39 shows numbered words and original entropy. Select Clear all when finish" +
        "ed.",
      shareColumn: "Input order",
      thresholdColumn: "k/n and length",
      xColumn: "Share number x",
      noShares: "No shares entered. Paste an entire SSS1- string or scan a certificate QR code.",
      mixed: "Could not check the shares. Confirm that each input line is a complete share from the same" +
        " set.",
      invalidShares: "Restoration stopped. Check the ✕ marks and explanations below, correct the affected shares" +
        ", then check again.",
      fingerprintBad: "The restored fingerprint (a content check value) did not match. Shares may have been chang" +
        "ed or mixed from different secrets. No value is shown. Check the original certificates and" +
        " read them again.",
      restoredReady: "The restored fingerprint (a content check value) matched. Use the controls below to show or hide the secret.",
      cameraRunning: "Keep the whole certificate QR code in view. The camera stops after reading one share.",
      cameraRead: "One share was added and checked automatically. Select Scan with camera again to add anothe" +
        "r.",
      cameraStopped: "Camera stopped. Shares already added remain in the input.",
      cameraInvalid: "This QR code is not a valid SSS1 share. Use a Scatter Seeds certificate or paste its share" +
        " string.",
      rowFormat: "Cannot read the format. Copy the whole string from SSS1- to the end onto one line.",
      rowVersion: "This share version is not supported. Check the tool and recovery instructions used to crea" +
        "te it.",
      rowCrc: "CRC did not match. Paste the share from the certificate again or rescan its QR code.",
      rowSet: "The set ID differs from the first valid share. Collect certificates from the same set.",
      rowThreshold: "The required count, total count or data length is invalid or inconsistent. Check the origi" +
        "nal certificate.",
      rowX: "The share number is out of range. Read the entire string from the certificate again.",
      rowDuplicate: "This share number was already entered. Remove the duplicate line and add a different numbe" +
        "r if needed.",
      rowExtra: "This share disagrees with the result from the first k shares. Check the original certifica" +
        "te. This result alone cannot identify which share was deliberately changed.",
      restoreSummary: (id, k, n, count) => `Set ID ${id}: ${count} entered / ${k} required (${n} created).`,
      restoreRowIssue: (index, message) => `Input order ${index}: ${message}`,
      close: 'Close'
    }
  });
}));
