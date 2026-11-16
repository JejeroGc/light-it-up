import { useEffect, useRef } from "react";
import { useCueStore } from "../../store/cueStore";
import { useLightingStore } from "../../store/lightingStore";
import { usePresetStore } from "../../store/presetStore";
import { useProjectStore } from "../../store/projectStore";
import { useStageStore } from "../../store/stageStore";
import { useStatusStore } from "../../store/statusStore";
import { useTimelineStore } from "../../store/timelineStore";

export default function ProjectStatusController() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const markDirty = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        useStatusStore.getState().markDirty();
      }, 30);
    };

    const unsubscribers = [
      useLightingStore.subscribe(markDirty),
      useStageStore.subscribe(markDirty),
      usePresetStore.subscribe(markDirty),
      useCueStore.subscribe(markDirty),
      useTimelineStore.subscribe(markDirty),
      useProjectStore.subscribe(markDirty),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
