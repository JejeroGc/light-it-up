export type StageBar = {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
};

export type Stage = {
  width: number;
  depth: number;
  height: number;
  bars: StageBar[];
};