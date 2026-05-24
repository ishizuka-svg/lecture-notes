import { useEffect, useState } from "react";
import ApiKeyGate from "./components/ApiKeyGate";
import ResultView from "./components/ResultView";
import Recorder from "./components/Recorder";
import HistoryList from "./components/HistoryList";
import HistoryDetail from "./components/HistoryDetail";
import { processAudio, detectMimeType, MAX_INLINE_BYTES } from "./lib/gemini";
import { listHistory, addHistory, updateHistory, removeHistory } from "./lib/history";
import "./App.css";

const KEY_STORAGE = "lecture-notes:gemini-api-key";

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? "");
  const [tab, setTab] = useState("new"); // "new" | "history"

  const [file, setFile] = useState(null);
  const [pendingBlob, setPendingBlob] = useState(null); // {blob, mimeType, fileName}
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const [history, setHistory] = useState(() => listHistory());
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (apiKey) localStorage.setItem(KEY_STORAGE, apiKey);
  }, [apiKey]);

  if (!apiKey) {
    return <ApiKeyGate onSave={setApiKey} />;
  }

  const refreshHistory = () => setHistory(listHistory());

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setPendingBlob(null);
    setResult(null);
    setError("");
  };

  const handleRecorderComplete = ({ blob, mimeType, fileName }) => {
    setPendingBlob({ blob, mimeType, fileName });
    setFile(null);
    setResult(null);
    setError("");
  };

  const handleProcess = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      let blob, mimeType, fileName;
      if (pendingBlob) {
        ({ blob, mimeType, fileName } = pendingBlob);
      } else if (file) {
        blob = file;
        mimeType = detectMimeType(file);
        fileName = file.name;
      } else {
        throw new Error("音声ファイルまたは録音がありません");
      }

      if (blob.size > MAX_INLINE_BYTES) {
        throw new Error(`ファイルサイズが20MBを超えています (${(blob.size / 1024 / 1024).toFixed(1)}MB)`);
      }

      const res = await processAudio({
        apiKey,
        blob,
        mimeType,
        fileName,
        onProgress: setStatus,
      });
      setResult(res);
      addHistory(res);
      refreshHistory();
      setStatus("完了 (履歴に保存しました)");
      setFile(null);
      setPendingBlob(null);
    } catch (err) {
      console.error(err);
      setError(err.message ?? String(err));
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  const handleResetKey = () => {
    if (!confirm("保存されたAPIキーを削除しますか？")) return;
    localStorage.removeItem(KEY_STORAGE);
    setApiKey("");
    setResult(null);
  };

  const handleSelectHistory = (item) => {
    setSelectedId(item.id);
  };

  const handleUpdateSubject = (id, subject) => {
    updateHistory(id, { subject });
    refreshHistory();
  };

  const handleDeleteHistory = (id) => {
    removeHistory(id);
    refreshHistory();
    setSelectedId(null);
  };

  const selectedItem = history.find((x) => x.id === selectedId) ?? null;
  const canProcess = !!(file || pendingBlob) && !busy;

  return (
    <div className="app">
      <header>
        <h1>講義ノート</h1>
        <button className="link" onClick={handleResetKey}>APIキーを変更</button>
      </header>

      <nav className="tabs">
        <button
          className={tab === "new" ? "tab active" : "tab"}
          onClick={() => { setTab("new"); setSelectedId(null); }}
        >
          新規
        </button>
        <button
          className={tab === "history" ? "tab active" : "tab"}
          onClick={() => setTab("history")}
        >
          履歴 <span className="badge">{history.length}</span>
        </button>
      </nav>

      {tab === "new" && (
        <>
          <section className="upload">
            <label className="file-drop">
              <input
                type="file"
                accept="audio/*,.m4a,.mp3,.wav,.aac,.ogg,.flac,.aiff,.webm"
                onChange={handleFileChange}
                disabled={busy}
              />
              <span>
                {file
                  ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`
                  : pendingBlob
                  ? `${pendingBlob.fileName} (${(pendingBlob.blob.size / 1024 / 1024).toFixed(1)} MB)`
                  : "音声ファイルを選択 (20MB以下)"}
              </span>
            </label>
          </section>

          <div className="divider"><span>または</span></div>

          <Recorder onComplete={handleRecorderComplete} disabled={busy} />

          <div className="actions">
            <button className="primary" onClick={handleProcess} disabled={!canProcess}>
              {busy ? "処理中..." : "文字起こし & 要約"}
            </button>
          </div>

          {status && <p className="status">{status}</p>}
          {error && <p className="error">エラー: {error}</p>}

          <ResultView result={result} />
        </>
      )}

      {tab === "history" && (
        selectedItem ? (
          <HistoryDetail
            item={selectedItem}
            onBack={() => setSelectedId(null)}
            onUpdateSubject={handleUpdateSubject}
            onDelete={handleDeleteHistory}
          />
        ) : (
          <HistoryList items={history} onSelect={handleSelectHistory} />
        )
      )}
    </div>
  );
}
