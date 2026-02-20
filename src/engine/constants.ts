import {
  ConcentrationMode,
  LeverageMode,
  MacroRegime,
  PlayerRoundPolicy,
  RiskLevel,
  StopLossMode,
  StrategyFocus
} from "./types";

export const TOTAL_ROUNDS = 12;
export const STARTING_CAPITAL = 1_000_000;
export const STORAGE_KEY = "autotrader-roguelite-save-v1";

export const DEFAULT_POLICY: PlayerRoundPolicy = {
  strategyFocus: "momentum",
  riskLevel: "balanced",
  sectorTilt: "none",
  specialAction: "none",
  stopLoss: "normal",
  concentration: "diversified",
  leverage: "off"
};

export const STRATEGIES: StrategyFocus[] = [
  "momentum",
  "meanReversion",
  "value",
  "eventDriven"
];

export const RISK_LEVELS: RiskLevel[] = [
  "conservative",
  "balanced",
  "aggressive",
  "reckless"
];

export const STOP_LOSS_MODES: StopLossMode[] = ["loose", "normal", "strict"];
export const CONCENTRATION_MODES: ConcentrationMode[] = ["diversified", "focused"];
export const LEVERAGE_MODES: LeverageMode[] = ["off", "low", "medium", "high"];

export const MACRO_REGIMES: MacroRegime[] = [
  "Risk-On",
  "Risk-Off",
  "Inflation Scare",
  "Consumer Slowdown",
  "Liquidity Squeeze",
  "AI Hype"
];

export const LEVERAGE_MULTIPLIER: Record<LeverageMode, number> = {
  off: 1,
  low: 1.25,
  medium: 1.6,
  high: 2.1
};

export const RISK_SIZE_MULTIPLIER: Record<RiskLevel, number> = {
  conservative: 0.65,
  balanced: 0.9,
  aggressive: 1.1,
  reckless: 1.35
};

export const STOP_LOSS_CLIP: Record<StopLossMode, number> = {
  strict: -0.035,
  normal: -0.065,
  loose: -0.11
};

export const STOP_LOSS_UPSIDE_CLIP: Record<StopLossMode, number> = {
  strict: 0.13,
  normal: 0.18,
  loose: 0.28
};
