import { useEffect, useRef, useState } from "react";
import { createRecorder } from "../lib/recorder";
import { MAX_INLINE_BYTES } from "../lib/gemini";

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Recorder({ onComplete, disabled }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [size, setSize] = useState(0);
  const [error, setError] = useState("");
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => () => {
    recorderRef.current?.cancel();
    clearInterval(timerRef.current);
  }, []);

  const start = async () => {
    setError("");
    try {
      const rec = createRecorder({
        onSizeUpdate: setSize,
        onAutoStop: () => {
          setError("20MBに達したため自動停止しました");
        },
      });
      await rec.start();
      recorderRef.current = rec;
      startRef.current = Date.now();
      setElapsed(0);
      setSize(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startRef.current) / 1000);
      }, 250);
    } catch (err) {
      console.error(err);
      setError(err.message || "マイクへのアクセスが拒否されました");
    }
  };

  const stop = async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    clearInterval(timerRef.current);
    const result = await rec.stop();
    setRecording(false);
    recorderRef.current = null;
    if (result?.blob && result.blob.size > 0) {
      const ext = result.mimeType.includes("mp4") ? "m4a" : "webm";
      const fileName = `録音_${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
      onComplete?.({ blob: result.blob, mimeType: result.mimeType, fileName });
    }
  };

  const percent = Math.min(100, (size / MAX_INLINE_BYTES) * 100);

  return (
    <div className="recorder">
      {!recording ? (
        <button className="primary" onClick={start} disabled={disabled}>
          🎙 録音を開始
        </button>
      ) : (
        <button className="danger" onClick={stop}>
          ■ 停止して処理
        </button>
      )}
      {(recording || size > 0) && (
        <div className="rec-meta">
          <span>{formatTime(elapsed)}</span>
          <span className="muted small">/ {(size / 1024 / 1024).toFixed(1)} MB</span>
          <div className="bar">
            <div className="fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
