import { useStatusStore } from "../../store/statusStore";

export default function StatusBar() {
  const { saveState, message } = useStatusStore();
  return (
    <div className="status-bar" aria-live="polite">
      <span className={`status-dot status-${saveState}`} />
      <span>{message}</span>
      <span className="status-spacer" />
      <span>Light It Up v0.3.13 Alpha 17 — Stability & Timeline Pass</span>
    </div>
  );
}
