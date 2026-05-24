# SPEC.md — 仕様書

## プロジェクト名
講義ノート (lecture-notes)

## 目的
大学の講義を録音した音声ファイルから、文字起こし・要約・要点を**ワンクリックで自動生成**するWebアプリ。授業後の復習や友人への共有を素早く行うことを目的とする。

## 機能要件

### 必須機能
| # | 機能 | 説明 |
|---|---|---|
| F-1 | 音声ファイルインポート | mp3 / m4a / wav / aac / ogg / flac / aiff / webm を受け付ける |
| F-2 | ブラウザ録音 | MediaRecorder APIで端末マイクから直接録音 |
| F-3 | 文字起こし | Geminiが音声内容を逐語に近い形でテキスト化 |
| F-4 | 3行要約 | 講義全体を3行程度にまとめる |
| F-5 | 要点抽出 | 3〜5個の要点を箇条書きで抽出 |
| F-6 | APIキー管理 | 初回入力 → localStorageに保存。アプリ内で変更・削除可 |

### 拡張機能
| # | 機能 | 説明 |
|---|---|---|
| F-7 | 科目タグ自動推測 | Geminiが文字起こしから科目を推測（例: 経済学、線形代数） |
| F-8 | タグ手動編集 | 履歴詳細から科目タグを修正可能 |
| F-9 | 履歴保存 | 処理結果（メタデータのみ）をlocalStorageに自動保存 |
| F-10 | 履歴の科目フォルダ分け | タグごとに `<details>` で開閉できるフォルダ表示 |
| F-11 | コピーボタン | 要約・要点・文字起こし、各セクション独立にクリップボードへコピー |
| F-12 | レスポンシブUI | スマートフォン縦持ち（〜600px）で操作可能 |
| F-13 | ダークモード | OSの設定 (`prefers-color-scheme`) に追従 |

## 非機能要件
- **完全クライアントサイド**: バックエンドサーバーを持たない
- **ホスティング**: GitHub Pagesで配信
- **依存サービス**: Google Gemini API (`gemini-2.5-flash`) のみ
- **データ永続化**: ブラウザの localStorage のみ（外部送信なし）
- **APIキーの扱い**: コードに含めない。各ユーザーが自分のキーをブラウザに保存

## 非機能要件: セキュリティ
- APIキーをソースコード／リポジトリに含めない
- `.env`、音声ファイルは `.gitignore` で除外
- GitHub Pages は HTTPS 強制
- Reactのデフォルトエスケープを利用しXSS耐性を確保
- 推奨運用: Google Cloud で HTTPリファラ制限とクォータ上限を設定

## 制約
- インライン入力で送信するため**音声ファイルは20MB以下**（Files API 非対応）
- 録音時も累積20MBで自動停止
- Gemini APIの無料枠のレート制限内で動作

## アーキテクチャ

```
┌──────────────────────────────────────────────┐
│  ブラウザ (Client) — GitHub Pages から配信       │
│                                              │
│  React UI                                    │
│   ├─ ApiKeyGate (初回設定)                    │
│   ├─ Recorder    (MediaRecorder)             │
│   ├─ ResultView  (結果表示 + Copy)            │
│   ├─ HistoryList / HistoryDetail             │
│   └─ lib/                                    │
│       ├─ gemini.js   (@google/genai SDK)     │
│       ├─ recorder.js (MediaRecorder ラッパー)  │
│       └─ history.js  (localStorage CRUD)     │
│                                              │
│  localStorage                                │
│   ├─ lecture-notes:gemini-api-key            │
│   └─ lecture-notes:history (JSON配列)        │
└──────────────────────┬───────────────────────┘
                       │ HTTPS
                       ▼
              Google Gemini API
              (gemini-2.5-flash)
```

## データフロー

```
[音声ファイル / 録音Blob]
    │
    ├─ サイズチェック (≤ 20MB)
    │
    ▼
[base64 エンコード]
    │
    ▼
[Gemini API へ inline_data で送信]
    │
    │ プロンプト: 「JSON形式で subject / transcript / summary / keyPoints を返せ」
    ▼
[JSON応答を抽出 → パース]
    │
    ▼
[画面表示 + 履歴に保存 (localStorage)]
```

## 画面構成
1. **APIキー入力画面** (初回のみ): キー入力 → localStorage保存
2. **新規タブ**: ファイル選択 or 録音 → 「文字起こし & 要約」ボタン → 結果表示
3. **履歴タブ**: 科目別フォルダ表示 → 項目クリックで詳細 → タグ編集 / 削除

## ファイル構成

```
lecture-notes/
├── docs/                         # 提出ドキュメント
│   ├── SPEC.md
│   ├── API_NOTES.md
│   ├── TESTCASES.md
│   ├── STATUS.md
│   └── PROMPTS.md
├── screenshots/                  # 動作証跡スクリーンショット
├── src/
│   ├── App.jsx                   # メイン画面 / タブ制御
│   ├── App.css                   # ノート風スタイル
│   ├── index.css                 # 配色変数 (CSS Custom Properties)
│   ├── main.jsx
│   ├── components/
│   │   ├── ApiKeyGate.jsx
│   │   ├── Recorder.jsx
│   │   ├── ResultView.jsx
│   │   ├── CopyButton.jsx
│   │   ├── HistoryList.jsx
│   │   └── HistoryDetail.jsx
│   └── lib/
│       ├── gemini.js
│       ├── recorder.js
│       └── history.js
├── .github/workflows/deploy.yml  # GitHub Pages 自動デプロイ
├── vite.config.js
├── index.html
├── package.json
└── README.md
```

## 使用技術
| 区分 | 技術 | バージョン |
|---|---|---|
| UI フレームワーク | React | ^19.2 |
| ビルドツール | Vite | ^8.0 |
| AI SDK | @google/genai | ^2.6 |
| 言語 | JavaScript (ESM) | — |
| デプロイ先 | GitHub Pages | — |

## デザイン
- コンセプト: **大学ノート風 / 紙質感**
- 配色: 紙色 `#faf7f0` / 墨色 `#2c2a26` / 朱赤アクセント `#b34a2b`
- フォント: Noto Serif JP (見出し) / Noto Sans JP (本文)
- 要素: 罫線、付箋、マスキングテープ、蛍光マーカーをモチーフ化
