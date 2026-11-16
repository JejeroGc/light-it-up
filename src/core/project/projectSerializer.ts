import type {
  LightFixture,
  LightGroup,
} from "../../store/lightingStore";

import type {
  Preset,
} from "../../store/presetStore";

import type {
  Cue,
} from "../../store/cueStore";

import type {
  StageBar,
} from "../Stage";

import {
  useProjectStore,
} from "../../store/projectStore";

import {
  useStageStore,
} from "../../store/stageStore";

import {
  useLightingStore,
} from "../../store/lightingStore";

import {
  usePresetStore,
} from "../../store/presetStore";

import {
  useCueStore,
} from "../../store/cueStore";

import {
  useTimelineStore,
} from "../../store/timelineStore";

import {
  usePlaybackStore,
} from "../../store/playbackStore";

import {
  useProgrammerStore,
  type ProgrammerValues,
} from "../../store/programmerStore";

import { useEffectStore, type LightingEffect } from "../../store/effectStore";

import {
  rememberRecentProject,
} from "./recentProjects";

export const PROJECT_FILE_VERSION = 2;

export type LightItUpProjectFile = {
  format: "light-it-up";
  version: number;

  project: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };

  stage: {
    width: number;
    depth: number;
    height: number;
    bars: StageBar[];
  };

  lighting: {
    fixtures: LightFixture[];
    groups: LightGroup[];
  };

  presets: Preset[];

  cues: {
    items: Cue[];
    activeCueId: number | null;
  };

  timeline: {
    duration: number;
    zoom: number;
  };

  /*
   * v2: conserva los cambios aún presentes en PROGRAMMER para que
   * Guardar/Abrir reconstruya exactamente el estado visual actual.
   * Es opcional para mantener compatibilidad con proyectos v1.
   */
  programmer?: {
    edits: Record<number, ProgrammerValues>;
  };

  /* v2: también persiste los efectos creados en Alpha 9. */
  effects?: LightingEffect[];
};

const cloneFixtures = (
  fixtures: LightFixture[]
): LightFixture[] =>
  fixtures.map((fixture) => ({
    ...fixture,
    position: {
      ...fixture.position,
    },
  }));

const cloneGroups = (
  groups: LightGroup[]
): LightGroup[] =>
  groups.map((group) => ({
    ...group,
    lightIds: [...group.lightIds],
  }));

const cloneBars = (
  bars: StageBar[]
): StageBar[] =>
  bars.map((bar) => ({
    ...bar,
  }));

const clonePresets = (
  presets: Preset[]
): Preset[] =>
  presets.map((preset) => ({
    ...preset,
  }));


const cloneProgrammerEdits = (
  edits: Record<number, ProgrammerValues>
): Record<number, ProgrammerValues> =>
  Object.fromEntries(
    Object.entries(edits).map(([id, values]) => [
      Number(id),
      {
        ...values,
        position: values.position
          ? { ...values.position }
          : undefined,
      },
    ])
  ) as Record<number, ProgrammerValues>;

const cloneEffects = (
  effects: LightingEffect[]
): LightingEffect[] =>
  effects.map((effect) => ({
    ...effect,
    fixtureIds: [...effect.fixtureIds],
  }));

const cloneCues = (
  cues: Cue[]
): Cue[] =>
  cues.map((cue) => ({
    ...cue,
    fixtureStates:
      cue.fixtureStates.map(
        (fixtureState) => ({
          ...fixtureState,
          position: {
            ...fixtureState.position,
          },
        })
      ),
  }));

export const createProjectSnapshot =
  (): LightItUpProjectFile => {
    const projectState =
      useProjectStore.getState();

    const stageState =
      useStageStore.getState();

    const lightingState =
      useLightingStore.getState();

    const presetState =
      usePresetStore.getState();

    const cueState =
      useCueStore.getState();

    const timelineState =
      useTimelineStore.getState();

    const programmerState =
      useProgrammerStore.getState();

    const effectState =
      useEffectStore.getState();

    const now =
      new Date().toISOString();

    return {
      format: "light-it-up",
      version:
        PROJECT_FILE_VERSION,

      project: {
        id:
          projectState.project.id,
        name:
          projectState.project.name,
        createdAt:
          projectState.project
            .createdAt,
        updatedAt: now,
      },

      stage: {
        width: stageState.width,
        depth: stageState.depth,
        height: stageState.height,
        bars:
          cloneBars(
            stageState.bars
          ),
      },

      lighting: {
        fixtures:
          cloneFixtures(
            lightingState.lights
          ),
        groups:
          cloneGroups(
            lightingState.groups
          ),
      },

      presets:
        clonePresets(
          presetState.presets
        ),

      cues: {
        items:
          cloneCues(
            cueState.cues
          ),
        activeCueId:
          cueState.activeCueId,
      },

      timeline: {
        duration:
          timelineState.duration,
        zoom:
          timelineState.zoom,
      },

      programmer: {
        edits: cloneProgrammerEdits(
          programmerState.edits
        ),
      },

      effects: cloneEffects(
        effectState.effects
      ),
    };
  };

export const serializeProject = (
  project: LightItUpProjectFile
): string =>
  JSON.stringify(
    project,
    null,
    2
  );

const createSafeFileName = (
  projectName: string
) => {
  const safeName =
    projectName
      .trim()
      .replace(
        /[<>:"/\\|?*\u0000-\u001F]/g,
        "-"
      )
      .replace(/\s+/g, " ");

  return safeName ||
    "proyecto-sin-titulo";
};


const createDefaultStage = () => ({
  width: 12,
  depth: 10,
  height: 6,
  bars: [
    { id: 1, name: "LX 1", x: 0, y: 5.6, z: 2, width: 12 },
    { id: 2, name: "LX 2", x: 0, y: 5.6, z: -1.5, width: 12 },
    { id: 3, name: "LX 3", x: 0, y: 5.6, z: -5, width: 12 },
  ],
});

export const createNewProject = () => {
  const stage = createDefaultStage();
  const now = new Date().toISOString();

  usePlaybackStore.getState().resetPlayback();
  useProgrammerStore.getState().clearProgrammer();
  useEffectStore.getState().clearEffects();
  useStageStore.getState().replaceStage(stage);
  useLightingStore.getState().replaceLighting({ lights: [], groups: [] });
  usePresetStore.getState().replacePresets([]);
  useCueStore.getState().replaceCues({ cues: [], activeCueId: null });
  useTimelineStore.getState().replaceTimeline({ duration: 30, zoom: 24 });

  useProjectStore.getState().replaceProject({
    id: crypto.randomUUID(),
    name: "Proyecto sin título",
    version: String(PROJECT_FILE_VERSION),
    createdAt: now,
    updatedAt: now,
    stage,
    fixtures: [],
  });
};

export const saveProjectToFile =
  () => {
    const project =
      createProjectSnapshot();

    const json =
      serializeProject(project);

    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `${createSafeFileName(
        project.project.name
      )}.lightitup`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Chrome puede comenzar a leer el Blob de forma asíncrona.
    // Revocar la URL inmediatamente después de click() puede producir
    // descargas incompletas en algunos entornos.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    rememberRecentProject(project);

    return project;
  };

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const isFiniteNumber = (
  value: unknown
): value is number =>
  typeof value === "number" &&
  Number.isFinite(value);

const isString = (
  value: unknown
): value is string =>
  typeof value === "string";

const isNullableNumber = (
  value: unknown
): value is number | null =>
  value === null ||
  isFiniteNumber(value);

function validateProjectFile(
  value: unknown
): asserts value is LightItUpProjectFile {
  if (!isRecord(value)) {
    throw new Error(
      "El archivo no contiene un proyecto válido."
    );
  }

  if (value.format !== "light-it-up") {
    throw new Error(
      "El archivo no pertenece a Light It Up."
    );
  }

  if (
    !isFiniteNumber(value.version) ||
    value.version >
      PROJECT_FILE_VERSION
  ) {
    throw new Error(
      "La versión del proyecto no es compatible con esta versión de Light It Up."
    );
  }

  if (
    !isRecord(value.project) ||
    !isString(value.project.id) ||
    !isString(value.project.name) ||
    !isString(value.project.createdAt) ||
    !isString(value.project.updatedAt)
  ) {
    throw new Error(
      "La información general del proyecto está dañada."
    );
  }

  if (
    !isRecord(value.stage) ||
    !isFiniteNumber(value.stage.width) ||
    !isFiniteNumber(value.stage.depth) ||
    !isFiniteNumber(value.stage.height) ||
    !Array.isArray(value.stage.bars)
  ) {
    throw new Error(
      "La información del escenario está dañada."
    );
  }

  if (
    !isRecord(value.lighting) ||
    !Array.isArray(
      value.lighting.fixtures
    ) ||
    !Array.isArray(
      value.lighting.groups
    )
  ) {
    throw new Error(
      "La información de luminarias está dañada."
    );
  }

  if (!Array.isArray(value.presets)) {
    throw new Error(
      "La información de presets está dañada."
    );
  }

  if (
    !isRecord(value.cues) ||
    !Array.isArray(value.cues.items) ||
    !isNullableNumber(
      value.cues.activeCueId
    )
  ) {
    throw new Error(
      "La información de cues está dañada."
    );
  }

  if (
    !isRecord(value.timeline) ||
    !isFiniteNumber(
      value.timeline.duration
    ) ||
    !isFiniteNumber(
      value.timeline.zoom
    )
  ) {
    throw new Error(
      "La información del Timeline está dañada."
    );
  }

  if (
    value.programmer !== undefined &&
    (!isRecord(value.programmer) ||
      !isRecord(value.programmer.edits))
  ) {
    throw new Error(
      "La información del Programmer está dañada."
    );
  }

  if (
    value.effects !== undefined &&
    !Array.isArray(value.effects)
  ) {
    throw new Error(
      "La información de efectos está dañada."
    );
  }
}

export const parseProjectFile = (
  text: string
): LightItUpProjectFile => {
  let parsed: unknown;

  // Tolera BOM y caracteres NUL accidentales que algunos navegadores/
  // sistemas pueden introducir al manipular archivos descargados.
  const normalizedText = text
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .trim();

  try {
    parsed = JSON.parse(normalizedText);
  } catch {
    // Recuperación defensiva: si el archivo contiene texto extra alrededor
    // del JSON, intentamos leer únicamente el objeto Light It Up.
    const firstBrace = normalizedText.indexOf("{");
    const lastBrace = normalizedText.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(normalizedText.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new Error("El archivo no contiene JSON válido.");
      }
    } else {
      throw new Error("El archivo no contiene JSON válido.");
    }
  }

  validateProjectFile(parsed);

  return parsed;
};

export const applyProjectSnapshot = (
  project: LightItUpProjectFile
): LightItUpProjectFile => {
    const stage = {
      width: project.stage.width,
      depth: project.stage.depth,
      height: project.stage.height,
      bars:
        cloneBars(
          project.stage.bars
        ),
    };

    const fixtures =
      cloneFixtures(
        project.lighting.fixtures
      );

    usePlaybackStore
      .getState()
      .resetPlayback();

    useProgrammerStore
      .getState()
      .clearProgrammer();

    useEffectStore
      .getState()
      .clearEffects();

    useStageStore
      .getState()
      .replaceStage(stage);

    useLightingStore
      .getState()
      .replaceLighting({
        lights: fixtures,
        groups:
          cloneGroups(
            project.lighting.groups
          ),
      });

    usePresetStore
      .getState()
      .replacePresets(
        clonePresets(
          project.presets
        )
      );

    useCueStore
      .getState()
      .replaceCues({
        cues:
          cloneCues(
            project.cues.items
          ),
        activeCueId:
          project.cues.activeCueId,
      });

    useTimelineStore
      .getState()
      .replaceTimeline({
        duration:
          project.timeline.duration,
        zoom:
          project.timeline.zoom,
      });

    useProjectStore
      .getState()
      .replaceProject({
        id: project.project.id,
        name: project.project.name,
        version:
          String(project.version),
        createdAt:
          project.project.createdAt,
        updatedAt:
          project.project.updatedAt,
        stage,
        fixtures:
          fixtures.map(
            (fixture) => ({
              id: fixture.id,
              name: fixture.name,
              type: "spot",
              universe:
                fixture.universe,
              address:
                fixture.address,
              channel:
                fixture.channel,
              barId:
                fixture.barId,
              offsetX:
                fixture.offsetX,
              position: {
                ...fixture.position,
              },
              color:
                fixture.color,
              intensity:
                fixture.intensity,
              beamAngle:
                fixture.beamAngle,
            })
          ),
      });

    const activeCue =
      project.cues.items.find(
        (cue) =>
          cue.id ===
          project.cues.activeCueId
      );

    if (activeCue) {
      useLightingStore
        .getState()
        .applyCueFixtureStates(
          activeCue.fixtureStates
        );

      usePlaybackStore
        .getState()
        .setLiveCue(
          activeCue.id
        );
    }

    /*
     * IMPORTANTE: se restaura después de la Cue LIVE. El Programmer
     * tiene prioridad sobre la cue, igual que antes de guardar.
     */
    useProgrammerStore.setState({
      edits: cloneProgrammerEdits(
        project.programmer?.edits ?? {}
      ),
    });

    useEffectStore.setState({
      effects: cloneEffects(
        project.effects ?? []
      ),
    });

    rememberRecentProject(project);

    return project;
  };


export const loadProjectFromFile = async (
  file: File
): Promise<LightItUpProjectFile> => {
  const text = await file.text();
  const project = parseProjectFile(text);
  return applyProjectSnapshot(project);
};
