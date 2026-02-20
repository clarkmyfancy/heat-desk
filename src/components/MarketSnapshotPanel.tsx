import { RunState } from "../engine/types";
import { AssetCard } from "./AssetCard";

interface MarketSnapshotPanelProps {
  run: RunState;
}

export const MarketSnapshotPanel = ({ run }: MarketSnapshotPanelProps) => {
  const latest = run.history[run.history.length - 1];

  return (
    <section className="panel market-panel">
      <div className="panel-heading-row">
        <h3>Market Snapshot</h3>
        {latest ? <span className="chip">Last macro: {latest.macroRegime}</span> : null}
      </div>
      <div className="assets-grid">
        {run.assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
};
