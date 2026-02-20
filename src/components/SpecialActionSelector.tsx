import { PlayerRoundPolicy } from "../engine/types";
import { titleCase } from "../utils/format";

interface SpecialActionSelectorProps {
  value: PlayerRoundPolicy["specialAction"];
  onChange: (value: PlayerRoundPolicy["specialAction"]) => void;
}

const actions: PlayerRoundPolicy["specialAction"][] = [
  "none",
  "paidResearch",
  "hedgeBook",
  "prSpin",
  "questionableTip"
];

export const SpecialActionSelector = ({ value, onChange }: SpecialActionSelectorProps) => {
  return (
    <section className="panel control-group">
      <h3>Special Action</h3>
      <label>
        Select one action
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as PlayerRoundPolicy["specialAction"])}
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {titleCase(action)}
            </option>
          ))}
        </select>
      </label>
      <p className="muted small">
        Questionable Tip: high expected edge, higher heat and scandal risk.
      </p>
    </section>
  );
};
