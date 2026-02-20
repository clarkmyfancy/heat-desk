import { AssetState } from "../types";

export const BASE_ASSETS: AssetState[] = [
  {
    id: "aethertech",
    name: "AetherTech",
    sector: "tech",
    price: 142,
    priceHistory: [132, 136, 139, 141, 142],
    baseVolatility: 0.06,
    trendBias: 0.55,
    hiddenFundamental: 149,
    sensitivities: ["macro", "rumor", "legal"],
    lastRoundReturnPct: 0
  },
  {
    id: "novapharm",
    name: "NovaPharm",
    sector: "pharma",
    price: 88,
    priceHistory: [92, 90, 91, 89, 88],
    baseVolatility: 0.07,
    trendBias: -0.1,
    hiddenFundamental: 94,
    sensitivities: ["legal", "rumor", "event"],
    lastRoundReturnPct: 0
  },
  {
    id: "irongrid",
    name: "IronGrid Energy",
    sector: "energy",
    price: 76,
    priceHistory: [73, 74, 76, 75, 76],
    baseVolatility: 0.05,
    trendBias: 0.2,
    hiddenFundamental: 78,
    sensitivities: ["macro", "commodity"],
    lastRoundReturnPct: 0
  },
  {
    id: "mallaxis",
    name: "MallAxis Retail",
    sector: "retail",
    price: 61,
    priceHistory: [68, 65, 64, 62, 61],
    baseVolatility: 0.045,
    trendBias: -0.2,
    hiddenFundamental: 66,
    sensitivities: ["consumer", "macro"],
    lastRoundReturnPct: 0
  },
  {
    id: "blockforge",
    name: "BlockForge",
    sector: "crypto",
    price: 34,
    priceHistory: [27, 30, 29, 33, 34],
    baseVolatility: 0.12,
    trendBias: 0.4,
    hiddenFundamental: 26,
    sensitivities: ["rumor", "liquidity", "macro"],
    lastRoundReturnPct: 0
  },
  {
    id: "harborbonds",
    name: "Harbor Bonds",
    sector: "bonds",
    price: 102,
    priceHistory: [101, 101, 102, 102, 102],
    baseVolatility: 0.012,
    trendBias: 0.08,
    hiddenFundamental: 103,
    sensitivities: ["macro", "liquidity"],
    lastRoundReturnPct: 0
  }
];

export const cloneBaseAssets = (): AssetState[] => BASE_ASSETS.map((asset) => ({ ...asset, priceHistory: [...asset.priceHistory] }));
