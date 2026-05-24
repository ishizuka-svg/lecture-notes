import { useMemo } from "react";
import { groupBySubject } from "../lib/history";

function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HistoryList({ items, onSelect }) {
  const groups = useMemo(() => groupBySubject(items), [items]);

  if (items.length === 0) {
    return <p className="muted">まだ履歴はありません。新規タブから処理してください。</p>;
  }

  return (
    <div className="history">
      {groups.map(([subject, list]) => (
        <details key={subject} open className="history-group">
          <summary>
            <span className="folder-icon">📁</span>
            <span className="subject-name">{subject}</span>
            <span className="count">{list.length}</span>
          </summary>
          <ul>
            {list.map((item) => (
              <li key={item.id}>
                <button className="history-item" onClick={() => onSelect(item)}>
                  <div className="hi-title">{item.fileName || "(無題)"}</div>
                  <div className="hi-meta">
                    <span>{formatDate(item.createdAt)}</span>
                    <span>{(item.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="hi-summary">{item.summary?.split("\n")[0] || ""}</div>
                </button>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
