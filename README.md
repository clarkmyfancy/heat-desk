# heat-desk

Web-based **Auto-Trader Roguelite** MVP built with React, TypeScript, Vite, and Zustand.

The player acts as strategist while an AI trader executes weekly portfolio decisions. Runs last 12 rounds, with upgrades each round and meta progression between runs.

## Tech Stack

- React 18
- TypeScript
- Vite
- Zustand
- Framer Motion
- Plain CSS

## Features (MVP)

- 12-round roguelite run loop
- Deterministic seeded simulation engine
- Fictional market with 6 assets and 20 event cards
- AI decision scoring + allocation based on player policy
- Meters: NAV, Heat, Investor Confidence, Staff Loyalty, Liquidity
- Upgrade draft after each round (pick 1 of 3)
- End-of-run summary with RP rewards
- LocalStorage-backed meta progression and settings
- SVG charts (asset sparkline, equity curve, drawdown)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Type-check

```bash
npm run typecheck
```

### 4. Production build

```bash
npm run build
```

## Project Structure

```txt
src/
  app/
  components/
  engine/
    ai/
    content/
    generators/
    sim/
  store/
  styles/
  utils/
```

## Gameplay Loop

1. Start a new run.
2. Choose strategy, risk, sector tilt, policy knobs, and optional special action.
3. Simulate the week.
4. Review recap (contributors, detractors, heat/confidence reasons).
5. Pick one upgrade.
6. Survive to round 12 with positive NAV to win.

## Save Data

Saved in localStorage under:

- `autotrader-roguelite-save-v1`

Persisted:

- Meta progression (RP, permanent bonuses, unlocked nodes)
- Last run summary
- Settings

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run typecheck` - TypeScript check for app sources
- `npm run build` - Type-check and build production bundle
- `npm run preview` - Preview production build
