import { Meters } from "../types";
import { TOTAL_ROUNDS } from "../constants";

interface RunEndInput {
  meters: Meters;
  round: number;
}

export const checkRunEnd = ({ meters, round }: RunEndInput) => {
  if (meters.nav <= 0) {
    return { isGameOver: true, endReason: "bankruptcy" as const };
  }
  if (meters.heat >= 100) {
    return { isGameOver: true, endReason: "regulator" as const };
  }
  if (meters.investorConfidence <= 0) {
    return { isGameOver: true, endReason: "redemption" as const };
  }
  if (round >= TOTAL_ROUNDS) {
    const endReason: "win" | "bankruptcy" = meters.nav > 0 ? "win" : "bankruptcy";
    return {
      isGameOver: true,
      endReason
    };
  }
  return { isGameOver: false, endReason: null };
};
