import { UPGRADE_DEFINITIONS } from "../content/upgrades";
import { RngLike, UpgradeInstance } from "../types";

interface DraftInput {
  currentUpgrades: UpgradeInstance[];
  rng: RngLike;
  unlockedTags?: string[];
}

const toInstance = (id: string): UpgradeInstance | null => {
  const found = UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    description: found.description,
    tags: [...found.tags],
    effects: [...found.effects]
  };
};

export const draftUpgrades = ({ currentUpgrades, rng, unlockedTags = [] }: DraftInput): UpgradeInstance[] => {
  const owned = new Set(currentUpgrades.map((upgrade) => upgrade.id));
  const pool = UPGRADE_DEFINITIONS.filter((upgrade) => !owned.has(upgrade.id));

  if (pool.length <= 3) {
    return pool
      .map((upgrade) => toInstance(upgrade.id))
      .filter((upgrade): upgrade is UpgradeInstance => upgrade !== null);
  }

  const weightedPool = pool.flatMap((upgrade) => {
    let copies = 1;
    if (upgrade.rarity === "common") copies += 1;
    if (upgrade.tags.some((tag) => unlockedTags.includes(tag))) copies += 1;
    return Array.from({ length: copies }, () => upgrade.id);
  });

  const pickedIds = new Set<string>();
  let safety = 0;
  while (pickedIds.size < 3 && safety < 100) {
    const picked = rng.pick(weightedPool);
    pickedIds.add(picked);
    safety += 1;
  }

  return [...pickedIds]
    .map((id) => toInstance(id))
    .filter((upgrade): upgrade is UpgradeInstance => upgrade !== null);
};
