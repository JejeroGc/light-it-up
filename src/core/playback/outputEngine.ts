import type {
  LightFixture,
} from "../../store/lightingStore";

import type {
  CueFixtureState,
} from "../../store/cueStore";

import type {
  ProgrammerValues,
} from "../../store/programmerStore";

import {
  resolveFixture,
} from "../lighting/resolveFixture";

/*
 * Capas que participan en la
 * resolución final de una luminaria.
 */
export type FixtureOutputLayers = {
  /*
   * Estado base y datos físicos
   * de la luminaria.
   */
  fixture: LightFixture;

  /*
   * Estado de la luminaria guardado
   * dentro de la Cue actualmente LIVE.
   *
   * Puede no existir cuando todavía
   * no hay ninguna Cue ejecutándose.
   */
  cueState?: CueFixtureState;

  /*
   * Cambios temporales realizados
   * desde el Programmer.
   *
   * Esta capa siempre tiene prioridad.
   */
  programmerValues?: ProgrammerValues;
};

/*
 * Aplica el estado de una Cue sobre
 * una luminaria física.
 *
 * Los datos que no forman parte de
 * una Cue, como nombre, tipo y DMX,
 * permanecen en el fixture original.
 */
const applyCueState = (
  fixture: LightFixture,
  cueState?: CueFixtureState
): LightFixture => {
  if (!cueState) {
    return fixture;
  }

  return {
    ...fixture,

    // Alpha 17: a Cue never moves/re-hangs a physical fixture.
    // Physical position and bar attachment belong to the rig editor only.
    pan: cueState.pan,
    tilt: cueState.tilt,

    color: cueState.color,
    intensity: cueState.intensity,

    /*
     * TheatreSpot todavía utiliza
     * angle, mientras que el resto
     * del proyecto utiliza beamAngle.
     *
     * Mantenemos ambos sincronizados.
     */
    angle: cueState.beamAngle,
    beamAngle: cueState.beamAngle,

    powered: cueState.powered,
  };
};

/*
 * Resuelve el estado final visible
 * de una luminaria.
 *
 * Orden de prioridad:
 *
 * 1. Fixture físico
 * 2. Cue LIVE
 * 3. Programmer
 *
 * La última capa aplicada tiene
 * prioridad sobre las anteriores.
 */
export const resolveFixtureOutput = ({
  fixture,
  cueState,
  programmerValues,
}: FixtureOutputLayers): LightFixture => {
  /*
   * Primero aplicamos la Cue LIVE
   * sobre el estado físico.
   */
  const fixtureWithCue =
    applyCueState(
      fixture,
      cueState
    );

  /*
   * Finalmente aplicamos el
   * Programmer.
   *
   * resolveFixture ya se encarga de
   * sobrescribir únicamente aquellos
   * parámetros que existen dentro
   * del Programmer.
   */
  return resolveFixture(
    fixtureWithCue,
    programmerValues
  );
};

/*
 * Busca el estado de una luminaria
 * dentro de una lista de estados
 * pertenecientes a una Cue.
 */
export const findCueFixtureState = (
  fixtureId: number,
  fixtureStates?: CueFixtureState[]
): CueFixtureState | undefined => {
  return fixtureStates?.find(
    (fixtureState) =>
      fixtureState.fixtureId ===
      fixtureId
  );
};