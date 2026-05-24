import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

const SUPPORTED_MIME = {
  mp3: "audio/mp3",
  wav: "audio/wav",
  aiff: "audio/aiff",
  aac: "audio/aac",
  ogg: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  webm: "audio/webm",
};

export const MAX_INLINE_BYTES = 20 * 1024 * 1024;

export function detectMimeType(file) {
  if (file.type && file.type.startsWith("audio/")) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return SUPPORTED_MIME[ext] ?? null;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const PROMPT = `あなたは大学講義の音声を処理するアシスタントです。次の音声に対して、必ず以下のJSON形式のみで日本語で返答してください。前置きやマークダウンは不要です。

{
  "subject": "<講義の科目を1〜8文字程度で。例: 経済学, 線形代数, 西洋史, 心理学。判別不能なら「その他」>",
  "transcript": "<逐語に近い文字起こし。話者交代があれば改行で区切る>",
  "summary": "<講義全体を3行程度で要約。1行ごとに改行>",
  "keyPoints": ["<要点1>", "<要点2>", "<要点3>"]
}

keyPointsは3〜5個。要点は短く具体的に。subjectは音声の内容から推測した学問分野・科目名。`;

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Geminiの応答からJSONを抽出できませんでした");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function processAudio({ apiKey, blob, mimeType, fileName, onProgress }) {
  if (!mimeType) {
    throw new Error("対応していない音声形式です (mp3/wav/m4a/aac/ogg/flac/aiff/webm)");
  }
  if (blob.size > MAX_INLINE_BYTES) {
    throw new Error(`ファイルサイズが20MBを超えています (現在 ${(blob.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  onProgress?.("音声をエンコード中...");
  const base64 = await blobToBase64(blob);

  onProgress?.("Geminiで解析中... (数分かかる場合があります)");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { inlineData: { mimeType, data: base64 } },
      { text: PROMPT },
    ],
  });

  const text = response.text ?? "";
  if (!text) throw new Error("Geminiから空の応答が返されました");

  const parsed = extractJson(text);
  return {
    fileName: fileName ?? "",
    sizeBytes: blob.size,
    subject: (parsed.subject ?? "その他").trim() || "その他",
    transcript: parsed.transcript ?? "",
    summary: parsed.summary ?? "",
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
  };
}
