import { computeTradeDecisions } from "../ai/allocation";
import { hashSeed, createRng } from "../rng";
import { drawRoundEvents } from "../generators/events";
import { generateMacroRegime } from "../generators/macro";
import { buildSignals } from "../generators/signals";
import { buildRoundRecap } from "./recap";
import { updateMeters } from "./meterUpdates";
import { simulatePortfolioWeek } from "./portfolio";
import { checkRunEnd } from "./runEnd";
import { draftUpgrades } from "./upgrades";
import { MacroRegime, RoundOutcome, RunState, UpgradeInstance } from "../types";

interface ExecuteRoundResult {
  runState: RunState;
  outcome: RoundOutcome;
}

const actionCost = (specialAction: RunState["currentPolicy"]["specialAction"]): number => {
  if (specialAction === "paidResearch") return 10_000;
  if (specialAction === "questionableTip") return 15_000;
  if (specialAction === "hedgeBook") return 5_000;
  if (specialAction === "prSpin") return 8_000;
  return 0;
};

const hasMacroReveal = (upgrades: UpgradeInstance[]): boolean =>
  upgrades.some((upgrade) => upgrade.effects.some((effect) => effect.type === "revealNextMacro"));

export const executeRound = (
  state: RunState,
  unlockedUpgradeTags: string[]
): ExecuteRoundResult => {
  const roundSeed = hashSeed(state.seed, state.round, 0x2f17);
  const rng = createRng(roundSeed);

  const macro = generateMacroRegime(rng);
  const events = drawRoundEvents(rng, state.round, state.currentPolicy.specialAction, macro);
  const signals = buildSignals({
    assets: state.assets,
    events,
    macro,
    policy: state.currentPolicy,
    upgrades: state.activeUpgrades,
    rng
  });

  const decisions = computeTradeDecisions({
    signals,
    policy: state.currentPolicy,
    assets: state.assets,
    meters: state.meters,
    upgrades: state.activeUpgrades
  });

  const navBefore = state.meters.nav;
  const tradingResult = simulatePortfolioWeek({
    assets: state.assets,
    decisions,
    policy: state.currentPolicy,
    macro,
    events,
    meters: state.meters,
    upgrades: state.activeUpgrades,
    rng
  });

  const specialCost = actionCost(state.currentPolicy.specialAction);
  const navAfterCosts = Math.max(0, tradingResult.navAfter - specialCost);

  const meterUpdate = updateMeters({
    meters: state.meters,
    roundResult: {
      portfolioReturnPct: tradingResult.portfolioReturnPct,
      events
    },
    policy: state.currentPolicy,
    round: state.round,
    upgrades: state.activeUpgrades,
    rng
  });

  const nextMeters = {
    ...meterUpdate.nextMeters,
    nav: navAfterCosts
  };

  const recap = buildRoundRecap({
    round: state.round,
    macroRegime: macro,
    events,
    policy: state.currentPolicy,
    decisions,
    portfolioReturnPct: tradingResult.portfolioReturnPct,
    slippagePct: tradingResult.slippagePct,
    transactionCostPct: tradingResult.transactionCostPct,
    assets: state.assets,
    topContributors: tradingResult.topContributors,
    topDetractors: tradingResult.topDetractors,
    meterReasons: meterUpdate.reasons
  });

  const outcome: RoundOutcome = {
    round: state.round,
    macroRegime: macro,
    events,
    signals,
    decisions,
    assetReturns: tradingResult.assetReturns,
    portfolioReturnPct: tradingResult.portfolioReturnPct,
    navBefore,
    navAfter: navAfterCosts,
    meterChanges: meterUpdate.changes,
    recapLines: recap.recapLines,
    topContributors: tradingResult.topContributors,
    topDetractors: tradingResult.topDetractors,
    heatChangeReasons: recap.heatChangeReasons,
    confidenceChangeReasons: recap.confidenceChangeReasons
  };

  const runEnd = checkRunEnd({ meters: nextMeters, round: state.round });
  const nextRound = state.round + 1;
  const revealNext = hasMacroReveal(state.activeUpgrades);

  let upcomingMacroHint: MacroRegime | null | undefined = null;
  if (revealNext && !runEnd.isGameOver) {
    const hintRng = createRng(hashSeed(state.seed, nextRound, 0x93a1));
    upcomingMacroHint = generateMacroRegime(hintRng);
  }

  const draftedChoices = runEnd.isGameOver
    ? []
    : draftUpgrades({
        currentUpgrades: state.activeUpgrades,
        rng,
        unlockedTags: unlockedUpgradeTags
      });
  const pendingUpgradeChoices = draftedChoices.length > 0 ? draftedChoices : null;

  return {
    outcome,
    runState: {
      ...state,
      round: nextRound,
      assets: tradingResult.updatedAssets,
      meters: nextMeters,
      history: [...state.history, outcome],
      pendingUpgradeChoices,
      isGameOver: runEnd.isGameOver,
      endReason: runEnd.endReason,
      upcomingMacroHint
    }
  };
};
