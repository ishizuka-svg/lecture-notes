# API_NOTES.md — Gemini API 仕様メモ

## 公式ドキュメント
- モデル一覧: https://ai.google.dev/gemini-api/docs/models?hl=ja
- 音声入力ガイド: https://ai.google.dev/gemini-api/docs/audio?hl=ja
- 料金 / 無料枠: https://ai.google.dev/gemini-api/docs/pricing
- APIキー取得: https://aistudio.google.com/apikey
- JavaScript SDK: https://github.com/googleapis/js-genai (`@google/genai`)

## 使用モデル
| 項目 | 値 |
|---|---|
| モデルID | `gemini-2.5-flash` |
| 種別 | 安定版 (GA) |
| 料金 | **無料枠で利用可** |
| 対応モダリティ | テキスト / 画像 / 音声 / 動画 (入力)、テキスト (出力) |

## 採用理由
- 安定版で実績があり、ドキュメント・サンプルが豊富
- 音声入力をネイティブ対応
- 無料枠で利用可（Google AI Studio から取得したAPIキーをそのまま使える）
- 出力のJSON構造化指示（プロンプトでの誘導）が安定

## 利用エンドポイント
SDKを使うため直接URLは叩かない。内部的には以下にPOST:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
?key=<APIキー>
```

## SDK呼び出し
`src/lib/gemini.js`:
```javascript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    { inlineData: { mimeType, data: base64 } },
    { text: PROMPT },
  ],
});
```

## 音声入力の制約
| 項目 | 値 | 出典 |
|---|---|---|
| 対応形式 | WAV / MP3 / AIFF / AAC / OGG / FLAC | https://ai.google.dev/gemini-api/docs/audio?hl=ja |
| 拡張 (本アプリ追加) | m4a (`audio/mp4`), webm | MediaRecorder出力に合わせて対応 |
| **インライン送信の上限** | **20 MB**（テキスト+音声合計のリクエストサイズ） | 同上 |
| 1リクエスト最大長 | 9.5時間 | 同上 |
| トークン換算 | 音声1秒 = 32トークン | 同上 |
| 音声処理 | 16 Kbps にダウンサンプリング、1チャンネルに統合 | 同上 |

## 本アプリで使う設定
- **送信方式**: `inlineData` (base64エンコードしてリクエストに含める)
- **理由**: 20MB以下の最小構成 (MVP) であり、Files APIを使わない方が実装がシンプル
- **将来拡張**: 20MB超や長時間講義に対応する場合は Files API へ移行を想定

## レート制限 (Free tier, gemini-2.5-flash, 2026年時点)
公式ページに記載のある範囲では、無料枠での具体的なRPM/RPD制限は流動的なため、運用時は Google Cloud Console で確認を推奨。本アプリは「ユーザーが個人で1日数件処理する」用途を想定しているため通常は無料枠内で十分。

## プロンプト設計
出力をクライアントでパースしやすくするため、**JSON形式での返答を強制**:
```
{
  "subject": "<科目名>",
  "transcript": "<文字起こし>",
  "summary": "<3行要約>",
  "keyPoints": ["要点1", "要点2", "要点3"]
}
```
- マークダウン記法のフェンス除去ロジックを `extractJson()` に実装し、Geminiが ```json ... ``` で囲んだ場合も対応
- 文字数指定や個数指定はプロンプト内で明示（3行 / 3〜5個）

## エラー処理
| 想定エラー | 対応 |
|---|---|
| APIキー未入力 | 初回ゲートで入力させる。空文字保存禁止 |
| APIキー誤り | Gemini SDK が例外を投げる → `error` ステートで赤帯表示 |
| 20MB超過 | クライアント側で事前チェック → 「ファイルサイズが20MBを超えています」表示 |
| 非対応形式 | `detectMimeType()` で null → 「対応していない音声形式です」表示 |
| JSON抽出失敗 | `extractJson()` が例外 → エラーメッセージ表示 |
| ネットワークエラー | Promise reject → エラー表示 |

## セキュリティ運用 (推奨)
1. [Google Cloud Console](https://console.cloud.google.com/) で **APIキーに HTTP リファラ制限** を設定
   - 許可: `https://<user>.github.io/lecture-notes/*`, `http://localhost:5173/*`
2. **APIクォータ上限** を低めに設定（例: 100リクエスト/日）
3. キー漏洩時は AI Studio で即座にRevoke → 新規発行
