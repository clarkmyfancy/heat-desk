import { motion, AnimatePresence } from "framer-motion";
import { UpgradeInstance } from "../engine/types";

interface UpgradeDraftModalProps {
  choices: UpgradeInstance[] | null;
  onPick: (upgradeId: string) => void;
}

export const UpgradeDraftModal = ({ choices, onPick }: UpgradeDraftModalProps) => {
  return (
    <AnimatePresence>
      {choices && choices.length > 0 ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal panel"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
          >
            <h3>Choose 1 Upgrade</h3>
            <div className="upgrade-grid">
              {choices.map((upgrade) => (
                <button key={upgrade.id} className="upgrade-card" onClick={() => onPick(upgrade.id)}>
                  <h4>{upgrade.name}</h4>
                  <p>{upgrade.description}</p>
                  <p className="chip-row">{upgrade.tags.join(" · ")}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
