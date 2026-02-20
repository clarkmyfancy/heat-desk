import { useMetaNodesWithState } from "../store/selectors";
import { useGameStore } from "../store/gameStore";

export const MetaProgressionScreen = () => {
  const meta = useGameStore((state) => state.metaProgression);
  const buyMetaUpgrade = useGameStore((state) => state.buyMetaUpgrade);
  const openMenu = useGameStore((state) => state.openMenu);
  const nodes = useMetaNodesWithState();

  return (
    <div className="screen meta-screen">
      <section className="panel">
        <div className="panel-heading-row">
          <h2>Meta Progression</h2>
          <button onClick={openMenu}>Back</button>
        </div>
        <p className="muted">Reputation Points: {meta.reputationPoints}</p>
      </section>

      <section className="panel">
        <div className="meta-grid">
          {nodes.map((node) => (
            <article key={node.id} className="meta-node">
              <h3>{node.name}</h3>
              <p>{node.description}</p>
              <p className="muted">Cost: {node.cost} RP</p>
              <p className="muted">Purchased: {node.purchasedCount}</p>
              <button disabled={!node.canBuy} onClick={() => buyMetaUpgrade(node.id)}>
                {node.canBuy ? "Buy" : "Locked"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
