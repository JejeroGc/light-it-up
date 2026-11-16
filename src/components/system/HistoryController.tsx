import { useEffect } from "react";

import { useStageStore } from "../../store/stageStore";
import { useLightingStore } from "../../store/lightingStore";
import { useProgrammerStore } from "../../store/programmerStore";

import { useHistoryStore } from "../../store/historyStore";
import type { HistorySnapshot } from "../../store/historyStore";

function getSnapshot(): HistorySnapshot {
  const stage = useStageStore.getState();
  const lighting = useLightingStore.getState();
  const programmer = useProgrammerStore.getState();

  return {
    stage: {
      width: stage.width,
      depth: stage.depth,
      height: stage.height,
      bars: JSON.parse(JSON.stringify(stage.bars)),
      selectedBarId: stage.selectedBarId,
    },

    lighting: {
      lights: JSON.parse(JSON.stringify(lighting.lights)),
    },
    programmer: { edits: JSON.parse(JSON.stringify(programmer.edits)) },
  };
}

function applySnapshot(snapshot: HistorySnapshot) {
  const history = useHistoryStore.getState();

  history.setApplying(true);

  useStageStore.setState({
    width: snapshot.stage.width,
    depth: snapshot.stage.depth,
    height: snapshot.stage.height,
    bars: snapshot.stage.bars,
    selectedBarId: snapshot.stage.selectedBarId,
  });

  useLightingStore.setState({
    lights: snapshot.lighting.lights,
  });
  useProgrammerStore.setState({ edits: snapshot.programmer?.edits ?? {} });

  setTimeout(() => {
    useHistoryStore.getState().setApplying(false);
  }, 0);
}

export default function HistoryController() {
  useEffect(() => {
    const history = useHistoryStore.getState();

    history.record(getSnapshot());

    let timeout: number | null = null;

    const scheduleRecord = () => {
      if (useHistoryStore.getState().isApplying) return;

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      timeout = window.setTimeout(() => {
        useHistoryStore.getState().record(getSnapshot());
      }, 250);
    };

    const unsubscribeStage = useStageStore.subscribe(scheduleRecord);

    const unsubscribeLighting =
      useLightingStore.subscribe(scheduleRecord);
    const unsubscribeProgrammer =
      useProgrammerStore.subscribe(scheduleRecord);

    const handleKeyDown = (event: KeyboardEvent) => {
      const isUndo =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "z";

      if (!isUndo) return;

      event.preventDefault();

      const history = useHistoryStore.getState();

      const snapshot = event.shiftKey
        ? history.redo()
        : history.undo();

      if (snapshot) {
        applySnapshot(snapshot);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsubscribeStage();
      unsubscribeLighting();
      unsubscribeProgrammer();

      window.removeEventListener("keydown", handleKeyDown);

      if (timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return null;
}