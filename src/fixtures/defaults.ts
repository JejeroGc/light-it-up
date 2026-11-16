import type { FixtureType } from "../store/lightingStore";

export type FixtureDefinition = {
  id: string;
  name: string;
  type: FixtureType;
  beamAngle: number;
  intensity: number;
  color: string;
};

export const FIXTURE_DEFAULTS: FixtureDefinition[] = [
  {
    id: "spot",
    name: "Theatre Spot",
    type: "spot",
    beamAngle: 0.35,
    intensity: 80,
    color: "#fff2d6",
  },
  {
    id: "wash",
    name: "Wash Light",
    type: "wash",
    beamAngle: 0.8,
    intensity: 70,
    color: "#ffffff",
  },
  {
    id: "beam",
    name: "Beam Light",
    type: "beam",
    beamAngle: 0.18,
    intensity: 100,
    color: "#ffffff",
  },
  {
    id: "moving",
    name: "Moving Head",
    type: "moving",
    beamAngle: 0.3,
    intensity: 90,
    color: "#ffffff",
  },
];