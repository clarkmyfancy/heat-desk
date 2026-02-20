import { Meters, PlayerRoundPolicy, RoundOutcome, UpgradeInstance } from "../types";

interface MeterUpdateInput {
  meters: Meters;
  roundResult: Pick<RoundOutcome, "portfolioReturnPct" | "events">;
  policy: PlayerRoundPolicy;
  round: number;
  upgrades: UpgradeInstance[];
  rng: { next: () => number };
}

export interface MeterUpdateResult {
  nextMeters: Meters;
  changes: {
    heat: number;
    investorConfidence: number;
    staffLoyalty: number;
    liquidity: number;
  };
  reasons: {
    heat: string[];
    investorConfidence: string[];
    staffLoyalty: string[];
    liquidity: string[];
  };
}

const clampMeter = (value: number): number => Math.max(0, Math.min(100, value));

export const updateMeters = ({
  meters,
  roundResult,
  policy,
  round,
  upgrades,
  rng
}: MeterUpdateInput): MeterUpdateResult => {
  let heatDelta = 0;
  let confidenceDelta = 0;
  let loyaltyDelta = 0;
  let liquidityDelta = 0;

  const reasons = {
    heat: [] as string[],
    investorConfidence: [] as string[],
    staffLoyalty: [] as string[],
    liquidity: [] as string[]
  };

  if (policy.specialAction === "questionableTip") {
    const extraHeat = 10 + Math.round(rng.next() * 8);
    heatDelta += extraHeat;
    reasons.heat.push(`Questionable tip scrutiny +${extraHeat}`);
    loyaltyDelta -= 3;
    reasons.staffLoyalty.push("Team concern over questionable sourcing");
  }

  const questionableUpgrade = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .find((effect): effect is { type: "questionableTipBoost"; signalBonus: number; extraHeat: number } =>
      effect.type === "questionableTipBoost"
    );

  if (policy.specialAction === "questionableTip" && questionableUpgrade) {
    heatDelta += questionableUpgrade.extraHeat;
    reasons.heat.push(`Networked Source traceability +${questionableUpgrade.extraHeat}`);
  }

  if (policy.leverage === "high" && policy.concentration === "focused" && roundResult.portfolioReturnPct > 4) {
    const spike = 2 + Math.floor(Math.abs(roundResult.portfolioReturnPct) / 2);
    heatDelta += Math.min(6, spike);
    reasons.heat.push("Aggressive concentrated win flagged by regulators");
  }

  const eventHeat = roundResult.events.reduce((sum, event) => sum + (event.heatImpact ?? 0), 0);
  if (eventHeat > 0) {
    heatDelta += eventHeat;
    reasons.heat.push(`Event-driven scrutiny +${eventHeat}`);
  }

  if (roundResult.portfolioReturnPct > 2) {
    const gain = 4 + (policy.riskLevel === "conservative" ? 2 : 0);
    confidenceDelta += gain;
    reasons.investorConfidence.push(`Strong performance +${gain}`);
  }

  if (roundResult.portfolioReturnPct < -4) {
    const lossHit = -8 - Math.min(7, Math.floor(Math.abs(roundResult.portfolioReturnPct)));
    confidenceDelta += lossHit;
    reasons.investorConfidence.push(`Drawdown impact ${lossHit}`);
    loyaltyDelta -= 5;
    reasons.staffLoyalty.push("Bad pay period hurts morale");
  }

  if (Math.abs(roundResult.portfolioReturnPct) > 8) {
    confidenceDelta -= 4;
    reasons.investorConfidence.push("Volatility shakes allocator confidence");
  }

  if (heatDelta > 15) {
    confidenceDelta -= 5;
    reasons.investorConfidence.push("Heat spike triggered redemption concerns");
  }

  if (policy.specialAction === "prSpin" && roundResult.portfolioReturnPct <= 0) {
    confidenceDelta += 6;
    reasons.investorConfidence.push("PR spin steadied investor messaging");
  }

  if (policy.specialAction === "paidResearch") {
    liquidityDelta -= 2;
    reasons.liquidity.push("Research spend consumed liquidity");
  }

  if (policy.leverage === "medium") {
    liquidityDelta -= 3;
    reasons.liquidity.push("Financing costs from medium leverage");
  }

  if (policy.leverage === "high") {
    liquidityDelta -= 6;
    reasons.liquidity.push("High leverage stresses liquidity");
  }

  if (roundResult.portfolioReturnPct > 0) {
    liquidityDelta += Math.min(5, roundResult.portfolioReturnPct * 0.3);
    reasons.liquidity.push("Profitable week replenished liquidity");
  } else {
    liquidityDelta += Math.max(-8, roundResult.portfolioReturnPct * 0.4);
    reasons.liquidity.push("Losses reduced liquidity cushion");
  }

  if (policy.specialAction === "none" && policy.leverage === "off") {
    heatDelta -= 2;
    reasons.heat.push("Low profile week reduced scrutiny");
  }

  for (const effect of upgrades.flatMap((upgrade) => upgrade.effects)) {
    if (effect.type === "heatDecayInterval" && round % effect.interval === 0) {
      heatDelta -= effect.amount;
      reasons.heat.push(`Compliance Counsel reduced heat by ${effect.amount}`);
    }
    if (effect.type === "confidenceOnLoss" && roundResult.portfolioReturnPct < 0) {
      confidenceDelta += effect.value;
      reasons.investorConfidence.push(`${effect.value} confidence recovered from investor communication`);
    }
    if (effect.type === "confidenceVolShield" && Math.abs(roundResult.portfolioReturnPct) > 6) {
      confidenceDelta += effect.value;
      reasons.investorConfidence.push("Volatility briefing reduced confidence damage");
    }
  }

  const liquidityFloor = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .filter((effect): effect is { type: "liquidityFloor"; value: number } => effect.type === "liquidityFloor")
    .reduce((floor, effect) => Math.max(floor, effect.value), 0);

  const nextMeters = {
    nav: meters.nav,
    heat: clampMeter(meters.heat + heatDelta),
    investorConfidence: clampMeter(meters.investorConfidence + confidenceDelta),
    staffLoyalty: clampMeter(meters.staffLoyalty + loyaltyDelta),
    liquidity: clampMeter(Math.max(liquidityFloor, meters.liquidity + liquidityDelta))
  };

  return {
    nextMeters,
    changes: {
      heat: nextMeters.heat - meters.heat,
      investorConfidence: nextMeters.investorConfidence - meters.investorConfidence,
      staffLoyalty: nextMeters.staffLoyalty - meters.staffLoyalty,
      liquidity: nextMeters.liquidity - meters.liquidity
    },
    reasons
  };
};
