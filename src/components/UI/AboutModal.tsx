type AboutModalProps = { onClose: () => void };

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="about-modal" role="dialog" aria-modal="true" aria-label="Acerca de Light It Up" onMouseDown={(e) => e.stopPropagation()}>
        <button className="about-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="about-logo">▮▮▮</div>
        <span className="about-kicker">PROFESSIONAL LIGHTING PREVISUALIZER</span>
        <h2>Light It Up</h2>
        <p>Version 0.1.0 MVP</p>
        <div className="about-divider" />
        <p>Created by <strong>Jerónimo González Calderón</strong></p>
        <p className="about-muted">2026 · Release Candidate</p>
        <button className="about-update" onClick={() => window.alert("No updates available.")}>Check for updates</button>
      </section>
    </div>
  );
}
