import { RngLike } from "./types";

const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 2 ** 32;

export const createRng = (seed: number): RngLike => {
  let state = seed >>> 0;

  const next = (): number => {
    state = (LCG_A * state + LCG_C) >>> 0;
    return state / LCG_M;
  };

  return {
    next,
    nextInt: (min: number, max: number): number => {
      const low = Math.ceil(Math.min(min, max));
      const high = Math.floor(Math.max(min, max));
      return Math.floor(next() * (high - low + 1)) + low;
    },
    pick: <T>(items: T[]): T => {
      return items[Math.floor(next() * items.length)] as T;
    },
    shuffle: <T>(items: T[]): T[] => {
      const nextItems = [...items];
      for (let i = nextItems.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [nextItems[i], nextItems[j]] = [nextItems[j], nextItems[i]];
      }
      return nextItems;
    }
  };
};

export const hashSeed = (baseSeed: number, ...parts: number[]): number => {
  let hashed = baseSeed >>> 0;
  for (const part of parts) {
    hashed ^= part + 0x9e3779b9 + (hashed << 6) + (hashed >> 2);
    hashed >>>= 0;
  }
  return hashed;
};
