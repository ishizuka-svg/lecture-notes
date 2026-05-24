# 講義ノート (lecture-notes)

大学の講義録音をインポート、またはブラウザで直接録音すると、Gemini API を使って自動で

- 文字起こし
- 3行程度の要約
- 3〜5個の要点（箇条書き）
- 科目タグの推測（後から手動編集可）

を生成するブラウザ完結の Web アプリです。React + Vite で構築。スマホ対応・ダークモード対応・ノート風デザイン。

🔗 公開URL: https://ishizuka-svg.github.io/lecture-notes/

## 機能一覧

- 音声ファイルのインポート（mp3 / m4a / wav / aac / ogg / flac / aiff / webm）
- ブラウザ内録音（MediaRecorder API、20MB で自動停止）
- 各セクション（要約 / 要点 / 文字起こし）のワンクリックコピー
- 履歴の自動保存（メタデータのみ、localStorage）
- 履歴は推測科目でフォルダ分け、タグは後から編集可能
- レスポンシブデザイン（スマホ縦持ちでも操作可）
- OS連動のダークモード

## クイックスタート

### 1. Gemini APIキーを取得
[Google AI Studio](https://aistudio.google.com/apikey) でAPIキーを取得します（無料枠あり）。

### 2. アプリにアクセス
公開URL https://ishizuka-svg.github.io/lecture-notes/ にアクセスし、初回画面で取得したAPIキーを貼り付けます。

> キーはブラウザの localStorage にのみ保存されます。サーバーやGitHubには送信・保存されません。

### 3. 使う
1. 「新規」タブで音声ファイルを選択、または「🎙 録音を開始」
2. 「文字起こし & 要約」をクリック
3. 結果が表示され、自動で履歴に保存されます
4. 「履歴」タブで過去の処理結果を科目別に閲覧できます

APIキーを変更したい場合は、画面右上の「APIキーを変更」から削除できます。

## ローカル開発

```bash
git clone https://github.com/ishizuka-svg/lecture-notes.git
cd lecture-notes
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

スマホで確認する場合:
```bash
npm run dev -- --host
```
表示されるネットワークURLを同じWi-Fi下のスマホで開きます。

## ビルドとデプロイ

### ローカルビルド
```bash
GITHUB_PAGES=true npm run build
```
`dist/` に成果物が出力されます。

### GitHub Pages デプロイ
本リポジトリは `.github/workflows/deploy.yml` で GitHub Actions による自動デプロイに対応しています。`main` ブランチへの push で自動的にビルド・公開されます。

Settings → Pages → Source を **GitHub Actions** に設定してください。

## 制約 (MVP)

- ファイルサイズは **20MB以下**（Geminiのinline入力上限）
- 128 kbps の MP3 なら約 20 分が目安
- 長時間講義に対応するには Files API への切替が必要（未実装）

## 使用技術

| 区分 | 技術 |
|---|---|
| UI | React 19 |
| ビルド | Vite 8 |
| AI | Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK |
| デプロイ | GitHub Pages |
| 録音 | MediaRecorder API (Web Standard) |

## セキュリティ

- API キーは**コード／リポジトリに一切含まれません**
- 各ユーザーが自分のキーをブラウザに保存して使う仕組み
- `.env`、音声ファイルは `.gitignore` で除外
- HTTPS強制（GitHub Pagesデフォルト）
- 推奨運用: Google Cloud で **HTTPリファラ制限** と **APIクォータ上限** を設定

詳細は [docs/API_NOTES.md](docs/API_NOTES.md) と [docs/SPEC.md](docs/SPEC.md) を参照。

## ドキュメント
- [docs/SPEC.md](docs/SPEC.md) — 仕様
- [docs/API_NOTES.md](docs/API_NOTES.md) — Gemini API メモ（公式URL・制限・モデル）
- [docs/TESTCASES.md](docs/TESTCASES.md) — テストケース・期待結果・証跡
- [docs/STATUS.md](docs/STATUS.md) — 現在地・詰まりの記録
- [docs/PROMPTS.md](docs/PROMPTS.md) — 開発で使った重要プロンプトと根拠URL
- [screenshots/](screenshots/) — 動作証跡スクリーンショット

## ライセンス
個人利用 / 学習用途。
