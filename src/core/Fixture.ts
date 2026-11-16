export type FixtureType =
  | "spot"
  | "PAR"
  | "FRESNEL"
  | "PROFILE"
  | "MOVING_HEAD"
  | "WASH"
  | "BEAM";

export type Fixture = {
  id: number;
  name: string;
  type: FixtureType;

  universe: number;
  address: number;
  channel: number;

  barId: number | null;
  offsetX: number;

  position: {
    x: number;
    y: number;
    z: number;
  };

  color: string;
  intensity: number;
  beamAngle: number;
};