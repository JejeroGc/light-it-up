export type FixtureDefinition = {
  id: string;

  name: string;

  family:
    | "PAR"
    | "FRESNEL"
    | "PROFILE"
    | "MOVING"
    | "LED";

  beamAngle: number;

  colorTemperature: number;

  power: number;

  icon: string;

  supportsColor: boolean;

  supportsZoom: boolean;

  supportsPanTilt: boolean;
};