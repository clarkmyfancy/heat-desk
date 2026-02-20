import { AssetState, RoundOutcome } from "../engine/types";
import { formatCurrency } from "../utils/format";

interface TradeRecapPanelProps {
  latestOutcome: RoundOutcome | null;
  assets: AssetState[];
}

const assetLabel = (assetId: string, assets: AssetState[]) =>
  assets.find((asset) => asset.id === assetId)?.name ?? assetId;

export const TradeRecapPanel = ({ latestOutcome, assets }: TradeRecapPanelProps) => {
  if (!latestOutcome) {
    return (
      <section className="panel">
        <h3>Trade Recap</h3>
        <p className="muted">No executed rounds yet.</p>
      </section>
    );
  }

  const topDecision = [...latestOutcome.decisions].sort((a, b) => b.targetWeight - a.targetWeight)[0];

  return (
    <section className="panel">
      <h3>Trade Recap</h3>
      <p className="muted">Why AI chose this</p>
      {topDecision ? (
        <p>
          {assetLabel(topDecision.assetId, assets)} at {(topDecision.targetWeight * 100).toFixed(1)}% because{" "}
          {topDecision.rationale.slice(0, 2).join("; ")}.
        </p>
      ) : null}

      <div className="recap-grid">
        <div>
          <h4>Top Contributors</h4>
          <ul>
            {latestOutcome.topContributors.map((item) => (
              <li key={item.assetId}>
                {assetLabel(item.assetId, assets)} {formatCurrency(item.pnl)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Top Detractors</h4>
          <ul>
            {latestOutcome.topDetractors.map((item) => (
              <li key={item.assetId}>
                {assetLabel(item.assetId, assets)} {formatCurrency(item.pnl)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="recap-grid">
        <div>
          <h4>Heat Change Reasons</h4>
          <ul>
            {latestOutcome.heatChangeReasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Confidence Change Reasons</h4>
          <ul>
            {latestOutcome.confidenceChangeReasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
