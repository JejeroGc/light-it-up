import type { Cue, CueFixtureState } from "../../store/cueStore";
import type { LightFixture } from "../../store/lightingStore";

export type ShowCueDefinition = {
  number: number;
  name: string;
  palette: string[];
  intensity?: number;
  fadeDuration?: number;
  delay?: number;
  look?: "full" | "blackout" | "center" | "sides" | "back" | "front" | "split";
  beamAngle?: number;
  note?: string;
};

export type ShowCueSheet = {
  format: "light-it-up-cue-sheet";
  version: 1;
  name: string;
  cues: ShowCueDefinition[];
};

const cloneFixtureBase = (fixture: LightFixture): CueFixtureState => ({
  fixtureId: fixture.id,
  position: { ...fixture.position },
  pan: fixture.pan,
  tilt: fixture.tilt,
  color: fixture.color,
  intensity: fixture.intensity,
  beamAngle: fixture.beamAngle,
  powered: fixture.powered,
  barId: fixture.barId,
  offsetX: fixture.offsetX,
  selectedLightOffsetX: fixture.selectedLightOffsetX,
});

const pickPaletteColor = (fixture: LightFixture, palette: string[]) => {
  if (palette.length === 0) return fixture.color;
  const spatialSeed =
    Math.abs(Math.round(fixture.position.x * 10)) +
    Math.abs(Math.round(fixture.position.z * 10)) +
    fixture.id;
  return palette[spatialSeed % palette.length];
};

const intensityForLook = (
  fixture: LightFixture,
  fixtures: LightFixture[],
  base: number,
  look: ShowCueDefinition["look"]
) => {
  if (look === "blackout") return 0;
  if (fixtures.length <= 1 || !look || look === "full") return base;

  const xs = fixtures.map((item) => item.position.x);
  const zs = fixtures.map((item) => item.position.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const spanX = Math.max(0.001, maxX - minX);
  const spanZ = Math.max(0.001, maxZ - minZ);
  const xNorm = (fixture.position.x - minX) / spanX;
  const zNorm = (fixture.position.z - minZ) / spanZ;
  const sideStrength = Math.abs(xNorm - 0.5) * 2;
  const centerStrength = 1 - sideStrength;

  let weight = 1;
  if (look === "center") weight = 0.25 + centerStrength * 0.9;
  if (look === "sides") weight = 0.2 + sideStrength * 0.95;
  if (look === "front") weight = 0.3 + zNorm * 0.9;
  if (look === "back") weight = 0.3 + (1 - zNorm) * 0.9;
  if (look === "split") weight = fixture.position.x < 0 ? 1 : 0.55;

  return Math.max(0, Math.min(100, base * weight));
};

export const buildCuesFromSheet = (
  sheet: ShowCueSheet,
  fixtures: LightFixture[]
): Cue[] => {
  if (fixtures.length === 0) {
    throw new Error("No hay luminarias en el proyecto actual.");
  }

  return sheet.cues.map((definition, index) => {
    const isBlackout = definition.look === "blackout";
    const baseIntensity = definition.intensity ?? (isBlackout ? 0 : 72);

    const fixtureStates = fixtures.map((fixture) => {
      const base = cloneFixtureBase(fixture);
      const intensity = intensityForLook(
        fixture,
        fixtures,
        baseIntensity,
        definition.look
      );

      return {
        ...base,
        color: isBlackout
          ? base.color
          : pickPaletteColor(fixture, definition.palette),
        intensity,
        powered: !isBlackout && intensity > 0,
        beamAngle: definition.beamAngle ?? base.beamAngle,
      };
    });

    return {
      id: index + 1,
      number: definition.number,
      name: definition.note
        ? `${definition.name} · ${definition.note}`
        : definition.name,
      fadeDuration: Math.max(0, definition.fadeDuration ?? 2),
      delay: Math.max(0, definition.delay ?? 0),
      timelineTime: index * 10,
      fixtureStates,
    };
  });
};

export const parseShowCueSheet = (text: string): ShowCueSheet => {
  const parsed = JSON.parse(text) as Partial<ShowCueSheet>;
  if (
    parsed.format !== "light-it-up-cue-sheet" ||
    parsed.version !== 1 ||
    typeof parsed.name !== "string" ||
    !Array.isArray(parsed.cues)
  ) {
    throw new Error("El archivo no es una hoja de cues compatible con Light It Up.");
  }
  return parsed as ShowCueSheet;
};
