# Bouldering Tracker（日本語）

このディレクトリには、Google スプレッドシート用ボルダリングトラッカーのコードと運用ドキュメントが含まれます。

## ファイル構成
- `bouldering_tracker.gs` — メイン Apps Script
- `bouldering_tracker_views.gs` — ランキング/新着課題ビュー
- `appsscript.json` — Apps Script マニフェスト
- `.claspignore` — push 対象を `Code.gs`, `Views.gs`, `appsscript.json` に限定
- `bouldering_tracker_user_guide.md` — ユーザーガイド（英語）
- `bouldering_tracker_user_guide_ja.md` — ユーザーガイド（日本語）
- `GEMINI_SPREADSHEET_ASSISTANT_GUIDE.md` — Google 組み込み AI 補助向けガイド
- `ARCHITECTURE.md` — アーキテクチャ
- `SECURITY.md` — セキュリティ方針
- `TESTING.md` — 事前テスト手順
- `SUPPORT.md` — サポート / 不具合報告（英語）
- `SUPPORT_ja.md` — サポート / 不具合報告（日本語）
- `CHANGELOG.md` — 変更履歴

## クローンと初期セットアップ

### Private リポジトリ（推奨）
```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
./setup.sh <SPREADSHEET_ID>
```

前提条件（Google アカウントごとに一度）:
- Apps Script API を有効化:  
  `https://script.google.com/home/usersettings`
- 有効化直後は 1〜3 分待ってから実行

`<SPREADSHEET_ID>` の取得方法:
1. 対象の Google Sheet を開く
2. URL の `/d/` と `/edit` の間をコピー

例:
```text
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0
```
Spreadsheet ID:
```text
1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

Private リポジトリで認証が必要な場合:
```bash
gh auth login
```

### 更新時
```bash
cd <repo>
git pull
./update.sh
```

## UI 言語（EN/JA）
- `Settings` の `J2`（UI Language）を `EN` または `JA` に設定
- **Tracker Tools → Apply UI Language** を実行

## データモデル（重要）

### Source-of-truth タブ
- `Customers`
- `Routes`
- `Logbook`
- `TrainingLog`
- `Settings`
- `EventLog`

### 生成/再構築タブ
- `Data`
- `Customer Profile`
- `Route Profile`
- `Rankings View`
- `New Routes`

生成タブが崩れた場合は:
- `Setup / Repair Spreadsheet`
- `Sync IDs & Dashboards`
を実行して再構築してください。

## EventLog 起点の再構築
- EventLog スキーマ列:  
  `Timestamp, Event Type, Entity Type, Entity ID, Payload JSON, Actor, Schema Version`
- **Rebuild Tables from EventLog** で `Customers / Routes / Logbook / TrainingLog` を再生成
- **Prepare Event Entry Tab** でガイド付きイベント入力 UI を作成
- **Apply Event Entry Rows** でチェック済みイベント行を EventLog へ反映
- **Migrate Existing Tables to EventLog** で既存シートを EventLog へ移行
- `./update.sh` 後は **Run Post-Update Routine** を実行
- テスト再投入前は **Reset Data (Safe)** 推奨（重複防止）

## テストデータ
- `testdata/events_fixture.csv`
- `testdata/events_fixture_medium.csv`
- `testdata/events_fixture_large.csv`

CSV を `EventLog`（2行目以降）に取り込んだ後:
1. **Rebuild Tables from EventLog**
2. **Run Post-Update Routine**

## ランキングを Web 公開する

### 1) Rankings タブのみ公開
1. Google Sheets で **ファイル → 共有 → ウェブに公開**
2. タブを **Rankings View** に指定
3. 形式を **CSV** に指定
4. 公開 URL をコピー

### 2) テンプレートで表示
- `web/rankings_embed.html` を使用
- `CSV_URL = 'PASTE_PUBLISHED_RANKINGS_CSV_URL_HERE'` を置換
- GitHub Pages / Netlify / Vercel などでホスト
- 1分ごとに自動更新

### 3) iframe で埋め込み
```html
<iframe src="PUBLISHED_RANKINGS_PAGE_URL" width="100%" height="800" frameborder="0"></iframe>
```

## サポート / 不具合報告
- 日本語: `SUPPORT_ja.md`
- 英語: `SUPPORT.md`
  - バグ報告テンプレート
  - スクリーンショット証跡チェックリスト
  - よくある問題の対処
- 開発ルール: `DEVELOPMENT_GUARDRAILS.md`

## 運用ルール
スクリプト変更時は必ず:
1. `CHANGELOG.md` 更新
2. EN/JA ドキュメント更新
3. テスト証跡の確認
