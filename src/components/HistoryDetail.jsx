import { useState } from "react";
import ResultView from "./ResultView";

export default function HistoryDetail({ item, onBack, onUpdateSubject, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.subject || "");

  const save = () => {
    const trimmed = draft.trim() || "その他";
    onUpdateSubject(item.id, trimmed);
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm("この履歴を削除しますか？")) return;
    onDelete(item.id);
  };

  return (
    <div>
      <div className="detail-bar">
        <button className="link" onClick={onBack}>← 履歴一覧</button>
        <div className="detail-actions">
          {editing ? (
            <span className="tag-edit">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="科目タグ"
                autoFocus
              />
              <button className="primary small" onClick={save}>保存</button>
              <button className="small" onClick={() => { setEditing(false); setDraft(item.subject); }}>取消</button>
            </span>
          ) : (
            <button className="small" onClick={() => setEditing(true)}>タグ編集</button>
          )}
          <button className="danger small" onClick={handleDelete}>削除</button>
        </div>
      </div>
      <h2 className="detail-title">{item.fileName || "(無題)"}</h2>
      <ResultView result={item} />
    </div>
  );
}
