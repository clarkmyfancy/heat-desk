import { create } from "zustand";
import { BASE_ASSETS, cloneBaseAssets } from "../engine/content/assets";
import { META_NODES } from "../engine/content/metaNodes";
import { UPGRADE_DEFINITIONS, getUpgradeById } from "../engine/content/upgrades";
import { DEFAULT_POLICY, STARTING_CAPITAL } from "../engine/constants";
import { executeRound } from "../engine/sim/executeRound";
import { createRng, hashSeed } from "../engine/rng";
import {
  LastRunSummary,
  MetaNode,
  MetaProgression,
  PlayerRoundPolicy,
  RunState,
  UpgradeInstance
} from "../engine/types";
import { seededDefault } from "../utils/math";
import { getDefaultMeta, loadSaveBlob, resetSaveBlob, saveMetaAndSettings } from "../utils/storage";

type Screen = "menu" | "run" | "meta";

interface GameStore {
  screen: Screen;
  runState: RunState | null;
  metaProgression: MetaProgression;
  lastRunSummary: LastRunSummary | null;
  theme: "dark" | "light";
  tutorialDismissed: boolean;
  howToOpen: boolean;
  startNewRun: (seed?: number) => void;
  setPolicy: (partialPolicy: Partial<PlayerRoundPolicy>) => void;
  simulateRound: () => void;
  pickUpgrade: (upgradeId: string) => void;
  dismissSummary: () => void;
  loadMeta: () => void;
  buyMetaUpgrade: (nodeId: string) => void;
  resetSave: () => void;
  openMeta: () => void;
  openMenu: () => void;
  setHowToOpen: (open: boolean) => void;
}

const settingsFromStore = (store: Pick<GameStore, "theme" | "tutorialDismissed">) => ({
  theme: store.theme,
  tutorialDismissed: store.tutorialDismissed
});

const toUpgradeInstance = (upgradeId: string): UpgradeInstance | null => {
  const found = getUpgradeById(upgradeId);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    description: found.description,
    tags: [...found.tags],
    effects: [...found.effects]
  };
};

const countPurchases = (meta: MetaProgression, nodeId: string): number =>
  meta.unlockedMetaNodeIds.filter((id) => id === nodeId).length;

const applyMetaNodeEffects = (meta: MetaProgression, node: MetaNode): MetaProgression => {
  const next = {
    ...meta,
    unlockedMetaNodeIds: [...meta.unlockedMetaNodeIds, node.id],
    permanentBonuses: { ...meta.permanentBonuses }
  };

  if (node.effect.type === "startingCapital") {
    next.permanentBonuses.startingCapitalBonus += node.effect.value;
  }
  if (node.effect.type === "startingHeatReduction") {
    next.permanentBonuses.startingHeatReduction += node.effect.value;
  }
  if (node.effect.type === "startingConfidence") {
    next.permanentBonuses.startingConfidenceBonus += node.effect.value;
  }

  return next;
};

const metaUnlockTags = (meta: MetaProgression): string[] => {
  return meta.unlockedMetaNodeIds
    .map((id) => META_NODES.find((node) => node.id === id))
    .filter((node): node is MetaNode => Boolean(node))
    .flatMap((node) => (node.effect.type === "unlockUpgradeTag" ? [node.effect.tag] : []));
};

const hasStartRelic = (meta: MetaProgression): boolean => {
  return meta.unlockedMetaNodeIds.includes("meta-start-relic");
};

const computeRp = (
  summary: LastRunSummary,
  meta: MetaProgression,
  runUpgrades: UpgradeInstance[]
): number => {
  const base = summary.roundsSurvived * 10;
  const navGrowthBonus = Math.max(0, summary.totalReturnPct) * 1.6;
  const lowHeatBonus = Math.max(0, (60 - summary.highestHeat) * 0.8);
  const winBonus = summary.endReason === "win" ? 80 : 0;
  const regulatorPenalty = summary.endReason === "regulator" ? -40 : 0;

  const nodeBonus = meta.unlockedMetaNodeIds
    .map((id) => META_NODES.find((node) => node.id === id))
    .filter((node): node is MetaNode => Boolean(node))
    .reduce((sum, node) => (node.effect.type === "rpBonus" ? sum + node.effect.value : sum), 0);

  const relicBonus = runUpgrades
    .flatMap((upgrade) => upgrade.effects)
    .reduce((sum, effect) => (effect.type === "rpBonusMultiplier" ? sum + effect.value : sum), 0);

  const raw = base + navGrowthBonus + lowHeatBonus + winBonus + regulatorPenalty;
  const scaled = raw * (1 + nodeBonus + relicBonus);
  return Math.max(0, Math.round(scaled));
};

const buildRunSummary = (run: RunState): LastRunSummary => {
  const roundsSurvived = run.history.length;
  const finalNav = run.meters.nav;
  const startingNav = run.history[0]?.navBefore ?? STARTING_CAPITAL;
  const totalReturnPct = ((finalNav - startingNav) / startingNav) * 100;

  const cumulativeHeatChange = run.history.reduce((sum, entry) => sum + entry.meterChanges.heat, 0);
  const startingHeat = run.meters.heat - cumulativeHeatChange;
  let trackedHeat = startingHeat;
  let highestHeat = trackedHeat;
  for (const entry of run.history) {
    trackedHeat += entry.meterChanges.heat;
    highestHeat = Math.max(highestHeat, trackedHeat);
  }

  const byReturn = [...run.history].sort((a, b) => b.portfolioReturnPct - a.portfolioReturnPct);
  const biggestWinningRound = byReturn[0]?.round ?? 1;
  const biggestLosingRound = byReturn[byReturn.length - 1]?.round ?? 1;

  const timeline = run.history.flatMap((item) => item.recapLines.slice(0, 2));

  return {
    endedAtIso: new Date().toISOString(),
    endReason: run.endReason ?? "bankruptcy",
    roundsSurvived,
    finalNav,
    totalReturnPct,
    highestHeat,
    biggestWinningRound,
    biggestLosingRound,
    reputationEarned: 0,
    timeline
  };
};

const createInitialRunState = (seed: number, meta: MetaProgression): RunState => {
  const startingNav = STARTING_CAPITAL + meta.permanentBonuses.startingCapitalBonus;
  const startingHeat = Math.max(0, 0 - meta.permanentBonuses.startingHeatReduction);
  const startingConfidence = Math.min(100, 70 + meta.permanentBonuses.startingConfidenceBonus);

  const starterUpgrades: UpgradeInstance[] = [];
  if (hasStartRelic(meta)) {
    const rng = createRng(hashSeed(seed, 0x11ac));
    const commonPool = UPGRADE_DEFINITIONS.filter((upgrade) => upgrade.rarity === "common");
    const picked = rng.pick(commonPool);
    const upgrade = toUpgradeInstance(picked.id);
    if (upgrade) starterUpgrades.push(upgrade);
  }

  return {
    seed,
    round: 1,
    assets: cloneBaseAssets(),
    meters: {
      nav: startingNav,
      heat: startingHeat,
      investorConfidence: startingConfidence,
      staffLoyalty: 70,
      liquidity: 100
    },
    activeUpgrades: starterUpgrades,
    pendingUpgradeChoices: null,
    currentPolicy: { ...DEFAULT_POLICY },
    history: [],
    isGameOver: false,
    endReason: null,
    upcomingMacroHint: null
  };
};

const initialSave = loadSaveBlob();

export const useGameStore = create<GameStore>((set, get) => ({
  screen: "menu",
  runState: null,
  metaProgression: initialSave.metaProgression ?? getDefaultMeta(),
  lastRunSummary: initialSave.lastRunSummary,
  theme: initialSave.settings.theme,
  tutorialDismissed: initialSave.settings.tutorialDismissed,
  howToOpen: false,

  startNewRun: (seed) => {
    const activeSeed = seed ?? seededDefault();
    const nextRun = createInitialRunState(activeSeed, get().metaProgression);
    set({ runState: nextRun, screen: "run" });
  },

  setPolicy: (partialPolicy) => {
    const runState = get().runState;
    if (!runState || runState.isGameOver) return;
    set({
      runState: {
        ...runState,
        currentPolicy: {
          ...runState.currentPolicy,
          ...partialPolicy
        }
      }
    });
  },

  simulateRound: () => {
    const state = get();
    const run = state.runState;
    if (!run || run.isGameOver || (run.pendingUpgradeChoices?.length ?? 0) > 0) return;

    const unlockedTags = metaUnlockTags(state.metaProgression);
    const { runState: nextRun } = executeRound(run, unlockedTags);

    if (!nextRun.isGameOver) {
      set({ runState: nextRun });
      return;
    }

    const summary = buildRunSummary(nextRun);
    const rp = computeRp(summary, state.metaProgression, nextRun.activeUpgrades);
    const finalizedSummary = { ...summary, reputationEarned: rp };

    const nextMeta: MetaProgression = {
      ...state.metaProgression,
      reputationPoints: state.metaProgression.reputationPoints + rp
    };

    set({
      runState: nextRun,
      metaProgression: nextMeta,
      lastRunSummary: finalizedSummary
    });

    saveMetaAndSettings(nextMeta, settingsFromStore(state), finalizedSummary);
  },

  pickUpgrade: (upgradeId) => {
    const state = get();
    const run = state.runState;
    if (!run || !run.pendingUpgradeChoices || run.isGameOver) return;

    const picked = run.pendingUpgradeChoices.find((upgrade) => upgrade.id === upgradeId);
    if (!picked) return;

    set({
      runState: {
        ...run,
        activeUpgrades: [...run.activeUpgrades, picked],
        pendingUpgradeChoices: null
      }
    });
  },

  dismissSummary: () => {
    set({ screen: "menu", runState: null });
  },

  loadMeta: () => {
    const loaded = loadSaveBlob();
    set({
      metaProgression: loaded.metaProgression,
      theme: loaded.settings.theme,
      tutorialDismissed: loaded.settings.tutorialDismissed,
      lastRunSummary: loaded.lastRunSummary
    });
  },

  buyMetaUpgrade: (nodeId) => {
    const state = get();
    const node = META_NODES.find((item) => item.id === nodeId);
    if (!node) return;

    const purchaseCount = countPurchases(state.metaProgression, node.id);
    if (!node.repeatable && purchaseCount > 0) return;
    if (node.repeatable && node.maxPurchases && purchaseCount >= node.maxPurchases) return;
    if (state.metaProgression.reputationPoints < node.cost) return;

    const upgradedMeta = applyMetaNodeEffects(
      {
        ...state.metaProgression,
        reputationPoints: state.metaProgression.reputationPoints - node.cost
      },
      node
    );

    set({ metaProgression: upgradedMeta });
    saveMetaAndSettings(upgradedMeta, settingsFromStore(state), state.lastRunSummary);
  },

  resetSave: () => {
    resetSaveBlob();
    const metaProgression = getDefaultMeta();
    set({
      runState: null,
      screen: "menu",
      metaProgression,
      lastRunSummary: null,
      theme: "dark",
      tutorialDismissed: false,
      howToOpen: false
    });
  },

  openMeta: () => set({ screen: "meta" }),
  openMenu: () => set({ screen: "menu" }),
  setHowToOpen: (open) => set({ howToOpen: open })
}));

export const assetNameById = (assetId: string): string =>
  BASE_ASSETS.find((asset) => asset.id === assetId)?.name ?? assetId;
