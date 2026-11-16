import { create } from "zustand";

export type FixtureType = "spot" | "wash" | "beam" | "moving";

export type LightFixture = {
  id: number;

  name: string;
  type: FixtureType;

  position: {
    x: number;
    y: number;
    z: number;
  };

  color: string;
  intensity: number;

  /*
   * angle y beamAngle siguen sincronizados por compatibilidad
   * con los componentes que ya teníamos.
   */
  angle: number;
  beamAngle: number;

  /*
   * Inclinación del foco respecto de la vertical.
   * Se guarda en radianes.
   */
  tilt: number;

  barId: number | null;
  offsetX: number;
  selectedLightOffsetX: number;

  universe: number;
  address: number;
  channel: number;

  powered: boolean;
};

type LightingStore = {
  lights: LightFixture[];

  selectedLightId: number | null;
  hoveredLightId: number | null;

  addLight: () => void;
  duplicateLight: (id: number) => void;
  removeLight: (id: number) => void;

  selectLight: (id: number | null, ...args: unknown[]) => void;

  setHoveredLight: (
    id: number | null,
    ...args: unknown[]
  ) => void;

  updateLight: (
    id: number,
    values: Partial<LightFixture> | null,
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

  setTilt: (
    id: number,
    tilt: number,
    ...args: unknown[]
  ) => void;

  toggleLightPower: (
    id: number,
    ...args: unknown[]
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

  tilt: 0,

  barId: null,
  offsetX: 0,
  selectedLightOffsetX: 0,

  universe: 1,
  address: id,
  channel: id,

  powered: true,
});

export const defaultLights: LightFixture[] = [
  createDefaultLight(1),
];

export const useLightingStore = create<LightingStore>(
  (set) => ({
    selectedLightId: null,
    hoveredLightId: null,

    lights: defaultLights,

    addLight: () =>
      set((state) => {
        const newId =
          state.lights.length > 0
            ? Math.max(
                ...state.lights.map((light) => light.id)
              ) + 1
            : 1;

        return {
          lights: [
            ...state.lights,
            createDefaultLight(newId),
          ],
          selectedLightId: newId,
        };
      }),

    duplicateLight: (id) =>
      set((state) => {
        const original = state.lights.find(
          (light) => light.id === id
        );

        if (!original) {
          return state;
        }

        const newId =
          state.lights.length > 0
            ? Math.max(
                ...state.lights.map((light) => light.id)
              ) + 1
            : 1;

        const duplicated: LightFixture = {
          ...original,

          id: newId,
          name: `${original.name} copia`,

          position: {
            x: original.position.x + 0.5,
            y: original.position.y,
            z: original.position.z,
          },

          offsetX: original.offsetX + 0.5,

          selectedLightOffsetX:
            original.selectedLightOffsetX + 0.5,

          address: newId,
          channel: newId,
        };

        return {
          lights: [...state.lights, duplicated],
          selectedLightId: newId,
        };
      }),

    removeLight: (id) =>
      set((state) => ({
        lights: state.lights.filter(
          (light) => light.id !== id
        ),

        selectedLightId:
          state.selectedLightId === id
            ? null
            : state.selectedLightId,

        hoveredLightId:
          state.hoveredLightId === id
            ? null
            : state.hoveredLightId,
      })),

    selectLight: (id) =>
      set({
        selectedLightId: id,
      }),

    setHoveredLight: (id) =>
      set({
        hoveredLightId: id,
      }),

    updateLight: (id, values) =>
      set((state) => {
        if (!values) {
          return state;
        }

        return {
          lights: state.lights.map((light) => {
            if (light.id !== id) {
              return light;
            }

            const updatedLight: LightFixture = {
              ...light,
              ...values,
              position: values.position
                ? {
                    ...light.position,
                    ...values.position,
                  }
                : light.position,
            };

            if (values.angle !== undefined) {
              updatedLight.beamAngle = values.angle;
            }

            if (values.beamAngle !== undefined) {
              updatedLight.angle = values.beamAngle;
            }

            if (values.position !== undefined) {
              updatedLight.offsetX =
                updatedLight.position.x;

              updatedLight.selectedLightOffsetX =
                updatedLight.position.x;
            }

            return updatedLight;
          }),
        };
      }),

    updateLightPosition: (
      id,
      axisOrPosition,
      value
    ) =>
      set((state) => ({
        lights: state.lights.map((light) => {
          if (light.id !== id) {
            return light;
          }

          if (typeof axisOrPosition === "object") {
            return {
              ...light,

              position: {
                ...axisOrPosition,
              },

              offsetX: axisOrPosition.x,

              selectedLightOffsetX:
                axisOrPosition.x,
            };
          }

          const newPosition = {
            ...light.position,

            [axisOrPosition]:
              value ??
              light.position[axisOrPosition],
          };

          return {
            ...light,

            position: newPosition,

            offsetX: newPosition.x,

            selectedLightOffsetX:
              newPosition.x,
          };
        }),
      })),

    moveLight: (id, position) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,

                position: {
                  ...position,
                },

                offsetX: position.x,

                selectedLightOffsetX:
                  position.x,
              }
            : light
        ),
      })),

    setName: (id, name) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                name,
              }
            : light
        ),
      })),

    setColor: (id, color) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                color,
              }
            : light
        ),
      })),

    setIntensity: (id, intensity) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                intensity,
              }
            : light
        ),
      })),

    setAngle: (id, angle) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                angle,
                beamAngle: angle,
              }
            : light
        ),
      })),

    setBeamAngle: (id, beamAngle) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                beamAngle,
                angle: beamAngle,
              }
            : light
        ),
      })),

    setTilt: (id, tilt) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                tilt,
              }
            : light
        ),
      })),

    /*
     * Ya no modificamos la intensidad.
     * Así, al apagar y volver a encender,
     * recupera el valor que tenía.
     */
    toggleLightPower: (id) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,
                powered: !light.powered,
              }
            : light
        ),
      })),

    attachToBar: (
      id,
      barId,
      offsetX = 0
    ) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,

                barId,
                offsetX,

                selectedLightOffsetX:
                  offsetX,

                position: {
                  ...light.position,
                  x: offsetX,
                },
              }
            : light
        ),
      })),

    snapLightToBar: (id, barId) =>
      set((state) => ({
        lights: state.lights.map((light) =>
          light.id === id
            ? {
                ...light,

                barId,

                offsetX:
                  light.position.x,

                selectedLightOffsetX:
                  light.position.x,
              }
            : light
        ),
      })),
  })
);