import { MACRO_REGIMES } from "../constants";
import { MacroRegime, RngLike } from "../types";

const MACRO_WEIGHTS: Record<MacroRegime, number> = {
  "Risk-On": 1,
  "Risk-Off": 1,
  "Inflation Scare": 0.9,
  "Consumer Slowdown": 0.9,
  "Liquidity Squeeze": 0.8,
  "AI Hype": 0.9
};

export const generateMacroRegime = (rng: RngLike): MacroRegime => {
  const totalWeight = MACRO_REGIMES.reduce((sum, regime) => sum + MACRO_WEIGHTS[regime], 0);
  let threshold = rng.next() * totalWeight;

  for (const regime of MACRO_REGIMES) {
    threshold -= MACRO_WEIGHTS[regime];
    if (threshold <= 0) {
      return regime;
    }
  }

  return "Risk-On";
};
