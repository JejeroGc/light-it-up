import { create } from "zustand";

import type {
  CueFixtureState,
} from "./cueStore";

export type FixtureType =
  | "spot"
  | "wash"
  | "beam"
  | "moving";

export type LightFixture = {
  id: number;

  name: string;
  type: FixtureType;

  /* Optional real-world fixture identity/profile metadata. */
  profileId?: string;
  manufacturer?: string;
  model?: string;

  position: {
    x: number;
    y: number;
    z: number;
  };

  color: string;
  intensity: number;

  /*
   * Apertura del haz.
   */
  angle: number;
  beamAngle: number;

  /*
   * Movimiento.
   */
  pan: number;
  tilt: number;

  barId: number | null;
  offsetX: number;
  selectedLightOffsetX: number;

  universe: number;
  address: number;
  channel: number;

  powered: boolean;
};

export type LightGroup = {
  id: number;
  name: string;
  lightIds: number[];
};

type ReplaceLightingData = {
  lights: LightFixture[];
  groups: LightGroup[];
};

type LightingStore = {
  lights: LightFixture[];

  /*
   * Foco principal de la selección.
   * Es el que utiliza el Transform Gizmo.
   */
  selectedLightId: number | null;

  /*
   * Todos los focos seleccionados.
   */
  selectedLightIds: number[];

  hoveredLightId: number | null;

  /*
   * Grupos creados por el usuario.
   */
  groups: LightGroup[];

  /*
   * Reemplaza todas las luminarias
   * y grupos al abrir un proyecto.
   */
  replaceLighting: (
    lighting: ReplaceLightingData
  ) => void;

  addLight: () => void;

  duplicateLight: (
    id: number
  ) => void;

  duplicateSelectedLights: () => void;

  copySelectedLights: () => void;

  pasteLights: () => void;

  removeLight: (
    id: number
  ) => void;

  removeSelectedLights: () => void;

  /*
   * additive = true:
   * agrega o quita el foco de la selección.
   */
  selectLight: (
    id: number | null,
    additive?: boolean
  ) => void;

  clearLightSelection: () => void;

  selectLights: (ids: number[], additive?: boolean) => void;

  selectAllLights: () => void;

  setHoveredLight: (
    id: number | null,
    ...args: unknown[]
  ) => void;

  updateLight: (
    id: number,
    values:
      | Partial<LightFixture>
      | null,
    ...args: unknown[]
  ) => void;

  updateLightPosition: (
    id: number,
    axisOrPosition:
      | "x"
      | "y"
      | "z"
      | {
          x: number;
          y: number;
          z: number;
        },
    value?: number
  ) => void;

  moveLight: (
    id: number,
    position: {
      x: number;
      y: number;
      z: number;
    },
    ...args: unknown[]
  ) => void;

  setName: (
    id: number,
    name: string,
    ...args: unknown[]
  ) => void;

  setColor: (
    id: number,
    color: string,
    ...args: unknown[]
  ) => void;

  setIntensity: (
    id: number,
    intensity: number,
    ...args: unknown[]
  ) => void;

  setAngle: (
    id: number,
    angle: number,
    ...args: unknown[]
  ) => void;

  setBeamAngle: (
    id: number,
    beamAngle: number,
    ...args: unknown[]
  ) => void;

  setPan: (
    id: number,
    pan: number,
    ...args: unknown[]
  ) => void;

  setTilt: (
    id: number,
    tilt: number,
    ...args: unknown[]
  ) => void;

  toggleLightPower: (
    id: number,
    ...args: unknown[]
  ) => void;

  /*
   * Edición múltiple.
   */
  setSelectedLightsColor: (
    color: string
  ) => void;

  setSelectedLightsIntensity: (
    intensity: number
  ) => void;

  setSelectedLightsBeamAngle: (
    beamAngle: number
  ) => void;

  setSelectedLightsPosition: (
    pan: number,
    tilt: number
  ) => void;

  setSelectedLightsPower: (
    powered: boolean
  ) => void;

  applyCueFixtureStates: (
    fixtureStates:
      CueFixtureState[]
  ) => void;

  attachToBar: (
    id: number,
    barId: number,
    offsetX?: number
  ) => void;

  snapLightToBar: (
    id: number,
    barId: number,
    ...args: unknown[]
  ) => void;

  /*
   * Grupos.
   */
  createGroupFromSelection: (
    name?: string
  ) => void;

  selectGroup: (
    groupId: number
  ) => void;

  renameGroup: (
    groupId: number,
    name: string
  ) => void;

  removeGroup: (
    groupId: number
  ) => void;
};

export const createDefaultLight = (
  id: number
): LightFixture => ({
  id,

  name: `Foco ${id}`,
  type: "spot",

  position: {
    x: 0,
    y: 5.5,
    z: 2,
  },

  color: "#fff2d6",
  intensity: 80,

  angle: 0.35,
  beamAngle: 0.35,

  pan: 0,
  tilt: 0,

  barId: null,

  offsetX: 0,
  selectedLightOffsetX: 0,

  universe: 1,
  address: id,
  channel: id,

  powered: true,
});

export const defaultLights:
  LightFixture[] = [
    createDefaultLight(1),
  ];

let lightClipboard: LightFixture[] = [];
let clipboardPasteCount = 0;

export const useLightingStore =
  create<LightingStore>((set) => ({
    lights: defaultLights,

    selectedLightId: null,
    selectedLightIds: [],

    hoveredLightId: null,

    groups: [],

    replaceLighting: (
      lighting
    ) =>
      set({
        lights:
          lighting.lights.map(
            (light) => ({
              ...light,

              position: {
                ...light.position,
              },
            })
          ),

        groups:
          lighting.groups.map(
            (group) => ({
              ...group,

              lightIds: [
                ...group.lightIds,
              ],
            })
          ),

        /*
         * Estos estados son temporales
         * y no se restauran.
         */
        selectedLightId: null,
        selectedLightIds: [],
        hoveredLightId: null,
      }),

    addLight: () =>
      set((state) => {
        const newId =
          state.lights.length > 0
            ? Math.max(
                ...state.lights.map(
                  (light) =>
                    light.id
                )
              ) + 1
            : 1;

        return {
          lights: [
            ...state.lights,
            createDefaultLight(
              newId
            ),
          ],

          selectedLightId:
            newId,

          selectedLightIds: [
            newId,
          ],
        };
      }),

    duplicateLight: (id) =>
      set((state) => {
        const original =
          state.lights.find(
            (light) =>
              light.id === id
          );

        if (!original) {
          return state;
        }

        const newId =
          state.lights.length > 0
            ? Math.max(
                ...state.lights.map(
                  (light) =>
                    light.id
                )
              ) + 1
            : 1;

        const duplicated:
          LightFixture = {
            ...original,

            id: newId,

            name:
              `${original.name} copia`,

            position: {
              x:
                original.position.x +
                0.5,

              y:
                original.position.y,

              z:
                original.position.z,
            },

            offsetX:
              original.offsetX +
              0.5,

            selectedLightOffsetX:
              original
                .selectedLightOffsetX +
              0.5,

            address: newId,
            channel: newId,
          };

        return {
          lights: [
            ...state.lights,
            duplicated,
          ],

          selectedLightId:
            newId,

          selectedLightIds: [
            newId,
          ],
        };
      }),

    copySelectedLights: () => {
      const state = useLightingStore.getState();
      const selected = state.lights.filter((light) => state.selectedLightIds.includes(light.id));
      if (selected.length === 0) return;
      lightClipboard = selected.map((light) => JSON.parse(JSON.stringify(light)));
      clipboardPasteCount = 0;
    },

    pasteLights: () =>
      set((state) => {
        if (lightClipboard.length === 0) return state;

        let nextId = state.lights.length > 0
          ? Math.max(...state.lights.map((light) => light.id)) + 1
          : 1;
        clipboardPasteCount += 1;
        const delta = 0.5 * clipboardPasteCount;
        const pasted = lightClipboard.map((original) => {
          const copyId = nextId++;
          return {
            ...JSON.parse(JSON.stringify(original)),
            id: copyId,
            name: `${original.name} copia`,
            position: { ...original.position, x: original.position.x + delta },
            offsetX: original.offsetX + delta,
            selectedLightOffsetX: original.selectedLightOffsetX + delta,
            address: copyId,
            channel: copyId,
          };
        });
        const pastedIds = pasted.map((light) => light.id);
        return {
          lights: [...state.lights, ...pasted],
          selectedLightIds: pastedIds,
          selectedLightId: pastedIds.at(-1) ?? null,
        };
      }),

    duplicateSelectedLights: () =>
      set((state) => {
        if (state.selectedLightIds.length === 0) {
          return state;
        }

        const selected = state.lights.filter((light) =>
          state.selectedLightIds.includes(light.id)
        );

        if (selected.length === 0) {
          return state;
        }

        let nextId =
          state.lights.length > 0
            ? Math.max(...state.lights.map((light) => light.id)) + 1
            : 1;

        const duplicated = selected.map((original) => {
          const copyId = nextId++;

          return {
            ...original,
            id: copyId,
            name: `${original.name} copia`,
            position: {
              x: original.position.x + 0.5,
              y: original.position.y,
              z: original.position.z,
            },
            offsetX: original.offsetX + 0.5,
            selectedLightOffsetX: original.selectedLightOffsetX + 0.5,
            address: copyId,
            channel: copyId,
          };
        });

        const duplicatedIds = duplicated.map((light) => light.id);

        return {
          lights: [...state.lights, ...duplicated],
          selectedLightId: duplicatedIds.at(-1) ?? null,
          selectedLightIds: duplicatedIds,
        };
      }),

    removeLight: (id) =>
      set((state) => {
        const selectedLightIds =
          state.selectedLightIds
            .filter(
              (lightId) =>
                lightId !== id
            );

        const selectedLightId =
          state.selectedLightId ===
          id
            ? selectedLightIds[
                selectedLightIds
                  .length - 1
              ] ?? null
            : state.selectedLightId;

        const groups =
          state.groups
            .map((group) => ({
              ...group,

              lightIds:
                group.lightIds
                  .filter(
                    (lightId) =>
                      lightId !== id
                  ),
            }))
            .filter(
              (group) =>
                group.lightIds
                  .length > 0
            );

        return {
          lights:
            state.lights.filter(
              (light) =>
                light.id !== id
            ),

          selectedLightId,
          selectedLightIds,

          hoveredLightId:
            state
              .hoveredLightId ===
            id
              ? null
              : state
                  .hoveredLightId,

          groups,
        };
      }),

    removeSelectedLights: () =>
      set((state) => {
        if (
          state.selectedLightIds
            .length === 0
        ) {
          return state;
        }

        const selectedIds =
          new Set(
            state
              .selectedLightIds
          );

        const groups =
          state.groups
            .map((group) => ({
              ...group,

              lightIds:
                group.lightIds
                  .filter(
                    (lightId) =>
                      !selectedIds.has(
                        lightId
                      )
                  ),
            }))
            .filter(
              (group) =>
                group.lightIds
                  .length > 0
            );

        return {
          lights:
            state.lights.filter(
              (light) =>
                !selectedIds.has(
                  light.id
                )
            ),

          selectedLightId:
            null,

          selectedLightIds: [],

          hoveredLightId:
            null,

          groups,
        };
      }),

    selectLight: (
      id,
      additive = false
    ) =>
      set((state) => {
        if (id === null) {
          return {
            selectedLightId:
              null,

            selectedLightIds:
              [],
          };
        }

        if (!additive) {
          return {
            selectedLightId:
              id,

            selectedLightIds: [
              id,
            ],
          };
        }

        const alreadySelected =
          state.selectedLightIds
            .includes(id);

        if (
          alreadySelected
        ) {
          const selectedLightIds =
            state.selectedLightIds
              .filter(
                (lightId) =>
                  lightId !== id
              );

          return {
            selectedLightIds,

            selectedLightId:
              state
                .selectedLightId ===
              id
                ? selectedLightIds[
                    selectedLightIds
                      .length - 1
                  ] ?? null
                : state
                    .selectedLightId,
          };
        }

        return {
          selectedLightIds: [
            ...state
              .selectedLightIds,
            id,
          ],

          selectedLightId: id,
        };
      }),

    clearLightSelection: () =>
      set({
        selectedLightId:
          null,

        selectedLightIds:
          [],
      }),

    selectLights: (ids, additive = false) =>
      set((state) => {
        const next = additive
          ? Array.from(new Set([...state.selectedLightIds, ...ids]))
          : ids;

        return {
          selectedLightIds: next,
          selectedLightId: next[next.length - 1] ?? null,
        };
      }),

    selectAllLights: () =>
      set((state) => ({
        selectedLightIds: state.lights.map((light) => light.id),
        selectedLightId: state.lights.at(-1)?.id ?? null,
      })),

    setHoveredLight: (id) =>
      set({
        hoveredLightId:
          id,
      }),

    updateLight: (
      id,
      values
    ) =>
      set((state) => {
        if (!values) {
          return state;
        }

        return {
          lights:
            state.lights.map(
              (light) => {
                if (
                  light.id !== id
                ) {
                  return light;
                }

                const updated:
                  LightFixture = {
                    ...light,
                    ...values,

                    position:
                      values.position
                        ? {
                            ...light
                              .position,

                            ...values
                              .position,
                          }
                        : light
                            .position,
                  };

                if (
                  values.angle !==
                  undefined
                ) {
                  updated.beamAngle =
                    values.angle;
                }

                if (
                  values
                    .beamAngle !==
                  undefined
                ) {
                  updated.angle =
                    values
                      .beamAngle;
                }

                if (
                  values.position !==
                  undefined
                ) {
                  updated.offsetX =
                    updated
                      .position.x;

                  updated
                    .selectedLightOffsetX =
                    updated
                      .position.x;
                }

                return updated;
              }
            ),
        };
      }),

    updateLightPosition: (
      id,
      axisOrPosition,
      value
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) => {
              if (
                light.id !== id
              ) {
                return light;
              }

              if (
                typeof axisOrPosition ===
                "object"
              ) {
                return {
                  ...light,

                  position: {
                    ...axisOrPosition,
                  },

                  offsetX:
                    axisOrPosition.x,

                  selectedLightOffsetX:
                    axisOrPosition.x,
                };
              }

              const newPosition = {
                ...light.position,

                [axisOrPosition]:
                  value ??
                  light.position[
                    axisOrPosition
                  ],
              };

              return {
                ...light,

                position:
                  newPosition,

                offsetX:
                  newPosition.x,

                selectedLightOffsetX:
                  newPosition.x,
              };
            }
          ),
      })),

    moveLight: (
      id,
      position
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,

                    position: {
                      ...position,
                    },

                    offsetX:
                      position.x,

                    selectedLightOffsetX:
                      position.x,
                  }
                : light
          ),
      })),

    setName: (
      id,
      name
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,
                    name,
                  }
                : light
          ),
      })),

    setColor: (
      id,
      color
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,
                    color,
                  }
                : light
          ),
      })),

    setIntensity: (
      id,
      intensity
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,
                    intensity,
                  }
                : light
          ),
      })),

    setAngle: (
      id,
      angle
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,

                    angle,
                    beamAngle:
                      angle,
                  }
                : light
          ),
      })),

    setBeamAngle: (
      id,
      beamAngle
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,

                    beamAngle,
                    angle:
                      beamAngle,
                  }
                : light
          ),
      })),

    setPan: (
      id,
      pan
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,
                    pan,
                  }
                : light
          ),
      })),

    setTilt: (
      id,
      tilt
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,
                    tilt,
                  }
                : light
          ),
      })),

    toggleLightPower: (
      id
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,

                    powered:
                      !light
                        .powered,
                  }
                : light
          ),
      })),

    setSelectedLightsColor: (
      color
    ) =>
      set((state) => {
        const selectedIds =
          new Set(
            state
              .selectedLightIds
          );

        return {
          lights:
            state.lights.map(
              (light) =>
                selectedIds.has(
                  light.id
                )
                  ? {
                      ...light,
                      color,
                    }
                  : light
            ),
        };
      }),

    setSelectedLightsIntensity: (
      intensity
    ) =>
      set((state) => {
        const selectedIds =
          new Set(
            state
              .selectedLightIds
          );

        return {
          lights:
            state.lights.map(
              (light) =>
                selectedIds.has(
                  light.id
                )
                  ? {
                      ...light,
                      intensity,
                    }
                  : light
            ),
        };
      }),

    setSelectedLightsBeamAngle: (
      beamAngle
    ) =>
      set((state) => {
        const selectedIds =
          new Set(
            state
              .selectedLightIds
          );

        return {
          lights:
            state.lights.map(
              (light) =>
                selectedIds.has(
                  light.id
                )
                  ? {
                      ...light,

                      beamAngle,

                      angle:
                        beamAngle,
                    }
                  : light
            ),
        };
      }),

    setSelectedLightsPosition: (
      pan,
      tilt
    ) =>
      set((state) => {
        const selectedIds =
          new Set(
            state
              .selectedLightIds
          );

        return {
          lights:
            state.lights.map(
              (light) =>
                selectedIds.has(
                  light.id
                )
                  ? {
                      ...light,
                      pan,
                      tilt,
                    }
                  : light
            ),
        };
      }),

    setSelectedLightsPower: (
      powered
    ) =>
      set((state) => {
        const selectedIds =
          new Set(
            state
              .selectedLightIds
          );

        return {
          lights:
            state.lights.map(
              (light) =>
                selectedIds.has(
                  light.id
                )
                  ? {
                      ...light,
                      powered,
                    }
                  : light
            ),
        };
      }),

    applyCueFixtureStates: (
      fixtureStates
    ) =>
      set((state) => {
        const statesByFixtureId =
          new Map(
            fixtureStates.map(
              (
                fixtureState
              ) => [
                fixtureState
                  .fixtureId,

                fixtureState,
              ]
            )
          );

        return {
          lights:
            state.lights.map(
              (light) => {
                const fixtureState =
                  statesByFixtureId
                    .get(
                      light.id
                    );

                if (
                  !fixtureState
                ) {
                  return light;
                }

                return {
                  ...light,

                  // Alpha 17: Cue playback changes lighting output, never rig geometry.
                  color:
                    fixtureState
                      .color,

                  intensity:
                    fixtureState
                      .intensity,

                  beamAngle:
                    fixtureState
                      .beamAngle,

                  angle:
                    fixtureState
                      .beamAngle,

                  pan:
                    fixtureState
                      .pan,

                  tilt:
                    fixtureState
                      .tilt,

                  powered:
                    fixtureState
                      .powered,
                };
              }
            ),
        };
      }),

    attachToBar: (
      id,
      barId,
      offsetX = 0
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,

                    barId,
                    offsetX,

                    selectedLightOffsetX:
                      offsetX,
                  }
                : light
          ),
      })),

    snapLightToBar: (
      id,
      barId
    ) =>
      set((state) => ({
        lights:
          state.lights.map(
            (light) =>
              light.id === id
                ? {
                    ...light,

                    barId,

                    offsetX:
                      light
                        .position.x,

                    selectedLightOffsetX:
                      light
                        .position.x,
                  }
                : light
          ),
      })),

    createGroupFromSelection: (
      name
    ) =>
      set((state) => {
        if (
          state.selectedLightIds
            .length < 2
        ) {
          return state;
        }

        const newId =
          state.groups.length > 0
            ? Math.max(
                ...state.groups.map(
                  (group) =>
                    group.id
                )
              ) + 1
            : 1;

        const groupName =
          name?.trim() ||
          `Grupo ${newId}`;

        const newGroup:
          LightGroup = {
            id: newId,
            name: groupName,

            lightIds: [
              ...state
                .selectedLightIds,
            ],
          };

        return {
          groups: [
            ...state.groups,
            newGroup,
          ],
        };
      }),

    selectGroup: (
      groupId
    ) =>
      set((state) => {
        const group =
          state.groups.find(
            (item) =>
              item.id ===
              groupId
          );

        if (
          !group ||
          group.lightIds
            .length === 0
        ) {
          return state;
        }

        return {
          selectedLightIds: [
            ...group.lightIds,
          ],

          selectedLightId:
            group.lightIds[
              group.lightIds
                .length - 1
            ] ?? null,
        };
      }),

    renameGroup: (
      groupId,
      name
    ) =>
      set((state) => ({
        groups:
          state.groups.map(
            (group) =>
              group.id ===
              groupId
                ? {
                    ...group,

                    name:
                      name.trim() ||
                      group.name,
                  }
                : group
          ),
      })),

    removeGroup: (
      groupId
    ) =>
      set((state) => ({
        groups:
          state.groups.filter(
            (group) =>
              group.id !==
              groupId
          ),
      })),
  }));