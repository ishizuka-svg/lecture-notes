import { MAX_INLINE_BYTES } from "./gemini";

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return "audio/webm";
}

export function createRecorder({ onSizeUpdate, onAutoStop }) {
  let stream = null;
  let recorder = null;
  let chunks = [];
  let totalSize = 0;
  let mimeType = "audio/webm";
  let stopResolve = null;
  let autoStopped = false;

  async function start() {
    if (recorder) throw new Error("既に録音中です");
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mimeType = pickMimeType();
    recorder = new MediaRecorder(stream, { mimeType });
    chunks = [];
    totalSize = 0;
    autoStopped = false;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
        totalSize += e.data.size;
        onSizeUpdate?.(totalSize);
        if (totalSize >= MAX_INLINE_BYTES && !autoStopped) {
          autoStopped = true;
          onAutoStop?.();
          stop();
        }
      }
    };

    recorder.onstop = () => {
      stream?.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mimeType });
      stopResolve?.({ blob, mimeType, autoStopped });
    };

    recorder.start(1000);
  }

  function stop() {
    return new Promise((resolve) => {
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      stopResolve = resolve;
      recorder.stop();
      recorder = null;
    });
  }

  function cancel() {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      recorder = null;
    }
    stream?.getTracks().forEach((t) => t.stop());
    chunks = [];
    totalSize = 0;
  }

  return { start, stop, cancel };
}
