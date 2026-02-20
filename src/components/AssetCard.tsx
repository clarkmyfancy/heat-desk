import { AssetState } from "../engine/types";
import { formatPercent } from "../utils/format";

interface AssetCardProps {
  asset: AssetState;
}

const Sparkline = ({ values }: { values: number[] }) => {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 120;
  const height = 36;

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const normalized = (value - min) / Math.max(max - min, 1);
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export const AssetCard = ({ asset }: AssetCardProps) => {
  const moveClass = asset.lastRoundReturnPct >= 0 ? "positive" : "negative";

  return (
    <article className="asset-card panel">
      <div className="asset-card-header">
        <div>
          <h4>{asset.name}</h4>
          <p className="muted">{asset.sector}</p>
        </div>
        <div className="asset-price">${asset.price.toFixed(2)}</div>
      </div>
      <div className="asset-card-foot">
        <span className={moveClass}>{formatPercent(asset.lastRoundReturnPct)}</span>
        <Sparkline values={asset.priceHistory.slice(-10)} />
      </div>
    </article>
  );
};
