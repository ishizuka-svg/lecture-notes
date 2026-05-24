import { useState } from "react";

export default function ApiKeyGate({ onSave }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div className="gate">
      <div className="card">
        <h1>初回設定</h1>
        <p className="muted">
          Gemini APIキーを入力してください。<br />
          キーはこのブラウザの localStorage にのみ保存され、外部には送信されません。
        </p>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              type={show ? "text" : "password"}
              placeholder="AIza..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={() => setShow((s) => !s)}>
              {show ? "隠す" : "表示"}
            </button>
          </div>
          <button type="submit" className="primary" disabled={!value.trim()}>
            保存して始める
          </button>
        </form>
        <p className="muted small">
          APIキーは <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio</a> で取得できます (無料枠あり)。
        </p>
      </div>
    </div>
  );
}
