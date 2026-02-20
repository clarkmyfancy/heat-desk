import { MetaNode } from "../types";

export const META_NODES: MetaNode[] = [
  {
    id: "meta-start-capital",
    name: "Anchor Capital",
    description: "+$50k starting NAV (repeatable up to 5).",
    cost: 80,
    repeatable: true,
    maxPurchases: 5,
    effect: { type: "startingCapital", value: 50_000 }
  },
  {
    id: "meta-start-confidence",
    name: "LP Goodwill",
    description: "+5 starting investor confidence (repeatable up to 4).",
    cost: 65,
    repeatable: true,
    maxPurchases: 4,
    effect: { type: "startingConfidence", value: 5 }
  },
  {
    id: "meta-start-heat",
    name: "Quiet Compliance",
    description: "-3 starting heat (repeatable up to 5).",
    cost: 70,
    repeatable: true,
    maxPurchases: 5,
    effect: { type: "startingHeatReduction", value: 3 }
  },
  {
    id: "meta-shadow-pool",
    name: "Shadow Rolodex",
    description: "Unlock extra shadow-tag upgrade appearances.",
    cost: 140,
    effect: { type: "unlockUpgradeTag", tag: "shadow" }
  },
  {
    id: "meta-start-relic",
    name: "Legacy Playbook",
    description: "Start each run with one common relic.",
    cost: 180,
    effect: { type: "startWithCommonRelic" }
  },
  {
    id: "meta-rp-bonus",
    name: "Brand Franchise",
    description: "+8% RP from completed runs.",
    cost: 160,
    effect: { type: "rpBonus", value: 0.08 }
  },
  {
    id: "meta-research-pool",
    name: "Academic Pipeline",
    description: "Unlock extra research-tag upgrade appearances.",
    cost: 120,
    effect: { type: "unlockUpgradeTag", tag: "research" }
  },
  {
    id: "meta-execution-pool",
    name: "Execution Lattice",
    description: "Unlock extra execution-tag upgrade appearances.",
    cost: 110,
    effect: { type: "unlockUpgradeTag", tag: "execution" }
  }
];
