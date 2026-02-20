import { STORAGE_KEY } from "../engine/constants";
import { LastRunSummary, MetaProgression, SaveBlob } from "../engine/types";

const defaultMeta: MetaProgression = {
  reputationPoints: 0,
  unlockedMetaNodeIds: [],
  permanentBonuses: {
    startingCapitalBonus: 0,
    startingHeatReduction: 0,
    startingConfidenceBonus: 0
  }
};

const defaultSettings = {
  theme: "dark" as const,
  tutorialDismissed: false
};

export const getDefaultMeta = (): MetaProgression => ({
  reputationPoints: defaultMeta.reputationPoints,
  unlockedMetaNodeIds: [...defaultMeta.unlockedMetaNodeIds],
  permanentBonuses: { ...defaultMeta.permanentBonuses }
});

export const loadSaveBlob = (): SaveBlob => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        version: 1,
        metaProgression: getDefaultMeta(),
        settings: defaultSettings,
        lastRunSummary: null
      };
    }

    const parsed = JSON.parse(raw) as Partial<SaveBlob>;
    if (parsed.version !== 1) {
      return {
        version: 1,
        metaProgression: getDefaultMeta(),
        settings: defaultSettings,
        lastRunSummary: null
      };
    }

    return {
      version: 1,
      metaProgression: parsed.metaProgression ?? getDefaultMeta(),
      settings: {
        theme: parsed.settings?.theme ?? defaultSettings.theme,
        tutorialDismissed: parsed.settings?.tutorialDismissed ?? defaultSettings.tutorialDismissed
      },
      lastRunSummary: parsed.lastRunSummary ?? null
    };
  } catch {
    return {
      version: 1,
      metaProgression: getDefaultMeta(),
      settings: defaultSettings,
      lastRunSummary: null
    };
  }
};

export const saveMetaAndSettings = (
  metaProgression: MetaProgression,
  settings: SaveBlob["settings"],
  lastRunSummary: LastRunSummary | null
) => {
  const blob: SaveBlob = {
    version: 1,
    metaProgression,
    settings,
    lastRunSummary
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
};

export const resetSaveBlob = () => {
  localStorage.removeItem(STORAGE_KEY);
};
