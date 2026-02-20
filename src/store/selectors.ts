import { META_NODES } from "../engine/content/metaNodes";
import { useGameStore } from "./gameStore";

export const useRunState = () => useGameStore((state) => state.runState);
export const useScreen = () => useGameStore((state) => state.screen);
export const useMeta = () => useGameStore((state) => state.metaProgression);

export const useMetaNodesWithState = () => {
  const meta = useGameStore((state) => state.metaProgression);

  return META_NODES.map((node) => {
    const purchasedCount = meta.unlockedMetaNodeIds.filter((id) => id === node.id).length;
    const canAfford = meta.reputationPoints >= node.cost;
    const reachedCap = Boolean(node.maxPurchases && purchasedCount >= node.maxPurchases);
    const alreadyBought = !node.repeatable && purchasedCount > 0;

    return {
      ...node,
      purchasedCount,
      canBuy: canAfford && !reachedCap && !alreadyBought
    };
  });
};
