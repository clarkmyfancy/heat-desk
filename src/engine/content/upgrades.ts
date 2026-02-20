import { UpgradeDefinition } from "../types";

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: "better-analysts",
    name: "Better Analysts",
    description: "+10% signal quality when using Paid Research.",
    tags: ["research", "common"],
    rarity: "common",
    effects: [{ type: "signalQualityBonus", source: "paidResearch", value: 0.1 }]
  },
  {
    id: "macro-desk",
    name: "Macro Desk",
    description: "Reveal next round macro regime.",
    tags: ["macro", "rare"],
    rarity: "rare",
    effects: [{ type: "revealNextMacro" }]
  },
  {
    id: "tighter-execution",
    name: "Tighter Execution",
    description: "Reduce slippage by 20%.",
    tags: ["execution", "common"],
    rarity: "common",
    effects: [{ type: "slippageMultiplier", value: 0.8 }]
  },
  {
    id: "calm-lp-letter",
    name: "Calm LP Letter",
    description: "+8 investor confidence on loss rounds.",
    tags: ["investor", "common"],
    rarity: "common",
    effects: [{ type: "confidenceOnLoss", value: 8 }]
  },
  {
    id: "volatility-collar",
    name: "Volatility Collar",
    description: "Cap one worst weekly drawdown at -6%.",
    tags: ["risk", "rare"],
    rarity: "rare",
    effects: [{ type: "drawdownCapOnce", capPct: -0.06 }]
  },
  {
    id: "compliance-counsel",
    name: "Compliance Counsel",
    description: "Reduce heat by 5 every 3 rounds.",
    tags: ["risk", "compliance", "common"],
    rarity: "common",
    effects: [{ type: "heatDecayInterval", interval: 3, amount: 5 }]
  },
  {
    id: "networked-source",
    name: "Networked Source",
    description: "Questionable Tip is stronger but adds extra heat.",
    tags: ["shadow", "rare"],
    rarity: "rare",
    effects: [{ type: "questionableTipBoost", signalBonus: 14, extraHeat: 4 }]
  },
  {
    id: "sector-specialist-pharma",
    name: "Sector Specialist: Pharma",
    description: "Boost pharma signal quality.",
    tags: ["research", "sector", "common"],
    rarity: "common",
    effects: [{ type: "sectorSignalBoost", sector: "pharma", value: 8 }]
  },
  {
    id: "sector-specialist-tech",
    name: "Sector Specialist: Tech",
    description: "Boost tech signal quality.",
    tags: ["research", "sector", "common"],
    rarity: "common",
    effects: [{ type: "sectorSignalBoost", sector: "tech", value: 8 }]
  },
  {
    id: "sector-specialist-energy",
    name: "Sector Specialist: Energy",
    description: "Boost energy signal quality.",
    tags: ["research", "sector", "common"],
    rarity: "common",
    effects: [{ type: "sectorSignalBoost", sector: "energy", value: 8 }]
  },
  {
    id: "risk-committee",
    name: "Risk Committee",
    description: "Lower risk penalties by 12%.",
    tags: ["risk", "common"],
    rarity: "common",
    effects: [{ type: "riskPenaltyMultiplier", value: 0.88 }]
  },
  {
    id: "liquidity-lines",
    name: "Liquidity Lines",
    description: "Liquidity cannot drop below 35.",
    tags: ["risk", "execution", "rare"],
    rarity: "rare",
    effects: [{ type: "liquidityFloor", value: 35 }]
  },
  {
    id: "volatility-primer",
    name: "Volatility Primer",
    description: "Soften confidence penalty from volatile weeks.",
    tags: ["investor", "common"],
    rarity: "common",
    effects: [{ type: "confidenceVolShield", value: 4 }]
  },
  {
    id: "deep-research-stack",
    name: "Deep Research Stack",
    description: "+6% signal quality on all signals.",
    tags: ["research", "rare"],
    rarity: "rare",
    effects: [{ type: "signalQualityBonus", source: "all", value: 0.06 }]
  },
  {
    id: "brand-trust",
    name: "Brand Trust",
    description: "+5% RP earned from each run.",
    tags: ["investor", "meta-synergy", "rare"],
    rarity: "rare",
    effects: [{ type: "rpBonusMultiplier", value: 0.05 }]
  }
];

export const getUpgradeById = (id: string) => UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id);
