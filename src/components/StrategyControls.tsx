import { PlayerRoundPolicy } from "../engine/types";
import { titleCase } from "../utils/format";

interface StrategyControlsProps {
  policy: PlayerRoundPolicy;
  onChange: (partial: Partial<PlayerRoundPolicy>) => void;
  onSimulate: () => void;
  disabled: boolean;
}

const strategyOptions: PlayerRoundPolicy["strategyFocus"][] = [
  "momentum",
  "meanReversion",
  "value",
  "eventDriven"
];
const riskOptions: PlayerRoundPolicy["riskLevel"][] = [
  "conservative",
  "balanced",
  "aggressive",
  "reckless"
];
const tiltOptions: PlayerRoundPolicy["sectorTilt"][] = [
  "none",
  "tech",
  "pharma",
  "energy",
  "retail",
  "defensive"
];

export const StrategyControls = ({
  policy,
  onChange,
  onSimulate,
  disabled
}: StrategyControlsProps) => {
  return (
    <section className="panel control-group">
      <h3>Strategy Settings</h3>
      <label>
        Strategy Focus
        <select
          value={policy.strategyFocus}
          onChange={(event) => onChange({ strategyFocus: event.target.value as PlayerRoundPolicy["strategyFocus"] })}
        >
          {strategyOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Risk Level
        <select
          value={policy.riskLevel}
          onChange={(event) => onChange({ riskLevel: event.target.value as PlayerRoundPolicy["riskLevel"] })}
        >
          {riskOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Sector Tilt
        <select
          value={policy.sectorTilt}
          onChange={(event) => onChange({ sectorTilt: event.target.value as PlayerRoundPolicy["sectorTilt"] })}
        >
          {tiltOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>

      <button disabled={disabled} className="primary" onClick={onSimulate}>
        Simulate Week
      </button>
    </section>
  );
};
