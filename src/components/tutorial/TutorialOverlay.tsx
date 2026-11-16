import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { tutorialSteps } from "./tutorialSteps";

type TutorialOverlayProps = { onClose: () => void };
type TargetRect = { top: number; left: number; width: number; height: number };

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const step = tutorialSteps[stepIndex];
  const isLastStep = stepIndex === tutorialSteps.length - 1;

  useLayoutEffect(() => {
    let frame = 0;
    const updateTarget = () => {
      if (!step.selector) { setTargetRect(null); return; }
      const element = document.querySelector<HTMLElement>(step.selector);
      if (!element) { setTargetRect(null); return; }
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
      frame = window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      });
    };
    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [step.selector]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if ((event.key === "ArrowRight" || event.key === "Enter") && !isLastStep) setStepIndex(v => v + 1);
      if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex(v => v - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLastStep, onClose, stepIndex]);

  const bubbleStyle = getBubbleStyle(targetRect, step.placement);
  const highlightStyle: CSSProperties | undefined = targetRect ? {
    top: targetRect.top - 7, left: targetRect.left - 7,
    width: targetRect.width + 14, height: targetRect.height + 14,
  } : undefined;

  return (
    <div className="tutorial-layer" role="dialog" aria-modal="true" aria-label="Primeros pasos">
      <div className="tutorial-shade" />
      {targetRect && <div className="tutorial-highlight" style={highlightStyle} />}
      <section key={stepIndex} className={`tutorial-bubble tutorial-${step.placement}`} style={bubbleStyle}>
        <button className="tutorial-close" onClick={onClose} aria-label="Cerrar tutorial">×</button>
        <span className="tutorial-eyebrow">{step.eyebrow}</span>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
        {step.tip && <div className="tutorial-tip"><span aria-hidden="true">✦</span>{step.tip}</div>}
        <div className="tutorial-dots" aria-label={`Paso ${stepIndex + 1} de ${tutorialSteps.length}`}>
          {tutorialSteps.map((_, index) => (
            <button key={index} type="button" className={index === stepIndex ? "is-active" : ""}
              aria-label={`Ir al paso ${index + 1}`} onClick={() => setStepIndex(index)} />
          ))}
        </div>
        <div className="tutorial-footer">
          <span className="tutorial-progress">{stepIndex + 1} / {tutorialSteps.length}</span>
          <div className="tutorial-controls">
            {stepIndex > 0 && <button className="tutorial-back" onClick={() => setStepIndex(v => v - 1)}>Atrás</button>}
            <button className="tutorial-next" onClick={() => isLastStep ? onClose() : setStepIndex(v => v + 1)}>
              {isLastStep ? "Empezar a diseñar" : "Siguiente"}
            </button>
          </div>
        </div>
        {targetRect && <span className="tutorial-arrow" aria-hidden="true" />}
      </section>
    </div>
  );
}

function getBubbleStyle(rect: TargetRect | null, placement: string): CSSProperties {
  if (!rect || placement === "center") return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  const margin = 22, bubbleWidth = 380, bubbleHeight = 315, pad = 18;
  let top = rect.top + rect.height / 2 - bubbleHeight / 2;
  let left = rect.left + rect.width + margin;
  if (placement === "left") left = rect.left - bubbleWidth - margin;
  if (placement === "top") { left = rect.left + rect.width / 2 - bubbleWidth / 2; top = rect.top - bubbleHeight - margin; }
  if (placement === "bottom") { left = rect.left + rect.width / 2 - bubbleWidth / 2; top = rect.top + rect.height + margin; }
  top = Math.min(Math.max(pad, top), window.innerHeight - bubbleHeight - pad);
  left = Math.min(Math.max(pad, left), window.innerWidth - bubbleWidth - pad);
  return { top, left };
}
