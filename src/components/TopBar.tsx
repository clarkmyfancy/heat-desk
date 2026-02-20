import { TOTAL_ROUNDS } from "../engine/constants";
import { RunState } from "../engine/types";
import { formatCurrency } from "../utils/format";
import { MeterBar } from "./MeterBar";

interface TopBarProps {
  run: RunState;
}

export const TopBar = ({ run }: TopBarProps) => {
  return (
    <header className="top-bar panel">
      <div className="top-bar-main">
        <div>
          <p className="eyebrow">Round</p>
          <h2>
            {Math.min(run.round, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
          </h2>
        </div>
        <div>
          <p className="eyebrow">NAV</p>
          <h2>{formatCurrency(run.meters.nav)}</h2>
        </div>
        <div>
          <p className="eyebrow">Active Upgrades</p>
          <h2>{run.activeUpgrades.length}</h2>
        </div>
        {run.upcomingMacroHint ? (
          <div>
            <p className="eyebrow">Macro Hint</p>
            <h2>{run.upcomingMacroHint}</h2>
          </div>
        ) : null}
      </div>
      <div className="meter-grid">
        <MeterBar label="Heat" value={run.meters.heat} colorClass="heat" />
        <MeterBar label="Investor Confidence" value={run.meters.investorConfidence} colorClass="confidence" />
        <MeterBar label="Liquidity" value={run.meters.liquidity} colorClass="liquidity" />
        <MeterBar label="Staff Loyalty" value={run.meters.staffLoyalty} colorClass="staff" />
      </div>
    </header>
  );
};
