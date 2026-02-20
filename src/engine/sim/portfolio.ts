import {
  LEVERAGE_MULTIPLIER,
  STOP_LOSS_CLIP,
  STOP_LOSS_UPSIDE_CLIP
} from "../constants";
import { PortfolioSimulationInput, PortfolioSimulationResult } from "../types";

const macroSectorReturnBias: Record<string, Partial<Record<string, number>>> = {
  "Risk-On": { tech: 0.012, retail: 0.009, crypto: 0.017, bonds: -0.004 },
  "Risk-Off": { tech: -0.007, retail: -0.01, crypto: -0.016, bonds: 0.005 },
  "Inflation Scare": { energy: 0.011, retail: -0.008, bonds: -0.005 },
  "Consumer Slowdown": { retail: -0.013, pharma: 0.003, bonds: 0.004 },
  "Liquidity Squeeze": { crypto: -0.02, tech: -0.01, bonds: 0.002, energy: -0.005 },
  "AI Hype": { tech: 0.018, crypto: 0.01, bonds: -0.003 }
};

export const simulatePortfolioWeek = ({
  assets,
  decisions,
  policy,
  macro,
  events,
  meters,
  upgrades,
  rng
}: PortfolioSimulationInput): PortfolioSimulationResult => {
  const decisionByAsset = new Map(decisions.map((decision) => [decision.assetId, decision]));
  const leverage = LEVERAGE_MULTIPLIER[policy.leverage];

  const slippageMultiplier = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .filter((effect): effect is { type: "slippageMultiplier"; value: number } => effect.type === "slippageMultiplier")
    .reduce((multiplier, effect) => multiplier * effect.value, 1);

  const drawdownCapUpgrade = upgrades
    .flatMap((upgrade) => upgrade.effects)
    .find((effect): effect is { type: "drawdownCapOnce"; capPct: number } => effect.type === "drawdownCapOnce");

  let grossPortfolioReturn = 0;
  const assetReturns: Record<string, number> = {};
  const perAssetPnl: { assetId: string; pnl: number }[] = [];

  for (const asset of assets) {
    const decision = decisionByAsset.get(asset.id);
    const weight = decision?.targetWeight ?? 0;
    const eventShock = events.reduce((sum, event) => {
      if (!event.affectedSectors.includes(asset.sector)) return sum;
      return sum + event.direction * event.magnitude * event.confidence * 0.02;
    }, 0);

    const macroBias = macroSectorReturnBias[macro]?.[asset.sector] ?? 0;
    const trendLift = asset.trendBias * 0.008;
    const randomMove = (rng.next() - 0.5) * 2 * asset.baseVolatility;

    let weeklyReturn = trendLift + macroBias + eventShock + randomMove;

    if (policy.stopLoss !== "loose") {
      weeklyReturn = Math.max(STOP_LOSS_CLIP[policy.stopLoss], weeklyReturn);
      weeklyReturn = Math.min(STOP_LOSS_UPSIDE_CLIP[policy.stopLoss], weeklyReturn);
    }

    if (policy.specialAction === "hedgeBook") {
      weeklyReturn = weeklyReturn < 0 ? weeklyReturn * 0.7 : weeklyReturn * 0.82;
    }

    assetReturns[asset.id] = weeklyReturn * 100;
    const contribution = weight * weeklyReturn * leverage;
    grossPortfolioReturn += contribution;

    const pnl = meters.nav * contribution;
    perAssetPnl.push({ assetId: asset.id, pnl });
  }

  const concentrationPenalty =
    policy.concentration === "focused" ? 0.0025 : 0.0012;
  const leveragePenalty = Math.max(0, leverage - 1) * 0.0038;
  const liquidityPenalty = meters.liquidity < 45 ? (45 - meters.liquidity) * 0.00018 : 0;

  const slippagePct = (concentrationPenalty + leveragePenalty + liquidityPenalty) * slippageMultiplier;
  const transactionCostPct = 0.001 + decisions.length * 0.00006;

  let netReturn = grossPortfolioReturn - slippagePct - transactionCostPct;

  if (drawdownCapUpgrade && netReturn < drawdownCapUpgrade.capPct) {
    netReturn = drawdownCapUpgrade.capPct;
  }

  const navAfter = Math.max(0, meters.nav * (1 + netReturn));

  const updatedAssets = assets.map((asset) => {
    const pct = assetReturns[asset.id] ?? 0;
    const nextPrice = Math.max(1, asset.price * (1 + pct / 100));
    const nextHistory = [...asset.priceHistory.slice(-24), nextPrice];

    return {
      ...asset,
      price: nextPrice,
      priceHistory: nextHistory,
      lastRoundReturnPct: pct
    };
  });

  const sortedByPnl = [...perAssetPnl].sort((a, b) => b.pnl - a.pnl);

  return {
    updatedAssets,
    assetReturns,
    portfolioReturnPct: netReturn * 100,
    navAfter,
    topContributors: sortedByPnl.slice(0, 3),
    topDetractors: sortedByPnl.slice(-3).reverse(),
    slippagePct: slippagePct * 100,
    transactionCostPct: transactionCostPct * 100
  };
};
