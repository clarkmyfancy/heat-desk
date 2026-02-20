interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowToPlayModal = ({ open, onClose }: HowToPlayModalProps) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <section className="modal panel howto-modal">
        <h3>How To Play</h3>
        <ol>
          <li>Start a new 12-round run.</li>
          <li>Choose strategy, risk, sector tilt, policy knobs, and optional action.</li>
          <li>Simulate the week and review NAV, heat, confidence, and recap logs.</li>
          <li>Pick one upgrade after each round.</li>
          <li>Survive all rounds with positive NAV to win.</li>
        </ol>
        <button className="primary" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
};
