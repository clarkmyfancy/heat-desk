import { RoundOutcome } from "../engine/types";
import { formatCurrency } from "../utils/format";

interface EquityCurveChartProps {
  history: RoundOutcome[];
}

const buildPoints = (values: number[], width: number, height: number): string => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y =
        max === min
          ? height / 2
          : height - ((value - min) / Math.max(max - min, 1e-6)) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

const navSeriesFromHistory = (history: RoundOutcome[]): number[] => {
  if (!history.length) return [];
  return [history[0].navBefore, ...history.map((entry) => entry.navAfter)];
};

const drawdownSeries = (values: number[]): number[] => {
  let peak = values[0] ?? 0;
  return values.map((value) => {
    peak = Math.max(peak, value);
    if (peak === 0) return 0;
    return ((value - peak) / peak) * 100;
  });
};

export const EquityCurveChart = ({ history }: EquityCurveChartProps) => {
  if (!history.length) {
    return (
      <section className="panel">
        <h3>Equity Curve</h3>
        <p className="muted">No rounds simulated yet.</p>
      </section>
    );
  }

  const navValues = navSeriesFromHistory(history);
  const ddValues = drawdownSeries(navValues);

  const width = 560;
  const height = 170;
  const ddHeight = 70;

  const equityPoints = buildPoints(navValues, width, height);
  const ddPoints = buildPoints(ddValues, width, ddHeight);

  return (
    <section className="panel">
      <h3>Equity Curve</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Equity curve">
        <polyline points={equityPoints} fill="none" stroke="var(--accent)" strokeWidth="3" />
      </svg>
      <div className="chart-foot">
        <span>Start {formatCurrency(navValues[0])}</span>
        <span>End {formatCurrency(navValues[navValues.length - 1])}</span>
      </div>

      <h4>Drawdown</h4>
      <svg viewBox={`0 0 ${width} ${ddHeight}`} className="chart-svg" role="img" aria-label="Drawdown curve">
        <polyline points={ddPoints} fill="none" stroke="var(--danger)" strokeWidth="2.5" />
      </svg>
    </section>
  );
};
