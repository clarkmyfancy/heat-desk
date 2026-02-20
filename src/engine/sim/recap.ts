import { AssetState, MarketEvent, PlayerRoundPolicy, RoundOutcome, TradeDecision } from "../types";

interface BuildRecapInput {
  round: number;
  macroRegime: string;
  events: MarketEvent[];
  policy: PlayerRoundPolicy;
  decisions: TradeDecision[];
  portfolioReturnPct: number;
  slippagePct: number;
  transactionCostPct: number;
  assets: AssetState[];
  topContributors: { assetId: string; pnl: number }[];
  topDetractors: { assetId: string; pnl: number }[];
  meterReasons: {
    heat: string[];
    investorConfidence: string[];
    staffLoyalty: string[];
    liquidity: string[];
  };
}

export const buildRoundRecap = ({
  round,
  macroRegime,
  events,
  policy,
  decisions,
  portfolioReturnPct,
  slippagePct,
  transactionCostPct,
  assets,
  topContributors,
  topDetractors,
  meterReasons
}: BuildRecapInput): Pick<RoundOutcome, "recapLines" | "heatChangeReasons" | "confidenceChangeReasons"> => {
  const recapLines: string[] = [];

  recapLines.push(`[Market] Round ${round} macro regime: ${macroRegime}`);
  recapLines.push(
    `[AI] Strategy ${policy.strategyFocus}, risk ${policy.riskLevel}, leverage ${policy.leverage}, concentration ${policy.concentration}`
  );

  if (events.length === 0) {
    recapLines.push("[Market] No major event cards this week.");
  } else {
    events.forEach((event) => {
      recapLines.push(`[Market] ${event.title} (${event.visibility})`);
    });
  }

  const topDecision = [...decisions].sort((a, b) => b.targetWeight - a.targetWeight).slice(0, 2);
  topDecision.forEach((decision) => {
    const assetName = assets.find((asset) => asset.id === decision.assetId)?.name ?? decision.assetId;
    recapLines.push(`[AI] Weighted ${assetName} at ${(decision.targetWeight * 100).toFixed(1)}%`);
  });

  recapLines.push(
    `[Risk] Return ${portfolioReturnPct.toFixed(2)}% after slippage ${slippagePct.toFixed(2)}% and fees ${transactionCostPct.toFixed(2)}%`
  );

  const contributorLine = topContributors
    .map((item) => `${assets.find((asset) => asset.id === item.assetId)?.name ?? item.assetId} ${item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(0)}`)
    .join(", ");
  const detractorLine = topDetractors
    .map((item) => `${assets.find((asset) => asset.id === item.assetId)?.name ?? item.assetId} ${item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(0)}`)
    .join(", ");

  recapLines.push(`[AI] Top contributors: ${contributorLine}`);
  recapLines.push(`[AI] Top detractors: ${detractorLine}`);

  meterReasons.heat.forEach((reason) => recapLines.push(`[Compliance] ${reason}`));
  meterReasons.investorConfidence.forEach((reason) => recapLines.push(`[Risk] ${reason}`));

  return {
    recapLines,
    heatChangeReasons: meterReasons.heat,
    confidenceChangeReasons: meterReasons.investorConfidence
  };
};
