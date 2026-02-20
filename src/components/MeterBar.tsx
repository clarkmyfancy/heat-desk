interface MeterBarProps {
  label: string;
  value: number;
  colorClass: "heat" | "confidence" | "liquidity" | "staff";
}

export const MeterBar = ({ label, value, colorClass }: MeterBarProps) => {
  return (
    <div className="meter-item">
      <div className="meter-label-row">
        <span>{label}</span>
        <span>{value.toFixed(0)}</span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill ${colorClass}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
};
