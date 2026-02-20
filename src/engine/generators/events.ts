import { EVENT_TEMPLATES } from "../content/events";
import { MacroRegime, MarketEvent, RngLike, SpecialAction } from "../types";

const eventWeightForRound = (round: number): number => {
  if (round <= 4) return 0.95;
  if (round <= 8) return 1;
  return 1.1;
};

const visibilityAllowed = (
  visibility: MarketEvent["visibility"],
  specialAction: SpecialAction
): boolean => {
  if (visibility === "public") return true;
  if (visibility === "research") return specialAction === "paidResearch";
  return specialAction === "questionableTip";
};

const drawOneEvent = (
  rng: RngLike,
  round: number,
  specialAction: SpecialAction,
  macro?: MacroRegime,
  usedIds: Set<string> = new Set()
): MarketEvent | null => {
  const candidates = EVENT_TEMPLATES.filter(
    (event) => !usedIds.has(event.id) && visibilityAllowed(event.visibility, specialAction)
  );

  if (!candidates.length) return null;

  const weightedCandidates = candidates.map((event) => {
    const macroWeight = macro ? event.macroWeights?.[macro] ?? 1 : 1;
    const visibilityBias = event.visibility === "questionable" ? 0.75 : 1;
    return {
      event,
      weight: Math.max(0.1, (event.roundWeightBias ?? 1) * eventWeightForRound(round) * macroWeight * visibilityBias)
    };
  });

  const total = weightedCandidates.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = rng.next() * total;

  for (const entry of weightedCandidates) {
    threshold -= entry.weight;
    if (threshold <= 0) {
      usedIds.add(entry.event.id);
      const jitter = (rng.next() - 0.5) * 0.16;
      return {
        id: entry.event.id,
        title: entry.event.title,
        description: entry.event.description,
        visibility: entry.event.visibility,
        affectedSectors: [...entry.event.affectedSectors],
        direction: Math.max(-1, Math.min(1, entry.event.direction + jitter)),
        magnitude: Math.max(0, Math.min(1, entry.event.magnitude + jitter / 2)),
        confidence: Math.max(0.1, Math.min(1, entry.event.confidence + jitter / 2)),
        heatImpact: entry.event.heatImpact
      };
    }
  }

  return null;
};

export const drawRoundEvents = (
  rng: RngLike,
  round: number,
  specialAction: SpecialAction,
  macro?: MacroRegime
): MarketEvent[] => {
  const eventCount = rng.next() < 0.4 ? 2 : 1;
  const used = new Set<string>();
  const events: MarketEvent[] = [];

  for (let index = 0; index < eventCount; index += 1) {
    const event = drawOneEvent(rng, round, specialAction, macro, used);
    if (event) events.push(event);
  }

  return events;
};
