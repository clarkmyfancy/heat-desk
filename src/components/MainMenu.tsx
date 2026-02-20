import { useGameStore } from "../store/gameStore";

export const MainMenu = () => {
  const startNewRun = useGameStore((state) => state.startNewRun);
  const openMeta = useGameStore((state) => state.openMeta);
  const setHowToOpen = useGameStore((state) => state.setHowToOpen);
  const resetSave = useGameStore((state) => state.resetSave);
  const lastRunSummary = useGameStore((state) => state.lastRunSummary);

  return (
    <div className="menu-screen">
      <section className="panel menu-panel">
        <p className="eyebrow">Auto-Trader Roguelite</p>
        <h1>AI-Run Fund Sim</h1>
        <p className="muted">You set policy and risk. The AI executes each trading week.</p>

        <div className="menu-actions">
          <button className="primary" onClick={() => startNewRun()}>
            New Run
          </button>
          <button onClick={openMeta}>Meta Progression</button>
          <button onClick={() => setHowToOpen(true)}>How To Play</button>
          <button className="danger" onClick={resetSave}>
            Reset Save
          </button>
        </div>

        {lastRunSummary ? (
          <div className="last-run">
            <h4>Last Run</h4>
            <p>
              Outcome: {lastRunSummary.endReason}, RP earned: {lastRunSummary.reputationEarned}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};
