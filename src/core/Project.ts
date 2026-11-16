import type { Stage } from "./Stage";
import type { Fixture } from "./Fixture";

export type LightItUpProject = {
  id: string;
  name: string;
  version: string;

  stage: Stage;
  fixtures: Fixture[];

  createdAt: string;
  updatedAt: string;
};