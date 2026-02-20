import { Sector, SignalBuildInput } from "../types";

const macroBiasBySector: Record<string, Partial<Record<string, number>>> = {
  "Risk-On": { tech: 10, crypto: 14, retail: 6, bonds: -6 },
  "Risk-Off": { bonds: 12, tech: -6, crypto: -10, retail: -7 },
  "Inflation Scare": { energy: 10, retail: -8, bonds: -5 },
  "Consumer Slowdown": { retail: -11, pharma: 3, bonds: 5 },
  "Liquidity Squeeze": { crypto: -15, tech: -7, bonds: 4, energy: -2 },
  "AI Hype": { tech: 14, crypto: 8, bonds: -4 }
};

const strategyMultiplierByMode: Record<string, number> = {
  momentum: 1,
  meanReversion: 1,
  value: 1,
  eventDriven: 1.15
};

const tiltBonus = (sector: string, tilt: string): number => {
  if (tilt === "none") return 0;
  if (tilt === "defensive") return sector === "bonds" ? 10 : -2;
  return sector === tilt ? 8 : 0;
};

export const buildSignals = ({ assets, events, macro, policy, upgrades, rng }: SignalBuildInput) => {
  const paidResearchBonus =
    policy.specialAction === "paidResearch"
      ? upgrades
          .flatMap((upgrade) => upgrade.effects)
          .filter((effect): effect is { type: "signalQualityBonus"; source: "paidResearch" | "all"; value: number } =>
            effect.type === "signalQualityBonus"
          )
          .reduce((sum, effect) => {
            if (effect.source === "paidResearch" || effect.source === "all") return sum + effect.value;
            return sum;
          }, 0)
      : 0;

  const allSignalBonus = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .filter((effect): effect is { type: "signalQualityBonus"; source: "paidResearch" | "all"; value: number } => effect.type === "signalQualityBonus")
    .reduce((sum, effect) => (effect.source === "all" ? sum + effect.value : sum), 0);

  const questionableTipBoost = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .find((effect): effect is { type: "questionableTipBoost"; signalBonus: number; extraHeat: number } =>
      effect.type === "questionableTipBoost"
    );

  return assets.map((asset) => {
    const reasons: string[] = [];

    const trendScore = asset.trendBias * 26;
    reasons.push(`Trend bias ${trendScore >= 0 ? "supports" : "opposes"} trade`);

    const macroScore = (macroBiasBySector[macro]?.[asset.sector] ?? 0) * 0.9;
    if (macroScore !== 0) reasons.push(`${macro} impacts ${asset.sector}`);

    const eventScore = events.reduce((score, event) => {
      if (!event.affectedSectors.includes(asset.sector)) return score;
      const delta = event.direction * event.magnitude * event.confidence * 30;
      reasons.push(`Event: ${event.title}`);
      return score + delta;
    }, 0);

    let strategyScore = 0;
    if (policy.strategyFocus === "momentum") {
      strategyScore = asset.lastRoundReturnPct >= 0 ? 12 : -6;
      reasons.push("Momentum preference applied");
    }
    if (policy.strategyFocus === "meanReversion") {
      strategyScore = asset.lastRoundReturnPct <= -2 ? 14 : -4;
      reasons.push("Mean reversion checks recent losers");
    }
    if (policy.strategyFocus === "value") {
      const valuationGap = (asset.hiddenFundamental - asset.price) / Math.max(1, asset.price);
      strategyScore = valuationGap * 60;
      reasons.push("Value spread versus fundamentals");
    }
    if (policy.strategyFocus === "eventDriven") {
      strategyScore = eventScore * 0.45;
      reasons.push("Event-driven weights event intensity");
    }

    const tilt = tiltBonus(asset.sector, policy.sectorTilt);
    if (tilt !== 0) reasons.push("Sector tilt adjustment");

    const sectorSpecialistBonus = upgrades
      .flatMap((upgrade) => upgrade.effects)
      .filter((effect): effect is { type: "sectorSignalBoost"; sector: Sector; value: number } =>
        effect.type === "sectorSignalBoost"
      )
      .reduce((sum, effect) => (effect.sector === asset.sector ? sum + effect.value : sum), 0);

    const noise = (rng.next() - 0.5) * 14;
    let signalScore =
      (strategyScore + eventScore + trendScore + macroScore + tilt + sectorSpecialistBonus + noise) *
      strategyMultiplierByMode[policy.strategyFocus];

    if (policy.specialAction === "paidResearch") {
      signalScore *= 1 + 0.12 + paidResearchBonus;
      reasons.push("Paid research signal boost");
    }

    if (policy.specialAction === "questionableTip") {
      if (rng.next() < 0.42) {
        const tipBoost = 18 + (questionableTipBoost?.signalBonus ?? 0);
        signalScore += tipBoost;
        reasons.push("Questionable tip was directionally useful");
      } else {
        signalScore -= 12;
        reasons.push("Questionable tip introduced bad signal noise");
      }
    }

    signalScore *= 1 + allSignalBonus;

    return {
      assetId: asset.id,
      signalScore: Math.max(-100, Math.min(100, signalScore)),
      reasons
    };
  });
};
