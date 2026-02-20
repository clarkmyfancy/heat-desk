import { LastRunSummary, RunState } from "../engine/types";
import { formatCurrency, formatPercent, titleCase } from "../utils/format";

interface RunSummaryModalProps {
  run: RunState;
  summary: LastRunSummary | null;
  onClose: () => void;
}

export const RunSummaryModal = ({ run, summary, onClose }: RunSummaryModalProps) => {
  if (!run.isGameOver) return null;

  const fallbackFinalNav = run.meters.nav;

  return (
    <div className="modal-backdrop">
      <div className="modal panel summary-modal">
        <h3>Run Summary</h3>
        <p className="muted">Outcome: {titleCase(run.endReason ?? "bankruptcy")}</p>

        <div className="summary-grid">
          <div>
            <p>Final NAV</p>
            <strong>{formatCurrency(summary?.finalNav ?? fallbackFinalNav)}</strong>
          </div>
          <div>
            <p>Total Return</p>
            <strong>{formatPercent(summary?.totalReturnPct ?? 0)}</strong>
          </div>
          <div>
            <p>Highest Heat</p>
            <strong>{summary?.highestHeat ?? run.meters.heat}</strong>
          </div>
          <div>
            <p>RP Earned</p>
            <strong>{summary?.reputationEarned ?? 0}</strong>
          </div>
        </div>

        <div className="timeline">
          <h4>Timeline Recap</h4>
          <ul>
            {(summary?.timeline ?? []).slice(0, 12).map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </div>

        <button className="primary" onClick={onClose}>
          Return to Main Menu
        </button>
      </div>
    </div>
  );
};
