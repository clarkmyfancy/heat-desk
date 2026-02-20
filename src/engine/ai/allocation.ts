import { RISK_SIZE_MULTIPLIER } from "../constants";
import { scoreAssets } from "./scoring";
import { DecisionInput, TradeDecision } from "../types";

const concentrationProfile = {
  diversified: [0.25, 0.2, 0.18, 0.15, 0.12, 0.1],
  focused: [0.42, 0.26, 0.16, 0.1, 0.06, 0]
} as const;

export const computeTradeDecisions = (input: DecisionInput): TradeDecision[] => {
  const scored = scoreAssets(input).sort((a, b) => b.score - a.score);
  const profile = concentrationProfile[input.policy.concentration];
  const riskScale = RISK_SIZE_MULTIPLIER[input.policy.riskLevel];

  const decisions = scored.map((entry, index) => {
    const baseWeight = profile[index] ?? 0;
    const targetWeight = Math.max(0, baseWeight * riskScale);
    return {
      assetId: entry.asset.id,
      targetWeight,
      rationale: [...entry.reasons, `Ranked #${index + 1} by composite score ${entry.score.toFixed(1)}`]
    } satisfies TradeDecision;
  });

  const total = decisions.reduce((sum, decision) => sum + decision.targetWeight, 0);
  if (total <= 0) return decisions;

  return decisions.map((decision) => ({
    ...decision,
    targetWeight: decision.targetWeight / total
  }));
};
