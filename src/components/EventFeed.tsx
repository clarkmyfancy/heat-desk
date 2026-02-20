import { RoundOutcome } from "../engine/types";

interface EventFeedProps {
  latestOutcome: RoundOutcome | null;
}

export const EventFeed = ({ latestOutcome }: EventFeedProps) => {
  return (
    <section className="panel">
      <div className="panel-heading-row">
        <h3>Event Feed</h3>
        {latestOutcome ? <span className="chip">Round {latestOutcome.round}</span> : null}
      </div>
      {!latestOutcome ? (
        <p className="muted">Simulate a week to populate the market feed.</p>
      ) : (
        <div className="log-feed">
          {latestOutcome.recapLines.map((line, index) => (
            <p key={`${line}-${index}`} className="log-line">
              {line}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};
