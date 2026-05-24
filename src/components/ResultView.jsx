import CopyButton from "./CopyButton";

export default function ResultView({ result }) {
  if (!result) return null;
  const { subject, summary, keyPoints, transcript } = result;
  const keyPointsText = (keyPoints ?? []).map((p) => `・${p}`).join("\n");

  return (
    <div className="results">
      {subject && (
        <div className="subject-chip">
          <span className="label">推測科目</span>
          <span className="value">{subject}</span>
        </div>
      )}

      <section>
        <div className="section-head">
          <h2>要約</h2>
          <CopyButton text={summary} />
        </div>
        <pre className="summary">{summary}</pre>
      </section>

      <section>
        <div className="section-head">
          <h2>要点</h2>
          <CopyButton text={keyPointsText} />
        </div>
        <ul>
          {(keyPoints ?? []).map((p, i) => (
            <li key={i}><span className="marker">{p}</span></li>
          ))}
        </ul>
      </section>

      <section>
        <div className="section-head">
          <h2>文字起こし</h2>
          <CopyButton text={transcript} />
        </div>
        <pre className="transcript">{transcript}</pre>
      </section>
    </div>
  );
}
