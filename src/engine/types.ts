export type StrategyFocus = "momentum" | "meanReversion" | "value" | "eventDriven";
export type RiskLevel = "conservative" | "balanced" | "aggressive" | "reckless";
export type ConcentrationMode = "diversified" | "focused";
export type StopLossMode = "loose" | "normal" | "strict";
export type LeverageMode = "off" | "low" | "medium" | "high";

export type Sector = "tech" | "pharma" | "energy" | "retail" | "crypto" | "bonds";

export type SpecialAction =
  | "none"
  | "paidResearch"
  | "hedgeBook"
  | "prSpin"
  | "questionableTip";

export type MacroRegime =
  | "Risk-On"
  | "Risk-Off"
  | "Inflation Scare"
  | "Consumer Slowdown"
  | "Liquidity Squeeze"
  | "AI Hype";

export interface AssetState {
  id: string;
  name: string;
  sector: Sector;
  price: number;
  priceHistory: number[];
  baseVolatility: number;
  trendBias: number;
  hiddenFundamental: number;
  sensitivities: string[];
  lastRoundReturnPct: number;
}

export interface Meters {
  nav: number;
  heat: number;
  investorConfidence: number;
  staffLoyalty: number;
  liquidity: number;
}

export interface PlayerRoundPolicy {
  strategyFocus: StrategyFocus;
  riskLevel: RiskLevel;
  sectorTilt: "none" | "tech" | "pharma" | "energy" | "retail" | "defensive";
  specialAction: SpecialAction;
  stopLoss: StopLossMode;
  concentration: ConcentrationMode;
  leverage: LeverageMode;
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "research" | "questionable";
  affectedSectors: string[];
  direction: number;
  magnitude: number;
  heatImpact?: number;
  confidence: number;
}

export interface EventTemplate {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "research" | "questionable";
  affectedSectors: Sector[];
  direction: number;
  magnitude: number;
  confidence: number;
  heatImpact?: number;
  tags: string[];
  macroWeights?: Partial<Record<MacroRegime, number>>;
  roundWeightBias?: number;
}

export interface RoundSignal {
  assetId: string;
  signalScore: number;
  reasons: string[];
}

export interface TradeDecision {
  assetId: string;
  targetWeight: number;
  rationale: string[];
}

export interface MeterChangeReasons {
  heat: string[];
  investorConfidence: string[];
  staffLoyalty: string[];
  liquidity: string[];
}

export interface RoundOutcome {
  round: number;
  macroRegime: string;
  events: MarketEvent[];
  signals: RoundSignal[];
  decisions: TradeDecision[];
  assetReturns: Record<string, number>;
  portfolioReturnPct: number;
  navBefore: number;
  navAfter: number;
  meterChanges: {
    heat: number;
    investorConfidence: number;
    staffLoyalty: number;
    liquidity: number;
  };
  recapLines: string[];
  topContributors: { assetId: string; pnl: number }[];
  topDetractors: { assetId: string; pnl: number }[];
  heatChangeReasons: string[];
  confidenceChangeReasons: string[];
}

export type UpgradeEffect =
  | { type: "signalQualityBonus"; source: "paidResearch" | "all"; value: number }
  | { type: "slippageMultiplier"; value: number }
  | { type: "confidenceOnLoss"; value: number }
  | { type: "heatDecayInterval"; interval: number; amount: number }
  | { type: "questionableTipBoost"; signalBonus: number; extraHeat: number }
  | { type: "revealNextMacro" }
  | { type: "sectorSignalBoost"; sector: Sector; value: number }
  | { type: "drawdownCapOnce"; capPct: number }
  | { type: "liquidityFloor"; value: number }
  | { type: "confidenceVolShield"; value: number }
  | { type: "riskPenaltyMultiplier"; value: number }
  | { type: "startingRelicEligible" }
  | { type: "rpBonusMultiplier"; value: number };

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  rarity: "common" | "rare";
  effects: UpgradeEffect[];
}

export interface UpgradeInstance {
  id: string;
  name: string;
  description: string;
  tags: string[];
  effects: UpgradeEffect[];
}

export interface MetaProgression {
  reputationPoints: number;
  unlockedMetaNodeIds: string[];
  permanentBonuses: {
    startingCapitalBonus: number;
    startingHeatReduction: number;
    startingConfidenceBonus: number;
  };
}

export interface MetaNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  repeatable?: boolean;
  maxPurchases?: number;
  effect:
    | { type: "startingCapital"; value: number }
    | { type: "startingHeatReduction"; value: number }
    | { type: "startingConfidence"; value: number }
    | { type: "unlockUpgradeTag"; tag: string }
    | { type: "startWithCommonRelic" }
    | { type: "rpBonus"; value: number };
}

export interface RunState {
  seed: number;
  round: number;
  assets: AssetState[];
  meters: Meters;
  activeUpgrades: UpgradeInstance[];
  pendingUpgradeChoices: UpgradeInstance[] | null;
  currentPolicy: PlayerRoundPolicy;
  history: RoundOutcome[];
  isGameOver: boolean;
  endReason: "win" | "bankruptcy" | "regulator" | "redemption" | null;
  upcomingMacroHint?: MacroRegime | null;
}

export interface LastRunSummary {
  endedAtIso: string;
  endReason: NonNullable<RunState["endReason"]>;
  roundsSurvived: number;
  finalNav: number;
  totalReturnPct: number;
  highestHeat: number;
  biggestWinningRound: number;
  biggestLosingRound: number;
  reputationEarned: number;
  timeline: string[];
}

export interface SaveBlob {
  version: 1;
  metaProgression: MetaProgression;
  settings: {
    theme: "dark" | "light";
    tutorialDismissed: boolean;
  };
  lastRunSummary: LastRunSummary | null;
}

export interface RngLike {
  next: () => number;
  nextInt: (min: number, max: number) => number;
  pick: <T>(items: T[]) => T;
  shuffle: <T>(items: T[]) => T[];
}

export interface SignalBuildInput {
  assets: AssetState[];
  events: MarketEvent[];
  macro: MacroRegime;
  policy: PlayerRoundPolicy;
  upgrades: UpgradeInstance[];
  rng: RngLike;
}

export interface DecisionInput {
  signals: RoundSignal[];
  policy: PlayerRoundPolicy;
  assets: AssetState[];
  meters: Meters;
  upgrades: UpgradeInstance[];
}

export interface PortfolioSimulationInput {
  assets: AssetState[];
  decisions: TradeDecision[];
  policy: PlayerRoundPolicy;
  macro: MacroRegime;
  events: MarketEvent[];
  meters: Meters;
  upgrades: UpgradeInstance[];
  rng: RngLike;
}

export interface PortfolioSimulationResult {
  updatedAssets: AssetState[];
  assetReturns: Record<string, number>;
  portfolioReturnPct: number;
  navAfter: number;
  topContributors: { assetId: string; pnl: number }[];
  topDetractors: { assetId: string; pnl: number }[];
  slippagePct: number;
  transactionCostPct: number;
}
