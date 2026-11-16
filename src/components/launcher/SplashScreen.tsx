import { useEffect, useState } from "react";

type SplashScreenProps = {
  onDone: () => void;
};

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const steps = [12, 31, 57, 79, 94, 100];
    const timers = steps.map((value, index) =>
      window.setTimeout(() => setProgress(value), 180 + index * 220)
    );

    const leaveTimer = window.setTimeout(() => setLeaving(true), 1580);
    const doneTimer = window.setTimeout(onDone, 1980);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`splash-screen ${leaving ? "splash-screen-leaving" : ""}`}>
      <div className="splash-glow" aria-hidden="true" />

      <div className="splash-brand" aria-label="Light It Up">
        <div className="splash-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <h1>LIGHT IT UP</h1>
        <p>Professional Lighting Previsualizer</p>
      </div>

      <div className="splash-loader" role="status" aria-live="polite">
        <div className="splash-loader-track">
          <div
            className="splash-loader-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="splash-loader-meta">
          <span>Initializing engine</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
