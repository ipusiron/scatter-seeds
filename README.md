<!--
---
id: day124
slug: scatter-seeds
title: "Scatter Seeds"
subtitle_ja: "秘密を紙の共有に分けて備える"
subtitle_en: "Split a secret into paper shares for recovery"
description_ja: "シャミアの秘密分散で秘密を分け、全組を検査して証書として印刷し、QRまたは文字列から復元するツール。"
description_en: "Split secrets with Shamir sharing, verify every threshold subset, print certificates, and restore by QR or text."
category_ja:
  - プレッパー
  - 現代暗号
  - 物理的セキュリティ
category_en:
  - Prepping / Survival
  - Modern Cryptography
  - Physical Security
difficulty: 3
tags:
  - shamir
  - secret-sharing
  - bip39
  - paper-backup
  - qr-code
repo_url: "https://github.com/ipusiron/scatter-seeds"
demo_url: "https://ipusiron.github.io/scatter-seeds/"
hub: true
---
-->

# Scatter Seeds - 秘密を紙の共有に分けて備える

[English](README.en.md) · 日本語

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/scatter-seeds?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/scatter-seeds?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/scatter-seeds)
![GitHub license](https://img.shields.io/github/license/ipusiron/scatter-seeds)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/scatter-seeds/)

**Day124 - 生成AIで作るセキュリティツール200**

Scatter Seedsは、秘密をシャミアの秘密分散でn枚の紙に分け、k枚から復元するツールです。パスワード、暗号資産のシード、金庫の番号、復旧キーを扱えます。k−1枚から秘密の情報は漏れず、n−k枚を失っても戻せます。共有を作った直後に、すべてのk枚の組が元の秘密を戻すことを検査します。

名前は、共有という「種」を離れた場所へ蒔くことに由来します。暗号資産のシードと、備えのための種の備蓄も重ねています。頭文字SSSはShamir's Secret Sharingとも共通です。Secret Sharing Scheme一般にも使われ、視覚暗号のVSSSにも含まれる略語です。

---

## 🌐 デモページ

👉 **[Scatter Seedsを開く](https://ipusiron.github.io/scatter-seeds/)**

ダウンロードした`index.html`を`file://`で開いても使えます。画面は外部へ通信しません。秘密を入れるときは、オフラインの信頼できる端末を使ってください。

---

## 📸 スクリーンショット

以下はライトモードの画面です。画面右上の「◐」ボタンでダークモードに切り替えられます。

![分ける](assets/ja/light/split.png)

> *分ける*

![共有の証書](assets/ja/light/shares.png)

> *共有の証書*

![印刷プレビュー](assets/ja/light/print.png)

> *印刷プレビュー*

![戻す・検査表](assets/ja/light/restore.png)

> *戻す・検査表*

![保管の指針](assets/ja/light/guide.png)

> *保管の指針*

[英語画面の同じ状態](README.en.md)も掲載しています。撮影には`test/fixtures/vectors.json`のデモ値だけを使っています。共有の乱数とセットIDは撮影ごとに変わります。

## ✨ できること

| タブ | 内容 |
|---|---|
| 分ける | テキスト、16進のバイト列、英語BIP-39を2≤k≤n≤16で分ける。全組の復元検査が終わってから共有とQRを表示し、A4で1枚ずつ印刷する。 |
| 戻す | 文字列を1行ずつ貼るか、押したときだけカメラでQRを1枚読む。書式、CRC、セットID、k/n、x、指紋、余分な共有の食い違いを検査する。秘密は最初は隠す。 |
| 保管の指針 | kとnから失ってよい枚数と盗まれてよい枚数を示し、保管例、定期点検、限界を説明する。 |

秘密・共有・ラベルはストレージ、URL、履歴に保存しません。保存するのは言語と明暗だけです。「すべて消す」は画面の値を消しますが、コピー先のクリップボードは消せません。

## 📖 使い方

### しきい値法：n枚のうちk枚で戻す

秘密と乱数からn個の「共有（シェア）」を作り、そのうち異なるk個が集まれば元に戻せる方式です。必要数kを「しきい値」と呼びます。n=3、k=2（2-of-3）なら、共有①＋②、①＋③、②＋③のどの組でも戻せます。1枚を失っても残り2枚で戻せます。同じ共有のコピーは2枚分には数えません。

正しい乱数で作った共有だけなら、k−1枚以下から秘密の値はわかりません。秘密の文字を単純に切り分ける方式ではありません。共有には長さやk・nなどの情報は残ります。n−k枚まで失っても戻せますが、k=nでは1枚の紛失で復元できなくなります。

[Day123 ShamirSharing CipherLab](https://ipusiron.github.io/shamir-sharing-cipherlab/)では、座標平面、手計算、バイト表を通して仕組みを学べます。Day123は必要数を先に書く「(k,n)しきい値法」という表記です。学習用のため、実際のパスワードやシードを入力せず、練習用の値を使ってください。

### 入力サイズの上限と換算

秘密本体のサイズは**1〜256バイト**です。1バイトは8ビットなので、最大256 × 8 = 2,048ビットになります。共有に加える種別・指紋などの付加データは、この上限に含めません。

テキストは空白・改行も含めたUTF-8のバイト数で判定します。同じ文字だけを繰り返す場合、入る個数は「256 ÷ 1文字のバイト数」の小数点以下を切り捨てた値です。表の`floor`は小数点以下の切り捨てを表します。

| 入力例 | 1単位のサイズ | 上限の計算 | 入力できる量 |
|---|---|---|---|
| 半角英数字（ASCII） | 1文字で1バイト | `256 ÷ 1 = 256` | 256文字 |
| 「あ」だけ | 1文字で3バイト | `floor(256 ÷ 3) = 85` | 85文字（255バイト） |
| 「😀」だけ | 1個で4バイト | `256 ÷ 4 = 64` | 64個（256バイト） |
| 16進のバイト列 | 2桁で1バイト | `256 × 2 = 512` | 512桁（偶数桁） |

「あ」は85 × 3 = 255バイトまで入り、86 × 3 = 258バイトでは上限を超えます。異なる文字を混ぜる場合は、それぞれのUTF-8バイト数を足します。たとえば`Aあ😀`は1 + 3 + 4 = 8バイトです。日本語には4バイトになる文字もあり、絵文字や結合文字は複数の文字を組み合わせて表示する場合もあるため、見た目の文字数だけではサイズを判断できません。

16進では1桁が4ビット、2桁が8ビット（1バイト）です。そのため、入力する桁数は最大256 × 2 = 512桁になります。

BIP-39では、英単語列から取り出した元の乱数（エントロピー）を分けます。1語は11ビットを表し、語数 ÷ 3ビットのチェックサムを除いてから8で割ると、元の乱数のバイト数が求まります。

| 語数 | チェックサム（ビット） | 元の乱数（バイト） |
|---|---|---|
| 12 | 4 | 16 |
| 15 | 5 | 20 |
| 18 | 6 | 24 |
| 21 | 7 | 28 |
| 24 | 8 | 32 |

12語なら(12 × 11 − 4) ÷ 8 = 16バイト、24語なら(24 × 11 − 8) ÷ 8 = 32バイトです。このサイズは、単語列をUTF-8で保存した場合のサイズとは別です。

### 操作の流れ

画面右上の「?」に、各タブの操作、練習手順、活用例、してはいけないことをまとめています。「保管の指針」で選ぶk・nは、「分ける」の設定には反映されません。初めて使うときは、テキスト「Scatter Seeds」をk=2、n=3で分けて復元を試してください。

1. オフラインの端末で開き、テキスト、偶数桁の16進、または完全な英語BIP-39の語を入力します。テキストはUTF-8へそのまま変換し、正規化しません。上限は256バイトです。
2. `k`と`n`を選びます。2-of-3なら1枚を失っても戻せ、1枚を盗まれても秘密の情報は漏れません。k=nなら1枚でも失うと戻せません。
3. 必要なら40文字以内のラベルと日付を入れます。ラベルに中身、保管場所、持ち主を書かないでください。
4. 「分ける」を押します。全k枚の組の復元検査が終わるまで共有は表示されません。各証書の文字列とQRを別々に印刷し、離れた場所に保管します。プリンターの記憶、印刷キュー、PDF保存先のクラウド同期にも注意してください。
5. 戻すときは同じセットの異なる共有をk枚以上、1行に1枚ずつ貼るか、カメラで1枚ずつ読みます。カメラは1枚読むと止まるため、次の共有ではもう一度「カメラで読む」を押します。検査表とメッセージを確認し、「表示」で秘密を見られます。

BIP-39は12・15・18・21・24語の英語を受け付けます。入力時にNFKD、小文字、空白を整え、語彙とチェックサムを確認します。最初の4文字だけの省略形は受け付けません。チェックサムは4〜8ビットなので、12語では1語を取り違えても約1/16の確率で通ります。元の紙と1語ずつ比べてください。25番目のパスフレーズは扱わないため、別に保管してください。復元結果には番号つきの語と元の乱数の16進を表示します。

入力欄の下に現在のバイト数を表示します。BIP-39では、語とチェックサムの検査が通ると元の乱数のサイズを表示します。入力、種別、枚数、ラベル、日付を変更すると、前の証書は消えます。生成の検査中に変更した場合も処理を中止するため、新しい内容で「分ける」を押し直してください。

各証書の「QRを拡大」で、その1枚を大きく表示できます。共有番号・セットID・必要枚数を確認し、「閉じる」またはEscapeキーで戻ります。QR画像の四辺には4セル分の白余白を含めています。

### 「戻す」タブでの確認

タブ内の「共有を集める → 文字列またはQRを入力する → 検査結果を確認する」の順に操作します。証書のSSS1文字列は1枚につき1行で入力し、紙の途中の折り返しは1行につなげてください。カメラは1枚を追加するたび自動で検査します。

検査表には入力順と証書の共有番号xを区別して表示し、セットID・k/nも実際の値を示します。「検査表の見方」を開くとCRCなどの意味を確認できます。異常があれば入力順ごとに貼り直し・別の共有の追加などを案内します。追加共有の不一致では先頭k枚の復元値を表示できますが、全体の検査は通っていないと表示します。

復元したテキストは引用符付きのJSON形式で表示します。改行は「\n」、文字としてのバックスラッシュは「\\」と区別します。先頭のU+FEFFも保存し、表示では「\uFEFF」と示します。「表示」後の「元のテキストをコピー」は、表示用の引用符やエスケープを含めずにコピーします。バイト単位で保存する場合は、次のPythonの`--raw`を使ってください。

カメラは開始待ちの間も停止できます。別のタブへ移るか「すべて消す」を押すと、開始待ちを含めて中止します。画面が非表示になった場合も停止します。

入力を変更すると前の検査結果と復元値を消します。手入力の変更後は再び「検査して戻す」を押してください。「すべて消す」は戻すタブ内の入力・結果を消し、カメラを止めます。分けるタブやクリップボードの内容は消しません。

## 🔬 書式v1と計算

文字列は`SSS1-`と大文字の16進です。区切りの空白・ハイフンと小文字は読み取り時に許しますが、自動訂正はしません。「戻す」タブとPythonスクリプトでは改行が共有の区切りになるため、1枚の文字列を1行に入力します。1枚のバイト列は次の順です。

| フィールド | 長さ | 内容 |
|---|---:|---|
| 版 | 1バイト | `01` |
| セットID | 4バイト | 乱数。共有を同じセットとして扱う目印。 |
| k、n、x | 各1バイト | `2≤k≤n≤16`、`1≤x≤n`。x=0は拒否。 |
| 分散データ | 秘密長＋5バイト | `種別 ‖ S ‖ 指紋`を1バイトずつ独立の多項式で分けた値。 |
| CRC-32 | 4バイト | それ以前の全バイトのIEEE CRC-32。`123456789`→`CBF43926`。 |

種別は`01`がUTF-8テキスト、`02`がバイト列、`03`がBIP-39の元の乱数です。指紋は`SHA-256(種別 ‖ S)`の先頭4バイトです。種別と指紋も秘密とともに分けます。体はGF(2⁸)、既約多項式は`0x11B`、加算はXORです。係数とセットIDには`crypto.getRandomValues`だけを使います。共有の長さは`5＋2×(秘密のバイト数＋17)`文字です。

| 秘密の長さ | 共有の文字数 | QRの版（英数字、誤り訂正M） |
|---:|---:|---:|
| 16バイト | 71 | 4 |
| 32バイト | 103 | 5 |
| 64バイト | 167 | 7 |
| 128バイト | 295 | 10 |
| 256バイト | 551 | 15 |

CRCは書き写しの誤りを見つけます。指紋が一致しなければ値を表示しません。k枚より多いときは、最初のk枚から決まる多項式に乗らない共有のxを示します。セットIDは32ビットなので偶然の衝突はあり得ます。CRCと4バイトの指紋は認証タグではありません。k枚を持つ攻撃者による意図的な作り直しを防ぎません。

## 🐍 ツールを使わずに復元する

リポジトリーのZIP、手順書の印刷、英語BIP-39語彙の`test/fixtures/bip39-english.txt`を共有と別に保管してください。下のコードを`restore.py`として保存し、オフライン端末のPython 3.10以降で実行できます。標準ライブラリーだけを使います。共有は標準入力から1行ずつ渡し、検査が通るまでは秘密を出しません。コマンド履歴に共有を直接書かないでください。

通常のテキスト出力は、ブラウザーと同じ引用符付きJSON形式です。標準出力の文字コードはUTF-8です。元のテキストをUTF-8のバイト列として保存する場合は`--raw`を指定します。先頭のBOMと元の末尾改行を保ち、改行を追加しません。`--raw`はテキスト種別だけに使えます。

BashまたはWindowsのコマンドプロンプトで実行する例です。

```sh
python restore.py --raw < shares.txt > restored.txt
```

Windows PowerShellでは、次のようにコマンドプロンプト経由で入出力を渡します。PowerShellの文字列変換を通さずに保存できます。

```powershell
cmd /d /c "python restore.py --raw < shares.txt > restored.txt"
```

restored.txtには秘密が平文で保存されます。オフライン端末の保存先を選び、同名の既存ファイルを上書きしないようにしてください。復元エラー時は秘密を出力せず、終了コードが0以外になります。

```python
"""Restore Scatter Seeds v1 shares from stdin using only Python's standard library.

Run offline: python restore.py < shares.txt
One complete SSS1 share per line. No data is written to disk.
Text output is a quoted JSON string encoded as UTF-8.
Use --raw for exact restored text bytes, with no added newline.
"""
import argparse
import hashlib
import json
import sys
import zlib
from pathlib import Path


def mul(a, b):
    result = 0
    for _ in range(8):
        if b & 1:
            result ^= a
        a = ((a << 1) ^ (0x11B if a & 0x80 else 0)) & 255
        b >>= 1
    return result


def inverse(a):
    if not a:
        raise ValueError('zero denominator')
    result = 1
    for _ in range(254):
        result = mul(result, a)
    return result


def parse(raw):
    value = ''.join(c for c in raw.upper() if not c.isspace() and c != '-')
    if not value.startswith('SSS1'):
        raise ValueError('prefix')
    try:
        data = bytes.fromhex(value[4:])
    except ValueError as error:
        raise ValueError('hex') from error
    if not 18 <= len(data) <= 273:
        raise ValueError('length')
    body, crc = data[:-4], int.from_bytes(data[-4:], 'big')
    if zlib.crc32(body) != crc:
        raise ValueError('CRC')
    if body[0] != 1:
        raise ValueError('version')
    set_id, k, n, x, part = body[1:5], body[5], body[6], body[7], body[8:]
    if x == 0 or not 2 <= k <= n <= 16 or x > n:
        raise ValueError('threshold or x')
    return set_id, k, n, x, part


def interpolate(points, at):
    result = bytearray(len(points[0][1]))
    for i, (xi, data) in enumerate(points):
        numerator = denominator = 1
        for j, (xj, _) in enumerate(points):
            if i != j:
                numerator = mul(numerator, at ^ xj)
                denominator = mul(denominator, xi ^ xj)
        weight = mul(numerator, inverse(denominator))
        for pos, value in enumerate(data):
            result[pos] ^= mul(weight, value)
    return bytes(result)


def restore(lines):
    shares = [parse(line) for line in lines if line.strip()]
    if not shares:
        raise ValueError('no shares')
    set_id, k, n, _, data = shares[0]
    if len(shares) < k:
        raise ValueError(f'need {k - len(shares)} more shares')
    if len(shares) > n:
        raise ValueError('too many shares')
    xs = set()
    for sid, ki, ni, x, part in shares:
        if sid != set_id or ki != k or ni != n or len(part) != len(data):
            raise ValueError('mixed shares')
        if x in xs:
            raise ValueError('duplicate x')
        xs.add(x)
    basis = [(x, part) for _, _, _, x, part in shares[:k]]
    combined = interpolate(basis, 0)
    kind, secret, fingerprint = combined[0], combined[1:-4], combined[-4:]
    if kind not in (1, 2, 3) or hashlib.sha256(bytes([kind]) + secret).digest()[:4] != fingerprint:
        raise ValueError('fingerprint mismatch')
    outside = [x for _, _, _, x, part in shares[k:] if interpolate(basis, x) != part]
    return kind, secret, outside


def mnemonic(entropy):
    if len(entropy) not in (16, 20, 24, 28, 32):
        raise ValueError('BIP-39 entropy length')
    source = Path(__file__).resolve().parent / 'test' / 'fixtures' / 'bip39-english.txt'
    word_data = source.read_bytes()
    if hashlib.sha256(word_data).hexdigest() != '2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda':
        raise ValueError('BIP-39 word list checksum')
    words = word_data.decode('utf-8').split()
    if len(words) != 2048:
        raise ValueError('BIP-39 word list length')
    bits = ''.join(f'{byte:08b}' for byte in entropy)
    bits += ''.join(f'{byte:08b}' for byte in hashlib.sha256(entropy).digest())[:len(entropy) // 4]
    return ' '.join(words[int(bits[i:i + 11], 2)] for i in range(0, len(bits), 11))


def safe_text(value):
    """Return unambiguous JSON text while exposing invisible control characters."""
    quoted = json.dumps(value, ensure_ascii=False)
    return ''.join(f'\\u{ord(char):04X}' if 0x7F <= ord(char) <= 0x9F or
                   0x2028 <= ord(char) <= 0x202E or 0x2066 <= ord(char) <= 0x2069 or
                   ord(char) == 0xFEFF else char for char in quoted)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--raw', action='store_true',
                        help='write text secrets as exact UTF-8 bytes, without an added newline')
    args = parser.parse_args()
    try:
        kind, secret, outside = restore(sys.stdin)
        if args.raw and kind != 1:
            raise ValueError('--raw requires a text secret; omit --raw for bytes or BIP-39')
        if kind == 1:
            decoded = secret.decode('utf-8', errors='strict')
            output = secret if args.raw else (safe_text(decoded) + '\n').encode('utf-8')
        elif kind == 2:
            output = (secret.hex().upper() + '\n').encode('utf-8')
        else:
            output = (mnemonic(secret) + '\nEntropy (hex): ' + secret.hex().upper() + '\n').encode('utf-8')
        if outside:
            print('Inconsistent extra shares: ' + ', '.join(map(str, outside)), file=sys.stderr)
        sys.stdout.buffer.write(output)
        sys.stdout.buffer.flush()
    except (ValueError, UnicodeError, OSError) as error:
        print('Restore failed:', error, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
```

英語BIP-39を元の語へ戻すときは、上記語彙ファイルを同じリポジトリー内の位置に置きます。スクリプトは語彙のSHA-256も確認します。計算の要点は、各バイトの点`(x, y)`からラグランジュ補間で`f(0)`を求め、復元した`種別 ‖ S ‖ 指紋`の指紋を検査することです。

## 🔄 関連ツールと先行例

| 観点 | Scatter Seeds | 関連ツール・先行例 |
|---|---|---|
| 目的 | 本物の秘密を紙に分けて保管し、復元を確認する道具 | [Day123 ShamirSharing CipherLab](https://ipusiron.github.io/shamir-sharing-cipherlab/)はGF(p)・GF(2⁸)と落とし穴を学ぶ教材。 |
| 方式 | シャミアの秘密分散だけ | [Day070 VisualCryptography CipherLab](https://ipusiron.github.io/visual-cryptography-cipherlab/)は画像を重ねる視覚暗号の教材。 |
| 紙とQR | k・セットID・CRCを含む独自書式で、全組を復元検査 | [Banana Split](https://github.com/paritytech/banana_split)は秘密を包んで紙とQRへ分ける。 |
| 検査 | 指紋で食い違いを検出し、余分な共有も検査 | [secrets.js](https://github.com/grempe/secrets.js)・Vault・ssssは設計や書式が異なる。 |
| ツール消失への備え | 印刷用手順書と標準ライブラリーだけのPythonスクリプト | 利用者が手順を手元に残せる。 |

調査範囲は限られます。独自書式はSLIP-39対応機器と互換性がありません。

## 🎯 ユースケース

このツールならではの使い方：

- 相続の備え：本人が2-of-3を作り、家族と専門家に別々の共有を渡す。1枚を失っても2枚で戻せます。相続手続きや本人確認の代わりにはなりません。
- 災害時の復旧：事業の復旧キーを3-of-5にし、異なる地域へ置く。2枚が失われても3枚で戻せます。定期的に紙の可読性を確かめます。
- 暗号資産のシード：英語BIP-39の24語を検証して元の32バイトを分ける。共有は103文字、QRは版5です。25番目のパスフレーズは別に保管します。
- 金庫の番号：短いテキストを2-of-3にして分ける。全組の検査後に印刷します。金庫を開ける権限は別に管理します。

## 🔒 保管と限界

### してはいけないこと

- 復元に必要なk枚以上を同じ場所や同じクラウドアカウントにまとめない。1か所から秘密を戻せる状態になる。
- 共有の写真やPDFを、クラウドへ自動同期される場所に保存しない。共有プリンターに印刷物を放置しない。
- ラベルに秘密の内容、保管場所、持ち主を書かない。
- 紛失への備えが必要なときにk=nを選ばない。1枚でも失うと戻せない。
- 復元を確かめる前に元のバックアップを捨てない。確認後も元の秘密を無防備な平文ファイルに残さない。このツールだけを唯一のバックアップ手段にしない。
- 同じ共有のコピーを別の共有として数えない。異なるセットの共有を混ぜない。復元には同じセットの異なる番号が必要。
- 「すべて消す」でクリップボードや印刷済みデータまで消えたと思わない。コピー先、印刷キュー、プリンターの記憶も確認する。

### 点検と限界

年に1回、紙がそろい読めるかを確かめます。「戻す」でk枚を検査し、秘密を表示せずに点検できます。分ける人は元の秘密を見ます。k枚を持つ人の共謀、端末・拡張機能・印刷経路の問題は防げません。乱数はブラウザーを信頼します。JavaScriptは定数時間の実行を保証できません。CRCと指紋は誤入力や食い違いを見つける検査であり、作成者や意図的な改ざんがないことを保証しません。

作者は悪用を勧めません。

## 🧪 テスト

追加の回帰検査は`python test/improvements.browser.py`で実行します。既存のPython Playwright環境を使い、日英・ライト／ダーク・幅320/1280pxで入力バイト数、旧証書の無効化、復元テキスト、QR拡大、合成映像によるカメラの中止を検査します。実機の読み取り性能を測るテストではありません。

Node 22以降で`npm test`を実行します。追加パッケージはありません。GF(2⁸)の65,536通りの掛け算、255個の逆元、参照共有3件、BIP-39公式値、CRC・指紋・余分な共有、全k枚の組、QR版、CSPと同梱ファイルのハッシュ、READMEのPythonスクリプトを検査します。`python test/interface.browser.py`はPlaywrightのChromiumとFirefoxで`file://`、320/390/1280px、印刷、復元、カメラを確認します。ブラウザーテストにはPython Playwright・pypdf・ffmpegが必要です。GitHub ActionsはpushとPRでNodeテストを実行します。

## 📁 ディレクトリー構造

```text
scatter-seeds/                       # ツール本体
├── index.html                       # 3タブの画面とCSP
├── style.css                        # 証書の画面・印刷スタイル
├── app.js                           # 入力、全組検査、復元、カメラ
├── sss-core.js                      # GF(2⁸)、共有v1、CRC、復元
├── sha256-core.js                   # Day118のSHA-256実装
├── bip39.js                         # BIP-39の検証・変換
├── bip39-english.js                 # 英語の2,048語
├── qr.js                            # QR生成・読み取りの包み
├── messages.js                      # 日本語・英語の文言
├── restore.py                       # Pythonの独立復元スクリプト
├── README.md                        # 日本語の説明
├── README.en.md                     # 英語の説明
├── LICENSE                          # MITライセンス
├── package.json                     # Nodeテストの設定
├── vendor/                          # QRライブラリーとライセンス
│   ├── qrcode.min.js                # qrcode-generator 1.4.4
│   ├── jsQR.js                       # カメラ映像のQR解析
│   ├── LICENSE-qrcode-generator.txt # qrcode-generatorのライセンス
│   └── LICENSE-jsQR.txt             # jsQRのライセンス
├── test/                            # Node・ブラウザーテスト
│   ├── core.test.js                 # 既知の値と計算
│   ├── static.test.js               # CSPと同梱ファイル
│   ├── contrast.test.js             # 明暗の文字コントラスト
│   ├── format.test.js               # 可読なソースの行数と行長
│   ├── restore-output.test.js        # PythonのUTF-8表示と元データ出力の検証
│   ├── improvements.browser.py       # 入力変更・カメラ中止・QR拡大・復元表示の回帰検証
│   ├── readme.test.js               # READMEとPython復元
│   ├── interface.browser.py         # file://の実測
│   └── fixtures/                    # 固定の参照データ
│       ├── vectors.json             # 共有・BIP-39・QRの参照値
│       └── bip39-english.txt        # BIP-39英語語彙
├── assets/                          # READMEのスクリーンショット
│   ├── ja/                          # 日本語画面
│   │   ├── light/                   # 日本語ライト
│   │   │   ├── split.png            # 分ける画面
│   │   │   ├── shares.png           # 共有の証書
│   │   │   ├── print.png            # 印刷プレビュー
│   │   │   ├── restore.png          # 戻す・検査表
│   │   │   └── guide.png            # 保管の指針
│   │   └── dark/                    # 日本語ダーク
│   │       ├── split.png            # 分ける画面
│   │       ├── shares.png           # 共有の証書
│   │       ├── print.png            # 印刷プレビュー
│   │       ├── restore.png          # 戻す・検査表
│   │       └── guide.png            # 保管の指針
│   └── en/                          # 英語画面
│       ├── light/                   # 英語ライト
│       │   ├── split.png            # 分ける画面
│       │   ├── shares.png           # 共有の証書
│       │   ├── print.png            # 印刷プレビュー
│       │   ├── restore.png          # 戻す・検査表
│       │   └── guide.png            # 保管の指針
│       └── dark/                    # 英語ダーク
│           ├── split.png            # 分ける画面
│           ├── shares.png           # 共有の証書
│           ├── print.png            # 印刷プレビュー
│           ├── restore.png          # 戻す・検査表
│           └── guide.png            # 保管の指針
└── .github/                         # GitHub Actions
    └── workflows/                   # CI定義
        └── test.yml                 # Node 22のテスト
```

`assets`の各テーマには`split.png`、`shares.png`、`print.png`、`restore.png`、`guide.png`を置きます。

## 💻 動作環境

vanilla JavaScriptの通常スクリプトで、通信やビルドを必要としません。`file://`とGitHub Pagesで使えます。カメラはブラウザーの許可が必要です。利用できない場合はGitHub Pages版か文字列の貼り付けを使ってください。

## 📄 ライセンス

- ツール本体は[MIT License](LICENSE)です。
- [qrcode-generator](vendor/LICENSE-qrcode-generator.txt)と[jsQR](vendor/LICENSE-jsQR.txt)は同梱のライセンスに従います。
- BIP-39英語語彙は[bitcoin/bips](https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt)のMITライセンス資料に由来します。

---

## 🛠️ このツールについて

本ツールは、「生成AIで作るセキュリティツール200」プロジェクトの一環として開発されました。このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

🔗 [https://akademeia.info/?page_id=44607](https://akademeia.info/?page_id=44607)
