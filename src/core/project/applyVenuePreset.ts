import { useCueStore } from "../../store/cueStore";
import { useLightingStore } from "../../store/lightingStore";
import { usePlaybackStore } from "../../store/playbackStore";
import { useProgrammerStore } from "../../store/programmerStore";
import { useStageStore } from "../../store/stageStore";
import { useVenueStore } from "../../store/venueStore";
import { AUDITORIO_BELGRANO_STAGE, createAuditorioBelgranoRig } from "../../venues/auditorioBelgrano";
import { ESPACIO_AGUIRRE_STAGE, createEspacioAguirreRig } from "../../venues/espacioAguirre";

export function applyAuditorioBelgranoVenue() {
  useVenueStore.getState().setActiveVenueName("AUDITORIO BELGRANO");
  // Keep the Alpha 11.1 safety rule: changing the physical rig must clear
  // every runtime structure that references fixture IDs.
  usePlaybackStore.getState().resetPlayback();
  useProgrammerStore.getState().clearProgrammer();
  useCueStore.getState().replaceCues({ cues: [], activeCueId: null });
  useStageStore.getState().replaceStage(AUDITORIO_BELGRANO_STAGE);
  useLightingStore.getState().replaceLighting(createAuditorioBelgranoRig());
}

export function applyEspacioAguirreVenue() {
  useVenueStore.getState().setActiveVenueName("ESPACIO AGUIRRE");
  // Alpha 16.2: mount the physical venue atomically before adding fixtures.
  // A malformed imported fixture can no longer prevent the stage from opening.
  usePlaybackStore.getState().resetPlayback();
  useProgrammerStore.getState().clearProgrammer();
  useCueStore.getState().replaceCues({ cues: [], activeCueId: null });

  useStageStore.getState().replaceStage(ESPACIO_AGUIRRE_STAGE);
  useLightingStore.getState().replaceLighting({ lights: [], groups: [] });

  const rig = createEspacioAguirreRig();
  const safeLights = rig.lights.filter((light) =>
    Number.isFinite(light.id) &&
    Number.isFinite(light.position.x) &&
    Number.isFinite(light.position.y) &&
    Number.isFinite(light.position.z) &&
    Number.isFinite(light.angle) &&
    Number.isFinite(light.beamAngle) &&
    ["spot", "wash", "beam", "moving"].includes(light.type)
  );
  const safeIds = new Set(safeLights.map((light) => light.id));
  const safeGroups = rig.groups
    .map((group) => ({ ...group, lightIds: group.lightIds.filter((id) => safeIds.has(id)) }))
    .filter((group) => group.lightIds.length > 0);

  // Let React/Three mount the venue first, then attach the validated rig.
  window.setTimeout(() => {
    try {
      useLightingStore.getState().replaceLighting({ lights: safeLights, groups: safeGroups });
    } catch (error) {
      console.error("[Rider Import] Aguirre rig could not be mounted; keeping stage-only venue.", error);
      useLightingStore.getState().replaceLighting({ lights: [], groups: [] });
    }
  }, 120);
}
