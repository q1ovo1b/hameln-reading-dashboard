# Hameln Reading Dashboard

ハーメルンの `type=all` 読書データページを月ごとに保存し、個人用の読書アーカイブとして集計・表示する静的サイトです。

作品・原作・月別の読書量を振り返れます。GitHub Pages に公開できるほか、`index.html` を直接開いてもデータを表示できます。

## 使い方

1. ハーメルンの `type=all` 読書データページをブラウザで保存します。
2. 保存したHTMLを `raw/` に置き、`YYYY-MM.html` 形式で名前を付けます。
3. 変換スクリプトを実行します。
4. `index.html` を開くか、Webサーバー経由でサイトを開きます。

保存ファイル名の例:

```text
raw/2026-05.html
raw/2026-06.html
raw/2026-07.html
```

## データを更新する

`raw/` にHTMLを追加した後、プロジェクトのルートで次を実行します。

```bash
python scripts/convert_hameln_html.py
```

Windowsで Python Launcher を使う場合:

```bash
py scripts/convert_hameln_html.py
```

変換時には、次の2ファイルが同時に更新されます。

- `data/reading_data.json` — Webサーバー／GitHub Pagesで優先して使うデータ
- `data/reading_data.js` — `index.html` を直接開いたときのフォールバック用データ

HTMLが見つからない場合、既存のデータは変更せず、保存方法の案内だけを表示します。ハーメルン側のHTML構造が変わった場合は、`scripts/convert_hameln_html.py` の表検出・`parse_*` 関数を調整してください。

## 表示とデータ読み込み

サイトは通常、`data/reading_data.json` を `fetch` で読み込みます。ブラウザの制限により `file://` で直接開いたページからJSONを取得できない場合は、同じ内容を持つ `data/reading_data.js` へ自動で切り替わります。

そのため、次のどちらでも利用できます。

- `index.html` を直接ブラウザで開く
- ローカルWebサーバーまたはGitHub Pagesで開く

Webサーバーで確認する場合の例:

```bash
py -m http.server 5500
```

ブラウザで `http://localhost:5500` を開いてください。5500番ポートが使用中の場合は、空いている番号に変更できます。

## 主な機能

- 全期間・年別・月別の作品数、話数、文字数の集計
- 選択月の日別読書量、作品ランキング、原作ランキング
- 作品／原作ごとの累計読書量と読書月の一覧
- 作品名・原作名の検索、年月フィルター、並び順の変更
- 長い一覧の段階表示と全件表示

年フィルターは月別推移と一覧に、月フィルターは選択月の詳細と作品・原作一覧に反映されます。作品数・話数・文字数がすべて0の月は初期状態では省略され、「0件の月も表示する」で確認できます。

## ファイル構成

```text
├─ index.html                       # サイトの入口
├─ src/
│  ├─ main.js                       # 集計、検索、表、グラフ、データ読み込み
│  └─ style.css                     # デザイン
├─ data/
│  ├─ reading_data.json             # 月次データ（通常時に利用）
│  └─ reading_data.js               # 直接開く場合のフォールバックデータ
├─ raw/                             # 非公開の元HTML置き場
├─ scripts/convert_hameln_html.py   # HTML → データ変換
├─ DESIGN.md                        # デザイン方針
├─ .gitignore
└─ .nojekyll
```

## GitHub Pagesで公開する

1. 必要なファイルをGitHubリポジトリへコミット・プッシュします。
2. GitHubの **Settings → Pages** を開きます。
3. **Build and deployment** のSourceで「Deploy from a branch」を選び、通常は `main` ブランチと `/ (root)` を指定します。
4. 表示されたURLを開いて確認します。

すべて相対パスのため、`https://ユーザー名.github.io/リポジトリ名/` 形式でも利用できます。

## プライバシー

`raw/*.html` は `.gitignore` に含まれており、元のHTMLを公開しない設計です。一方、`data/reading_data.json` と `data/reading_data.js` には作品名・原作名・読書量が含まれるため、公開前に内容を必ず確認してください。

サイト上では元HTMLのファイル名を表示しません。JSON内の `sourceFile` はデータ追跡用にだけ保持します。作者名は元HTMLに含まれない前提のため扱いません。また日別データは日ごとの合計であり、その日に読んだ作品の内訳までは表示しません。
