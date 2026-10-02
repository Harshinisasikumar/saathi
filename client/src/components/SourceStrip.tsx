import type { SourceCitation } from '../types';

export function SourceStrip({ sources, demoNotice }: { sources?: SourceCitation[]; demoNotice?: string }) {
  if (!sources || sources.length === 0) {
    if (!demoNotice) return null;
    return <div className="source-strip text-muted small mt-1">{demoNotice}</div>;
  }
  return (
    <div className="mt-2">
      {demoNotice && <div className="demo-inline small mb-1">{demoNotice}</div>}
      {sources.map((s, i) => (
        <div key={i} className="source-strip small">
          <i className="bi bi-patch-check me-1" />
          <strong>Source:</strong> {s.name}
          {s.url && <> · <a href={s.url} target="_blank" rel="noreferrer">link</a></>}
          {" · "}
          <strong>Data period:</strong> {s.dataPeriod}
          {" · "}
          <strong>Verification:</strong> {s.verificationStatus}
        </div>
      ))}
    </div>
  );
}