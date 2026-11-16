import { create } from "zustand";

import type {
  LightItUpProject,
} from "../core";

const defaultProject: LightItUpProject = {
  id: crypto.randomUUID(),

  name: "Proyecto sin título",

  version: "0.1",

  createdAt:
    new Date().toISOString(),

  updatedAt:
    new Date().toISOString(),

  stage: {
    width: 12,
    depth: 10,
    height: 6,

    bars: [
      {
        id: 1,
        name: "LX 1",
        x: 0,
        y: 5.6,
        z: 2,
        width: 12,
      },
      {
        id: 2,
        name: "LX 2",
        x: 0,
        y: 5.6,
        z: -1.5,
        width: 12,
      },
      {
        id: 3,
        name: "LX 3",
        x: 0,
        y: 5.6,
        z: -5,
        width: 12,
      },
    ],
  },

  fixtures: [],
};

type ProjectStore = {
  project: LightItUpProject;

  /*
   * Reemplaza completamente
   * la información del proyecto.
   */
  replaceProject: (
    project: LightItUpProject
  ) => void;

  /*
   * Mantengo este método por
   * compatibilidad con el código
   * existente.
   */
  setProject: (
    project: LightItUpProject
  ) => void;

  renameProject: (
    name: string
  ) => void;
};

export const useProjectStore =
  create<ProjectStore>((set) => ({
    project: defaultProject,

    replaceProject: (
      project
    ) =>
      set({
        project: {
          ...project,

          stage: {
            ...project.stage,

            bars:
              project.stage.bars.map(
                (bar) => ({
                  ...bar,
                })
              ),
          },

          fixtures:
            project.fixtures.map(
              (fixture) => ({
                ...fixture,

                position: {
                  ...fixture.position,
                },
              })
            ),
        },
      }),

    setProject: (
      project
    ) =>
      set({
        project,
      }),

    renameProject: (
      name
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          name,

          updatedAt:
            new Date().toISOString(),
        },
      })),
  }));