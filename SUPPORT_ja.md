# サポート / 不具合報告 / トラブルシューティング

## 不具合報告の最短ルート
このリポジトリの GitHub Issue に、以下を添えて報告してください。

1. **タイトル**：短い要約
2. **環境情報**：
   - Google アカウント種別（個人 / Workspace）
   - ブラウザ名 + バージョン
   - シート URL（必要なら一部伏せる）
   - スクリプトのバージョン / コミット（分かる範囲で）
3. **再現手順**（番号付き）
4. **期待結果**
5. **実際の結果**
6. **スクリーンショット / 動画**
7. **イベントサンプル**（該当時）：EventLog の関連行

## スクリーンショット証跡チェックリスト
可能なら、スクリーンショットに以下を含めてください。
- アクティブなタブ名
- 問題が起きるセル参照（例: `J2`）
- 数式バー（数式/表示の不具合時）
- データ入力規則（プルダウン不具合時）
- 問題発生前に使ったメニュー（`Tracker Tools -> ...`）

## よくある問題と対処

### 1) CSV 取り込み後にデータが反映されない
以下を実行:
1. `Tracker Tools -> Rebuild Tables from EventLog`
2. `Tracker Tools -> Run Post-Update Routine`

### 2) プルダウンが壊れている / バリデーションエラー
以下を実行:
1. `Tracker Tools -> Run Post-Update Routine`
2. シートタブを再読み込み

### 3) 言語が混在している / 表示言語がおかしい
1. `Settings!J2` を `EN` または `JA` に設定
2. `Tracker Tools -> Apply UI Language` を実行
3. シートタブを再読み込み

### 4) デモデータが重複した
`Import Demo/Test Data` の前に `Tracker Tools -> Reset Data (Safe)` を実行

### 5) ランキングの並び替えが更新されない
`Rankings View!B1` で並び替え条件を変更。
反映が遅い場合は `Refresh Rankings & New Routes Views` を実行。