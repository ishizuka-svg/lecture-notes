# PROMPTS.md — AIに投げた重要指示と根拠

## A. アプリ内でGeminiに送信しているプロンプト

### A-1. 音声処理プロンプト

**場所**: `src/lib/gemini.js`

**プロンプト本文**:
```
あなたは大学講義の音声を処理するアシスタントです。次の音声に対して、必ず以下のJSON形式のみで日本語で返答してください。前置きやマークダウンは不要です。

{
  "subject": "<講義の科目を1〜8文字程度で。例: 経済学, 線形代数, 西洋史, 心理学。判別不能なら「その他」>",
  "transcript": "<逐語に近い文字起こし。話者交代があれば改行で区切る>",
  "summary": "<講義全体を3行程度で要約。1行ごとに改行>",
  "keyPoints": ["<要点1>", "<要点2>", "<要点3>"]
}

keyPointsは3〜5個。要点は短く具体的に。subjectは音声の内容から推測した学問分野・科目名。
```

**設計意図**:
| 工夫 | 理由 |
|---|---|
| JSON固定で返答指示 | クライアント側パースが安定する。テキスト解釈のブレを排除 |
| 「前置きやマークダウンは不要」と明記 | ` ```json ... ``` ` で囲ったりされにくくなる |
| keyPoints の個数指定（3〜5） | 提出要件 |
| subject の文字数指定 | UI上の付箋表示が崩れない長さ |
| 「判別不能なら『その他』」 | フォールバック挙動を明文化 |
| 全文日本語指示 | 学習言語（日本語）と回答言語を一致 |

**フォールバック処理**: モデルが指示を無視してマークダウンで囲んできた場合に備え、`extractJson()` で ```` ```json ... ``` ```` を除去してから `JSON.parse()` する実装を追加。

**参考**:
- Gemini プロンプト設計ガイド: https://ai.google.dev/gemini-api/docs/prompting-intro?hl=ja
- 音声入力: https://ai.google.dev/gemini-api/docs/audio?hl=ja

---

## B. 開発時にClaude (Claude Code) に投げた重要指示

### B-1. 最小構成での着手指示
**指示の要点**:
> 大学講義の録音から、文字起こし / 3行要約 / 3〜5要点を自動生成するWebアプリを作りたい。
> - API は無料枠で使える Gemini を利用
> - APIキーは初回入力 → 端末内保存（公開物に残さない）
> - Gemini API 連携は https://ai.google.dev/gemini-api/docs/models?hl=ja を参照
> - まずは最小構成で動くものを実現
> - 不確定要素は都度聞くこと

**根拠**: 講義要件。「最小構成」と「不確定要素は都度確認」が方針として明文化された。

**結果**: フレームワーク選定（React + Vite）、構成（バックエンドなし）、サイズ上限（20MB / inline）、モデル（`gemini-2.5-flash`）を対話で決定。

---

### B-2. デザイン方向性の選定
**指示の要点**:
> 今のデザインは無骨でいいけどもう少しおしゃれにしたい。デザイン案を教えて。

**根拠**: 第一版のシンプルな青基調UIから、提出物としても見栄えのするデザインに格上げするため。

**提示された選択肢**: A) ノート風 / 紙質感 / B) Notion風 ミニマル / C) グラスモーフィズム / D) ダークモダン

**採用**: A（ノート風 / 紙質感）。**アプリ名「講義ノート」とビジュアルが一致する**ことが決め手。

---

### B-3. 拡張機能の一括指示
**指示の要点**:
> - 要約・要点・文字起こしのそれぞれをコピーできるボタン
> - 過去に実行したものを履歴として保存し閲覧
> - 文字起こしの内容から科目を推測しタグ付け、タグごとにフォルダ分け
> - スマホでも利用できるレスポンシブデザイン
> - 音声入力（録音）にも対応

**事前確認**:
- 履歴 → メタデータのみ保存（音声本体は除外）
- タグ → Gemini自動推測 + 手動編集可
- 録音 → 手動開始/停止、20MB自動停止

**根拠**: 講義アプリとして実用性を上げるため。録音は端末で完結することで「録音→処理」のワンストップ化。

---

### B-4. セキュリティ要件の確認
**指示の要点**:
> セキュリティの面でAPIキーの流出しないようにとか気をつけるべき点をできるだけ具体的に教えて

**根拠**: 公開リポジトリにAPIキーが含まれていないことが課題の合格条件であるため、形式的な対策に留まらず、運用面の防御策まで明文化する必要があった。

**結論として採用した対策**:
1. ソース・成果物にハードコード禁止（`.gitignore` で `.env*` 除外）
2. localStorage 経由のキー管理（クライアント自己責任モデル）
3. Google Cloud側で HTTPリファラ制限・APIクォータ上限を設定（推奨）
4. GitHub Secret Scanning 有効化（推奨）
5. 漏洩時の即時ローテーション手順をドキュメント化

---

## C. 参照した一次情報URL

| 用途 | URL |
|---|---|
| Geminiモデル一覧 | https://ai.google.dev/gemini-api/docs/models?hl=ja |
| Gemini音声入力ガイド | https://ai.google.dev/gemini-api/docs/audio?hl=ja |
| Gemini料金 | https://ai.google.dev/gemini-api/docs/pricing |
| APIキー取得 | https://aistudio.google.com/apikey |
| @google/genai SDK | https://github.com/googleapis/js-genai |
| Vite | https://vite.dev/ |
| React 19 | https://react.dev/ |
| MediaRecorder API | https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder |
| GitHub Pages | https://docs.github.com/ja/pages |
| Google Cloud APIキー制限 | https://cloud.google.com/docs/authentication/api-keys |
