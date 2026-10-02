import type { StructuredReply } from '../types';
import { SourceStrip } from './SourceStrip';

export function RichReply({ structured }: { structured?: StructuredReply }) {
  if (!structured) return null;

  return (
    <div className="saathi-reply">
      <div className="mb-2">
        <div className="fw-semibold saathi-accent small text-uppercase">Answer</div>
        <div className="saathi-copy">{structured.answer}</div>
      </div>
      {structured.evidence && structured.evidence.length > 0 && (
        <div className="mb-2">
          <div className="fw-semibold saathi-accent small text-uppercase">Evidence</div>
          <ul className="mb-1">
            {structured.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {structured.forFamily && (
        <div className="mb-2">
          <div className="fw-semibold saathi-accent small text-uppercase">What this means for your family</div>
          <div className="saathi-copy">{structured.forFamily}</div>
        </div>
      )}
      {structured.notKnown && structured.notKnown.length > 0 && (
        <div className="mb-2">
          <div className="fw-semibold saathi-muted small text-uppercase">What is not known</div>
          <ul className="mb-1">
            {structured.notKnown.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      <SourceStrip sources={structured.sources} demoNotice={structured.demoNotice} />
    </div>
  );
}