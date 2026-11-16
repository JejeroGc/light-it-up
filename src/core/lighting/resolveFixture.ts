import type {
  LightFixture,
} from "../../store/lightingStore";

import type {
  ProgrammerValues,
} from "../../store/programmerStore";

export const resolveFixture = (
  fixture: LightFixture,
  programmerValues?: ProgrammerValues
): LightFixture => {
  if (!programmerValues) {
    return fixture;
  }

  const resolvedBeamAngle =
    programmerValues.beamAngle ??
    fixture.beamAngle;

  return {
    ...fixture,

    color:
      programmerValues.color ??
      fixture.color,

    intensity:
      programmerValues.intensity ??
      fixture.intensity,

    pan:
      programmerValues.pan ??
      fixture.pan,

    tilt:
      programmerValues.tilt ??
      fixture.tilt,

    angle: resolvedBeamAngle,

    beamAngle: resolvedBeamAngle,

    position:
      programmerValues.position
        ? {
            ...programmerValues.position,
          }
        : fixture.position,

    powered:
      programmerValues.powered ??
      fixture.powered,

    barId:
      programmerValues.barId !== undefined
        ? programmerValues.barId
        : fixture.barId,

    offsetX:
      programmerValues.offsetX ??
      fixture.offsetX,

    selectedLightOffsetX:
      programmerValues.selectedLightOffsetX ??
      fixture.selectedLightOffsetX,
  };
};