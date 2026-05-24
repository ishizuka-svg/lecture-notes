import { useState } from "react";

export default function CopyButton({ text, label = "コピー" }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
      alert("クリップボードへのコピーに失敗しました");
    }
  };

  return (
    <button type="button" className="copy-btn" onClick={handleClick} disabled={!text}>
      {copied ? "✓ コピー済み" : label}
    </button>
  );
}
