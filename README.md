# やさしい一分 (Yasashii Ippun)

**60秒の休憩ガイドと、とげのある文をやわらかくする言い換えのChrome拡張（Manifest V3）。すべてブラウザ内で動き、外部には何も送りません。**

A small Chrome extension: a 60-second breathing break and a simple rule-based softener for blunt Japanese sentences. Everything runs locally. Interface is Japanese.

## できること
- **60秒休憩**：ツールバーのボタンから、呼吸に合わせた60秒のガイドを表示します。
- **スクロール休憩の提案**：設定で指定したサイトでたくさんスクロールしたときだけ、休憩を提案します。既定ではオフです。
- **やさしい言い換え**：文を選んで右クリック →「やさしく言い換える」。単純なルールでの言い換えで、AIは使いません。
- **記録**：今日の回数、連続日数、合計回数をブラウザ内に保存します。

## インストール

### 方法1：zipから読み込む（Windows・Mac・Linux）
1. [Releases](https://github.com/johnknash2025/yasashii-ippun/releases/latest) から `yasashii-ippun-<version>.zip` をダウンロードして展開
2. Chromeで `chrome://extensions` を開き、右上の「デベロッパーモード」をオン
3. 「パッケージ化されていない拡張機能を読み込む」で、展開したフォルダを選択

ソースから使う場合は、このリポジトリの `extension/` フォルダを同じ手順で読み込めます。

### 方法2：.crxファイル（主にLinux）
Releases の `.crx` を `chrome://extensions` にドラッグ＆ドロップします。Windows・MacのChromeはストア外の.crxを受け付けないことが多いので、方法1を使ってください。

## 権限
| 権限 | 理由 |
| --- | --- |
| storage | 設定と休憩の記録を保存 |
| contextMenus | 右クリックの「やさしく言い換える」 |
| activeTab, scripting | ボタンや右クリックを押したタブにだけ表示を出す |
| サイトへのアクセス（任意） | 設定で書いたサイトの分だけ、保存時に許可を求めます |

## 開発
```
npm install
npm test        # ロジックの単体テスト
npm run pack    # dist/ に zip と crx を作成（鍵は KEY_PATH、リポジトリには入れない）
```

## 状況
| 確認済み | 方法 |
| --- | --- |
| サイト判定、統計、言い換えルール | 自動テスト5件が合格 |
| 全スクリプトの構文 | Node.jsで構文チェック |
| **未確認** | |
| 実際のChromeでの一通りの動作 | まだ手元のChromeで通しで試していません |

不具合や要望は [Issue](https://github.com/johnknash2025/yasashii-ippun/issues/new?template=feedback.yml) へどうぞ。

## ライセンス
[MIT](LICENSE) © johnkhappy
