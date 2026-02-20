import { AssetState, DecisionInput } from "../types";

export interface ScoredAsset {
  asset: AssetState;
  score: number;
  reasons: string[];
}

const riskPenaltyByLevel = {
  conservative: 14,
  balanced: 8,
  aggressive: 4,
  reckless: 1
} as const;

const stopLossPenalty = {
  strict: 2,
  normal: 0,
  loose: -2
} as const;

export const scoreAssets = ({ signals, assets, policy, meters, upgrades }: DecisionInput): ScoredAsset[] => {
  const riskPenaltyMultiplier = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .filter((effect): effect is { type: "riskPenaltyMultiplier"; value: number } => effect.type === "riskPenaltyMultiplier")
    .reduce((multiplier, effect) => multiplier * effect.value, 1);

  return assets.map((asset) => {
    const signal = signals.find((entry) => entry.assetId === asset.id);
    const signalScore = signal?.signalScore ?? 0;
    const trendScore = asset.trendBias * 12;
    const tiltBonus =
      policy.sectorTilt === "defensive"
        ? asset.sector === "bonds"
          ? 5
          : -1
        : policy.sectorTilt === asset.sector
          ? 6
          : 0;

    const riskPenaltyBase = riskPenaltyByLevel[policy.riskLevel] + stopLossPenalty[policy.stopLoss];
    const liquidityRiskPenalty = meters.liquidity < 45 ? (45 - meters.liquidity) * 0.2 : 0;
    const riskPenalty = (riskPenaltyBase + liquidityRiskPenalty) * riskPenaltyMultiplier;

    const score = signalScore + trendScore + tiltBonus - riskPenalty;
    const reasons = [
      ...(signal?.reasons ?? ["No clear signal"]),
      `Risk penalty ${riskPenalty.toFixed(1)} applied`
    ];

    return { asset, score, reasons };
  });
};
