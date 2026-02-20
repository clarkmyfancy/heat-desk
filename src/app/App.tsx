import { MainMenu } from "../components/MainMenu";
import { MetaProgressionScreen } from "../components/MetaProgressionScreen";
import { TopBar } from "../components/TopBar";
import { MarketSnapshotPanel } from "../components/MarketSnapshotPanel";
import { StrategyControls } from "../components/StrategyControls";
import { PolicyControls } from "../components/PolicyControls";
import { SpecialActionSelector } from "../components/SpecialActionSelector";
import { EventFeed } from "../components/EventFeed";
import { TradeRecapPanel } from "../components/TradeRecapPanel";
import { EquityCurveChart } from "../components/EquityCurveChart";
import { UpgradeDraftModal } from "../components/UpgradeDraftModal";
import { RunSummaryModal } from "../components/RunSummaryModal";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { useGameStore } from "../store/gameStore";

const RunScreen = () => {
  const run = useGameStore((state) => state.runState);
  const setPolicy = useGameStore((state) => state.setPolicy);
  const simulateRound = useGameStore((state) => state.simulateRound);
  const pickUpgrade = useGameStore((state) => state.pickUpgrade);
  const dismissSummary = useGameStore((state) => state.dismissSummary);
  const lastRunSummary = useGameStore((state) => state.lastRunSummary);

  if (!run) return null;

  const latestOutcome = run.history[run.history.length - 1] ?? null;

  return (
    <div className="run-screen">
      <TopBar run={run} />
      <div className="run-grid">
        <div className="left-column">
          <MarketSnapshotPanel run={run} />
        </div>

        <div className="center-column">
          <EquityCurveChart history={run.history} />
          <EventFeed latestOutcome={latestOutcome} />
          <TradeRecapPanel latestOutcome={latestOutcome} assets={run.assets} />
        </div>

        <div className="right-column">
          <StrategyControls
            policy={run.currentPolicy}
            onChange={setPolicy}
            onSimulate={simulateRound}
            disabled={(run.pendingUpgradeChoices?.length ?? 0) > 0 || run.isGameOver}
          />
          <PolicyControls policy={run.currentPolicy} onChange={setPolicy} />
          <SpecialActionSelector
            value={run.currentPolicy.specialAction}
            onChange={(specialAction) => setPolicy({ specialAction })}
          />
        </div>
      </div>

      <UpgradeDraftModal choices={run.pendingUpgradeChoices} onPick={pickUpgrade} />
      <RunSummaryModal run={run} summary={lastRunSummary} onClose={dismissSummary} />
    </div>
  );
};

export const App = () => {
  const screen = useGameStore((state) => state.screen);
  const howToOpen = useGameStore((state) => state.howToOpen);
  const setHowToOpen = useGameStore((state) => state.setHowToOpen);

  return (
    <main className="app-shell">
      {screen === "menu" ? <MainMenu /> : null}
      {screen === "meta" ? <MetaProgressionScreen /> : null}
      {screen === "run" ? <RunScreen /> : null}

      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />
    </main>
  );
};
