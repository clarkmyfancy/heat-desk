import { PlayerRoundPolicy } from "../engine/types";
import { titleCase } from "../utils/format";

interface PolicyControlsProps {
  policy: PlayerRoundPolicy;
  onChange: (partial: Partial<PlayerRoundPolicy>) => void;
}

const stopLossOptions: PlayerRoundPolicy["stopLoss"][] = ["loose", "normal", "strict"];
const concentrationOptions: PlayerRoundPolicy["concentration"][] = ["diversified", "focused"];
const leverageOptions: PlayerRoundPolicy["leverage"][] = ["off", "low", "medium", "high"];

export const PolicyControls = ({ policy, onChange }: PolicyControlsProps) => {
  return (
    <section className="panel control-group">
      <h3>AI Policy Knobs</h3>
      <label>
        Stop Loss Strictness
        <select
          value={policy.stopLoss}
          onChange={(event) => onChange({ stopLoss: event.target.value as PlayerRoundPolicy["stopLoss"] })}
        >
          {stopLossOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Concentration
        <select
          value={policy.concentration}
          onChange={(event) =>
            onChange({ concentration: event.target.value as PlayerRoundPolicy["concentration"] })
          }
        >
          {concentrationOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Leverage
        <select
          value={policy.leverage}
          onChange={(event) => onChange({ leverage: event.target.value as PlayerRoundPolicy["leverage"] })}
        >
          {leverageOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
};
