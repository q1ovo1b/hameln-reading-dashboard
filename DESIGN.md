# Design System

モノクロ・ミニマル・タイポグラフィック。個人のためのアーカイブ型サイトに適したデザインシステムです。
実験的な個人サイトや音楽家の公式サイト、文字をビジュアルとして扱うWebデザインを方向性の参考にしています。

読書記録ダッシュボードでの実装を元に、ポートフォリオサイトへ転用するための汎用的な仕様としてまとめています。

---

## 1. Philosophy

- **「見せる」より「読ませる」** ── 情報そのものの質で勝負する。装飾でごまかさない。
- **白と黒のあいだにある階調だけで構成する** ── 派手なグラデーションや多色使いは避け、紙の上の印刷物のように。
- **余白は情報のかたちを決める** ── 要素を詰め込まず、空間で構造を伝える。
- **文字はグラフィックである** ── 特にタイトルやナビゲーションでは、文字をロゴや記号のように扱う。
- **インタラクションは控えめに、しかし確かに** ── アニメーションは必要最小限。動きそのものが主張しないこと。

---

## 2. Color Palette

```css
:root {
  --ink: #141414;        /* 本文・線・強調したい境界 */
  --muted: #6d6d68;      /* 補足文・ラベル・キャプション */
  --paper: #f7f7f4;      /* ページ背景（わずかに温かみのある白） */
  --panel: #fcfcfa;      /* カード・パネル背景（paperより明るい） */
  --line: #d5d5ce;       /* 区切り線・弱い境界 */
  --soft: #ededE8;       /* ホバー背景・補助領域 */
  --accent: #d94e2b;     /* アクセント（1色のみ） */
  --accent-dark: #a93218; /* アクセント（ホバーなどの濃い状態） */
}
```

| Token | Role |
|---|---|
| `--ink` | 本文、罫線（上部）、ボタン枠線。最も黒に近いが真っ黒ではない |
| `--muted` | ラベル、キャプション、補足テキスト、フッター |
| `--paper` | ページ全体の背景 |
| `--panel` | カード・テーブルなど、紙より一段明るい面 |
| `--line` | カード間の区切り、テーブルの横罫、弱い境界線 |
| `--soft` | ホバー時の背景、行詳細の背景 |
| `--accent` | **唯一の有彩色**。見出し番号、リンク下線、フォーカスリング、選択ハイライト、グラフ |
| `--accent-dark` | リンクホバー時の濃色 |

### 使用ルール
- アクセントカラーは **1色だけ**。2色目を追加しない。
- 情報の強弱は色数ではなく、黒〜グレーの階調と余白で表現する。
- 背景は `--paper` と `--panel` の2段階のみ。3段階以上にしない。

---

## 3. Typography

### フォントスタック

```css
--serif: "Times New Roman", "YuMincho", "Yu Mincho",
         "Hiragino Mincho ProN", "MS PMincho", serif;
--sans:  "Helvetica Neue", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
         "Yu Gothic", Arial, "Noto Sans JP", sans-serif;
```

| 用途 | フォント | 備考 |
|---|---|---|
| ページ大タイトル | `--serif`（明朝体） | 文字をビジュアルとして見せる |
| 本文、表、UI | `--sans`（ゴシック体） | 可読性優先 |

### サイズスケール

| レベル | サイズ | 用途 |
|---|---|---|
| 大見出し | `clamp(4.2rem, 15.5vw, 12.5rem)` | サイトタイトル（h1） |
| セクション見出し | `clamp(1.65rem, 3.3vw, 3rem)` | 各セクションのh2 |
| アコーディオン見出し | `clamp(1.35rem, 2.6vw, 2.3rem)` | details/summary |
| 数値（大） | `clamp(1.35rem, 2.6vw, 2.25rem)` | サマリーカードの数値 |
| リード文 | `clamp(.95rem, 1.6vw, 1.25rem)` | ヘッダー下部のサブタイトル |
| 本文 | `15px` | body |
| テーブル | `.87rem` | 表のセル |
| 小見出し（h3） | `.8rem` | パネル・グラフのタイトル |
| ナビゲーション | `.76rem` | セクションナビのリンク |
| ラベル | `.73rem` | フィルターラベル、カードのdt |
| アイブロウ・番号 | `.68rem` | セクション番号、eyebrow |
| フッター | `.65rem` | フッターテキスト |

### 文字間・スタイル

- **タイトル**: 文字間を広げ、1文字ずつ `span` で囲んで `display: flex` + `gap` で配置する。記号的・ロゴ的に見せるのが目的。
  ```html
  <h1><span>読</span><span>書</span><span>記</span><span>録</span></h1>
  ```
- **ナビゲーション**: `letter-spacing: 0.12em`、全角スペース区切りで単語を見せる（例: 「作　品」「原　作」）。
- **アイブロウ（eyebrow）**: `letter-spacing: 0.16em`、全て大文字の英字（例: `HAMELN / PERSONAL READING ARCHIVE`）。
- **セクション番号**: `letter-spacing: 0.13em`、`01 / OVERVIEW` の形式。
- **数値データ**: `font-feature-settings: "tnum"`（等幅数字）を適用し、桁が変わってもレイアウトが崩れないようにする。

---

## 4. Layout & Spacing

### 最大幅
```css
max-width: 1240px;
```
サイドパディングは `max(1.25rem, calc((100% - 1240px) / 2))` で画面幅に応じて可変。

### 垂直リズム

| 要素 | マージン |
|---|---|
| セクション間 | `5.5rem`（`margin-top`） |
| セクション内要素間 | `2rem`〜`2.5rem` |
| ヘッダー下部 | `padding-bottom: 3.4rem` |
| カード内 | `padding: 1.25rem 1.1rem` |
| テーブルセル | `padding: .92rem .7rem` |
| コンテナ下部 | `padding-bottom: 6rem` |

### セクションヘッダー
```css
.section-heading {
  display: grid;
  grid-template-columns: 180px 1fr;  /* 番号エリア + 見出し */
  align-items: baseline;
  gap: 1rem;
}
```
番号と見出しを横並びにし、番号は固定幅。レスポンシブ時は縦積み。

---

## 5. Components

### 5.1 ヘッダー（Masthead）

サイト最上部。大きな余白を確保し、ミニマルに構成する。

```
┌──────────────────────────────────────────┐
│ HAMELN / PERSONAL READING ARCHIVE       │ ← eyebrow（アクセント色、小文字）
│                                          │
│  読  書  記  録                           │ ← h1（明朝体、巨大、字間広）
│                                          │
│ 読んだものが、時間の輪郭になる。  ───────────── │ ← subtitle + 区切り線
│                         EST. 2026 · ... │ ← メタ情報
└──────────────────────────────────────────┘
```

- `min-height: clamp(300px, 48vw, 540px)` で画面の約半分の高さを確保
- コンテンツは下端揃え（`align-items: flex-end`）
- 下部に `border-bottom: 1px solid var(--ink)` で強い区切り

### 5.2 ナビゲーション（Section Nav）

```css
.section-nav {
  position: sticky; top: 0; z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(247, 247, 244, 0.92);  /* paper + 透過 */
}
```

- スクロール追従（sticky）
- すりガラス効果（`backdrop-filter`）で下のコンテンツをぼかす
- デフォルトでは下部ボーダーなし → スクロール時に `border-bottom` を表示（`.scrolled`）
- 左端に `INDEX` ラベル（`margin-right: auto` で左寄せ）
- 各リンクは `::after` 疑似要素で下線が左から伸びるホバー演出
- 現在地のリンクは `.active` で黒字 + 下線表示（JSによる IntersectionObserver で制御）

### 5.3 サマリーカード

```css
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3列（SP: 2列 → 1列） */
  border-top: 1px solid var(--ink);        /* 上辺のみ強い線 */
  border-left: 1px solid var(--line);      /* 左辺は弱い線 */
}
.summary-card {
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  min-height: 138px;
}
```

| 部分 | スタイル |
|---|---|
| ラベル（dt） | `--muted`、小文字、太字 |
| 数値（dd） | 大サイズ、1枚目のカードのみ `--accent` 色 |
| ホバー | 左端にアクセント色の縦線が上から伸びる（`::before`） + 背景 `--soft` |

### 5.4 テーブル

```css
table {
  border-collapse: collapse;
  font-size: 0.87rem;
  font-feature-settings: "tnum";  /* 等幅数字 */
}
th { color: var(--muted); font-size: 0.68rem; letter-spacing: 0.08em; }
td { border-bottom: 1px solid var(--line); }
tbody tr:hover { background: var(--soft); }
```

- 罫線は `--line` で薄く。縦罫は引かず、横罫 + 余白で行を分ける。
- ヘッダ行は小文字 + 字間広めでラベル的役割を明確に。
- 横スクロールが必要な場合は `.table-wrapper` で包む（`overflow-x: auto`）。
- 数値列は `.numeric` で右寄せ + 等幅 + 改行禁止。

### 5.5 ボタン

```css
button {
  border: 1px solid var(--ink);
  border-radius: 0;          /* 角丸なし */
  background: transparent;
  transition: color 0.22s, background-color 0.22s;
}
button:hover {
  color: #fff;
  background: var(--ink);    /* 黒く塗りつぶす */
}
```

- 角丸禁止（`border-radius: 0`）
- 小さめ（`font-size: .76rem`）、細い枠線
- ホバーで反転（白文字 + 黒背景）
- 影は付けない

### 5.6 フォーム（input / select）

```css
input, select {
  border: 0;
  border-bottom: 1px solid var(--ink);  /* 下線のみ */
  border-radius: 0;
  background: transparent;
}
input:focus, select:focus {
  border-color: var(--accent);          /* フォーカスでアクセント色に */
}
```

- ボックスではなく下線のみのミニマルなスタイル
- `select` の矢印はCSSのみで描画（`background-image` で三角形を生成）
- チェックボックスは `accent-color: var(--accent)`

### 5.7 アコーディオン（details / summary）

```html
<details class="section-details">
  <summary>年別ダッシュボード</summary>
  <div class="details-content">...</div>
</details>
```

- `summary` のデフォルトマーカーは非表示（`::-webkit-details-marker { display: none }`）
- 代わりに `summary::before` で `+` / `−` を表示（アクセント色、開閉で回転アニメーション）
- summary ホバーでアクセント色に
- 開閉アニメーションはJS不要（ブラウザネイティブ）
- セクション全体を `border-top: 1px solid var(--ink)` `border-bottom: 1px solid var(--line)` で囲む

### 5.8 グラフ（Chart.js）

```js
Chart.defaults.font.family = "...";   // サイトと同じフォント
Chart.defaults.color = "#6d6d68";     // muted
Chart.defaults.borderColor = "#d5d5ce"; // line
Chart.defaults.plugins.tooltip.backgroundColor = "#141414";
Chart.defaults.plugins.tooltip.cornerRadius = 0;
Chart.defaults.scales.x.grid = { color: "transparent" };
Chart.defaults.scales.y.grid = { color: "#ededE8" };
```

- バーチャート `backgroundColor: "#d94e2bb8"`, `borderColor: "#d94e2b"`, `borderRadius: 0`
- 凡例は非表示（`legend: { display: false }`）
- グラフパネルは背景透明、上部に `--ink` の細線、下部に `--line` の細線

### 5.9 フッター

```css
footer {
  display: flex;
  justify-content: space-between;  /* 3つの情報を均等配置 */
  border-top: 1px solid var(--ink);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
}
```

- 3カラム均等割り（左・中央・右）、SP時は縦積み
- 情報量は少なく、ラベルのように扱う

---

## 6. Motion & Interaction

### 基本方針
- すべてのトランジションに `cubic-bezier(0.4, 0, 0.2, 1)`（標準ease）または `cubic-bezier(0, 0, 0.2, 1)`（ease-out）を使用。
- 持続時間は `.15s`〜`.35s`。`.9s` はスクロールリビールのみ。
- `@media (prefers-reduced-motion: reduce)` でアニメーションを無効化。

### スクロールリビール
```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s, transform 0.9s;
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

- IntersectionObserver で画面に入った要素に `.revealed` を付与（`threshold: 0.12`）
- カードはスタガー表示（1枚ずつ60ms遅延）

### ナビゲーション スクロールスパイ
- IntersectionObserver で現在表示中のセクションを判定（`rootMargin: "-50% 0px -50% 0px"` → 画面中央を基準）
- 該当するナビリンクに `.active` を付与

### ホバー共通
- リンク: `color` トランジション（`.22s`）
- ボタン: `color` + `background-color` トランジション（`.22s`）
- カード: `background-color` トランジション（`.3s`） + `::before` の高さアニメーション（`.35s`）
- テーブル行: `background-color` トランジション（`.18s`）
- ナビリンク: `color` + `::after` の `width` アニメーション（`.25s` / `.3s`）

### フォーカス
```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```
マウス操作時は表示せず、キーボード操作時のみアクセント色のフォーカスリングを表示。

---

## 7. Responsive Breakpoints

| ブレークポイント | 変更内容 |
|---|---|
| `max-width: 760px` | セクション見出し縦積み、カード2列、フィルター縦積み、グラフ1列、フッター縦積み、ナビラベル非表示 |
| `max-width: 430px` | サマリーカード1列 |

フォントサイズには `clamp()` を多用し、ブレークポイントに依存しない流動的なタイポグラフィを実現。

---

## 8. CSS Custom Properties 一覧

```css
:root {
  /* Color */
  --ink: #141414;
  --muted: #6d6d68;
  --paper: #f7f7f4;
  --panel: #fcfcfa;
  --line: #d5d5ce;
  --soft: #ededE8;
  --accent: #d94e2b;
  --accent-dark: #a93218;

  /* Typography */
  --serif: "Times New Roman", "YuMincho", "Yu Mincho",
           "Hiragino Mincho ProN", "MS PMincho", serif;
  --sans: "Helvetica Neue", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
          "Yu Gothic", Arial, "Noto Sans JP", sans-serif;

  /* Easing */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 9. JavaScript Patterns

### IntersectionObserver（スクロールリビール）
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll("section, .panel").forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});
```

### ナビゲーション スクロールスパイ
```js
const activeObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((e) => e.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
  if (visible.length) {
    const id = visible[0].target.id;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }
}, { rootMargin: "-50% 0px -50% 0px" });
```

### Chart.js グローバル設定
```js
Chart.defaults.font.family = "...";
Chart.defaults.color = "#6d6d68";
Chart.defaults.borderColor = "#d5d5ce";
Chart.defaults.plugins.tooltip.backgroundColor = "#141414";
Chart.defaults.plugins.tooltip.cornerRadius = 0;
Chart.defaults.plugins.tooltip.displayColors = false;
```

---

## 10. ポートフォリオへの転用时のポイント

### 置き換えの目安

| 読書記録ダッシュボード | → ポートフォリオ |
|---|---|
| 全期間の記録（Overview） | 自己紹介・プロフィール |
| 年別／月別ダッシュボード | 経歴（年表・タイムライン） |
| 作品別一覧 | プロジェクト一覧 / 実績 |
| 原作別一覧 | スキルセット / カテゴリ |
| 月別推移グラフ | 活動量の推移（GitHub contributions等） |
| サマリーカード | 主要KPI（プロジェクト数、経験年数、etc） |

### 追加を検討できる要素
- **ロゴマーク**: タイポグラフィだけのサイトなので、イニシャルを組んだタイポグラフィックなロゴが馴染む
- **コンタクトフォーム**: 下線のみのインプットスタイルを踏襲
- **画像表示**: モノクロフィルター + 控えめな枠線で統一感を保つ。カラーのままでもアクセントとして機能する
- **SNSリンク**: フッターに小さいアイコン（アクセント色）として配置

### やってはいけないこと
- 新しい色を追加しない（アクセントは1色のまま）
- カードに影（`box-shadow`）を付けない
- 角丸（`border-radius`）を使わない
- 背景にグラデーションを使わない
- アニメーションを派手にしない（bounce, elastic などは使わない）

---

## 11. ファイル構成リファレンス

```
project/
├── index.html          # 単一HTML（セクション区切りで全ページを構成）
├── src/
│   ├── style.css       # すべてのスタイル（CSS Custom Propertiesで一元管理）
│   └── main.js         # データ取得、レンダリング、IntersectionObserver、Chart.js
├── data/
│   └── *.json          # 静的データ（fetchで読み込み）
└── DESIGN.md           # このファイル
```

依存ライブラリは Chart.js のみ（CDN）。ビルドステップ不要の静的サイト。
