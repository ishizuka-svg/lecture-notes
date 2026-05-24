# STATUS.md — 現在地と詰まりの記録

## 現在地 (2026-05-25 時点)

### 完了
- [x] React + Vite プロジェクト作成
- [x] Gemini API 連携（`gemini-2.5-flash` / inline_data）
- [x] APIキーをlocalStorageに保存する初回ゲート
- [x] 音声ファイルインポート（mp3/m4a/wav/aac/ogg/flac/aiff/webm）
- [x] 文字起こし・3行要約・3〜5要点の自動生成
- [x] 科目タグの自動推測（Gemini）
- [x] ブラウザ内録音（MediaRecorder、20MB自動停止）
- [x] 履歴のlocalStorage保存・科目フォルダ表示・タグ編集・削除
- [x] 各セクションのコピーボタン
- [x] レスポンシブデザイン（スマホ対応）
- [x] OS連動ダークモード
- [x] ノート風デザイン（紙色 / 罫線 / 付箋 / マスキングテープ / 蛍光マーカー）
- [x] GitHub Pages へデプロイ
- [x] `.gitignore` で `.env`・音声ファイル除外
- [x] 公開リポジトリにAPIキーが含まれていないことを検証

### 未着手 (将来拡張候補)
- [ ] 20MB超への対応 (Files API 経由)
- [ ] 文字起こしの編集機能（誤認識を手で直す）
- [ ] 結果のPDF / Markdown エクスポート
- [ ] 履歴のキーワード検索
- [ ] APIキーへの暗号化レイヤー追加（パスフレーズ）
- [ ] PWA化（オフラインキャッシュ・ホーム画面追加）
- [ ] 講義中のリアルタイム文字起こし

---

## 詰まりの記録

### 詰まり① Gemini モデル名の特定
**症状**: 公式ドキュメント (`https://ai.google.dev/gemini-api/docs/models?hl=ja`) を確認したが、音声入力対応の安定版モデルIDが断片的でWebFetchの結果も揺れていた。

**原因**: ドキュメントの該当モデルが多く（Live系、TTS系、汎用系など）、無料枠×安定版×音声入力 の交差を整理する必要があった。

**解決**: 料金ページ (`https://ai.google.dev/gemini-api/docs/pricing`) で無料枠対応の安定版を確認し、`gemini-2.5-flash` を採用。

**学び**: 一次情報を複数ページで突き合わせるのが確実。

---

### 詰まり② `dist/` の中身がドキュメントと違った
**症状**: README の例では `vite.svg` を含めるよう書いていたが、実際の `dist/` には `vite.svg` が無く `favicon.svg` と `icons.svg` があった。

**原因**: 使用したViteテンプレートのバージョンによって `public/` 内のファイル構成が異なっていた。

**解決**: 実際の `dist/` の中身を `ls` で確認してから案内し直した。

**学び**: テンプレート由来のファイルは事前に確認する。ドキュメントは実体ベースで書く。

---

### 詰まり③ `npm run dev` でスクリプトが見つからないエラー
**症状**:
```
npm error Missing script: "dev"
```

**原因**: コマンドをホームディレクトリ (`~`) で実行していた。ホームにも別の `package.json` が存在していたためそちらを参照していた。

**解決**: `cd ~/lecture-notes` してから実行。

**学び**: Node プロジェクトのコマンドは必ずプロジェクトルートで実行する。

---

### 詰まり④ GitHub Pages 公開時のbase URL
**症状**: GitHub Pages にデプロイしたとき、リポジトリ名が URL に含まれる (`/lecture-notes/`) ため、Viteの `base` 設定を切り替える必要があった。

**解決**: `vite.config.js` で環境変数 `GITHUB_PAGES=true` のときだけ `base: '/lecture-notes/'` を有効化:
```js
const base = process.env.GITHUB_PAGES === 'true' ? '/lecture-notes/' : '/'
```
ローカル開発時はデフォルトの `/` のままなので開発体験が損なわれない。

**学び**: ローカル / 本番で base が変わるアプリは環境変数で切替えるのが定石。

---

## 既知の制限事項
| 項目 | 現状 | 影響 |
|---|---|---|
| 音声サイズ上限 | 20MB | 長時間講義（90分以上）はそのままでは処理不可。事前カットが必要 |
| APIキーの保存 | localStorage 平文 | XSSが発生した場合に流出リスク。Reactの自動エスケープと依存管理で対策 |
| Files API | 未対応 | 上記サイズ制限の根本原因 |
| 音声編集 | 不可 | 録音した音声を一部だけ送信、等の機能はない |
| 履歴のエクスポート | 不可 | 端末変更時に履歴が失われる |
| iOS Safari 録音形式 | `audio/mp4` | Chromeの `audio/webm` と異なるため、フォールバック実装済み |

## デプロイ状況
- 環境: GitHub Pages (Deploy from branch / main / root)
- URL: https://ishizuka-svg.github.io/lecture-notes/
- 自動デプロイ: `.github/workflows/deploy.yml` 作成済み（手動アップロード方式から切替可能）
- 次回更新時は Actions 経由に切り替え予定
