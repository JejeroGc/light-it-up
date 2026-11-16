import { useLightingStore } from "../../store/lightingStore";
import { useStageStore } from "../../store/stageStore";
import { useProgrammerStore } from "../../store/programmerStore";
import { useCueStore } from "../../store/cueStore";
import { usePlaybackStore } from "../../store/playbackStore";

import {
  findCueFixtureState,
  resolveFixtureOutput,
} from "../../core/playback/outputEngine";

import CollapsibleSection from "../UI/CollapsibleSection";
import { AUDITORIO_BELGRANO_PROFILES } from "../../venues/auditorioBelgrano";

export default function Inspector() {
  const {
    bars,
    selectedBarId,
    width,
    depth,
    height,
    updateBar,
    removeBar,
  } = useStageStore();

  const {
    lights,
    selectedLightId,
    selectedLightIds,

    setName,

    duplicateLight,
    removeSelectedLights,
  } = useLightingStore();

  const {
    edits: programmerEdits,
    setColor: setProgrammerColor,
    setIntensity: setProgrammerIntensity,
    setBeamAngle: setProgrammerBeamAngle,
    setPosition: setProgrammerPosition,
    setAttachment: setProgrammerAttachment,
    setPower: setProgrammerPower,
  } = useProgrammerStore();

  const cues = useCueStore((state) => state.cues);
  const liveCueId = usePlaybackStore((state) => state.liveCueId);
  const transitionFixtureStates = usePlaybackStore(
    (state) => state.transitionFixtureStates
  );

  const liveCue = cues.find((cue) => cue.id === liveCueId);

  /*
   * Luminaria principal de la selección.
   *
   * Este objeto conserva los valores
   * físicos originales del Lighting Store.
   */
  const selectedLight = lights.find(
    (light) =>
      light.id === selectedLightId
  );

  /*
   * Todas las luminarias seleccionadas
   * con sus valores físicos originales.
   */
  const selectedLights = lights.filter(
    (light) =>
      selectedLightIds.includes(
        light.id
      )
  );

  /*
   * Resultado visible de cada luminaria:
   *
   * Lighting Store
   *      +
   * Programmer
   */
  const resolvedSelectedLights =
    selectedLights.map((light) => {
      const cueState = findCueFixtureState(
        light.id,
        transitionFixtureStates ?? liveCue?.fixtureStates
      );

      return resolveFixtureOutput({
        fixture: light,
        cueState,
        programmerValues: programmerEdits[light.id],
      });
    });

  /*
   * Resultado visible de la luminaria
   * principal de la selección.
   */
  const resolvedSelectedLight =
    selectedLight
      ? resolveFixtureOutput({
          fixture: selectedLight,
          cueState: findCueFixtureState(
            selectedLight.id,
            transitionFixtureStates ?? liveCue?.fixtureStates
          ),
          programmerValues: programmerEdits[selectedLight.id],
        })
      : undefined;

  const multipleSelection =
    selectedLights.length > 1;

  /*
   * Detectamos valores mixtos usando
   * el resultado final visible.
   *
   * De esta manera también considera
   * los cambios del Programmer.
   */
  const allSelectedHaveSameColor =
    resolvedSelectedLights.length > 0 &&
    resolvedSelectedLights.every(
      (light) =>
        light.color ===
        resolvedSelectedLights[0].color
    );

  const allSelectedHaveSameIntensity =
    resolvedSelectedLights.length > 0 &&
    resolvedSelectedLights.every(
      (light) =>
        light.intensity ===
        resolvedSelectedLights[0]
          .intensity
    );

  const allSelectedHaveSameBeamAngle =
    resolvedSelectedLights.length > 0 &&
    resolvedSelectedLights.every(
      (light) =>
        light.beamAngle ===
        resolvedSelectedLights[0]
          .beamAngle
    );

  const allSelectedHaveSamePower =
    resolvedSelectedLights.length > 0 &&
    resolvedSelectedLights.every(
      (light) =>
        light.powered ===
        resolvedSelectedLights[0].powered
    );

  /*
   * Si todas están en la misma vara,
   * devuelve el ID de esa vara.
   *
   * Si están en varas diferentes,
   * devuelve null.
   */
  const commonBarId =
    resolvedSelectedLights.length > 0 &&
    resolvedSelectedLights.every(
      (light) =>
        light.barId ===
        resolvedSelectedLights[0].barId
    )
      ? resolvedSelectedLights[0].barId
      : null;

  const selectedBar = bars.find(
    (bar) => bar.id === selectedBarId
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 8,
    marginTop: 6,
    marginBottom: 12,
    boxSizing: "border-box",
  };

  /*
   * Mueve toda la selección conservando
   * la distancia relativa entre las luces.
   *
   * La posición se escribe en el Programmer,
   * así una Cue LIVE no puede pisar la edición.
   */
  const moveSelectedLights = (
    position: {
      x: number;
      y: number;
      z: number;
    }
  ) => {
    if (!resolvedSelectedLight) {
      return;
    }

    const deltaX =
      position.x - resolvedSelectedLight.position.x;
    const deltaY =
      position.y - resolvedSelectedLight.position.y;
    const deltaZ =
      position.z - resolvedSelectedLight.position.z;

    resolvedSelectedLights.forEach((light) => {
      setProgrammerPosition(light.id, {
        x: light.position.x + deltaX,
        y: light.position.y + deltaY,
        z: light.position.z + deltaZ,
      });
    });
  };

  /*
   * Escribe el color en el Programmer
   * para todas las luces seleccionadas.
   */
  const setSelectedProgrammerColor = (
    color: string
  ) => {
    selectedLightIds.forEach(
      (fixtureId) => {
        setProgrammerColor(
          fixtureId,
          color
        );
      }
    );
  };

  /*
   * Escribe la intensidad en el
   * Programmer para toda la selección.
   */
  const setSelectedProgrammerIntensity =
    (intensity: number) => {
      selectedLightIds.forEach(
        (fixtureId) => {
          setProgrammerIntensity(
            fixtureId,
            intensity
          );
        }
      );
    };

  /*
   * Escribe el ángulo del haz en el
   * Programmer para toda la selección.
   */
  const setSelectedProgrammerBeamAngle =
    (beamAngle: number) => {
      selectedLightIds.forEach(
        (fixtureId) => {
          setProgrammerBeamAngle(
            fixtureId,
            beamAngle
          );
        }
      );
    };

  const setSelectedProgrammerPower =
    (powered: boolean) => {
      selectedLightIds.forEach(
        (fixtureId) => {
          setProgrammerPower(
            fixtureId,
            powered
          );
        }
      );
    };

  if (
    selectedLight &&
    resolvedSelectedLight
  ) {
    return (
      <>
        <h2>Inspector</h2>

        {multipleSelection && (
          <p
            style={{
              color: "#ffd36a",
              fontWeight: 600,
              marginTop: 0,
            }}
          >
            {selectedLights.length}{" "}
            luminarias seleccionadas
          </p>
        )}

        <CollapsibleSection title="Fixture">
          {!multipleSelection && (
            <>
              <label>Nombre</label>

              <input
                type="text"
                value={selectedLight.name}
                onChange={(event) =>
                  setName(
                    selectedLight.id,
                    event.target.value
                  )
                }
                style={inputStyle}
              />

              <p>Tipo: {selectedLight.type}</p>
              {selectedLight.profileId && AUDITORIO_BELGRANO_PROFILES[selectedLight.profileId] && (
                <div style={{ marginTop: 10, padding: 10, border: "1px solid #333", borderRadius: 8, background: "#17181d" }}>
                  <div style={{ fontWeight: 700 }}>{AUDITORIO_BELGRANO_PROFILES[selectedLight.profileId].label}</div>
                  <div style={{ marginTop: 5, fontSize: 11, color: "#aaa" }}>{AUDITORIO_BELGRANO_PROFILES[selectedLight.profileId].category}</div>
                  <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}><b>Controles:</b> {AUDITORIO_BELGRANO_PROFILES[selectedLight.profileId].functions.join(" · ")}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: "#ffd36a", lineHeight: 1.45 }}>{AUDITORIO_BELGRANO_PROFILES[selectedLight.profileId].notes}</div>
                </div>
              )}
            </>
          )}

          {multipleSelection && (
            <p
              style={{
                marginTop: 0,
                opacity: 0.7,
              }}
            >
              Editando la selección
              completa
            </p>
          )}

          <label>Colgada en</label>

          <select
            value={
              commonBarId === null
                ? ""
                : commonBarId
            }
            onChange={(event) => {
              const value =
                event.target.value;

              /*
               * Quitar las luces
               * seleccionadas de sus
               * respectivas varas.
               */
              if (value === "") {
                selectedLights.forEach(
                  (light) => {
                    setProgrammerAttachment(
                      light.id,
                      null,
                      0
                    );
                  }
                );

                return;
              }

              const barId =
                Number(value);

              const bar = bars.find(
                (item) =>
                  item.id === barId
              );

              if (!bar) {
                return;
              }

              /*
               * Colgar toda la selección
               * en la misma vara.
               */
              selectedLights.forEach(
                (light) => {
                  const resolved =
                    resolvedSelectedLights.find(
                      (item) => item.id === light.id
                    ) ?? light;

                  const offsetX =
                    resolved.position.x - bar.x;

                  setProgrammerAttachment(
                    light.id,
                    bar.id,
                    offsetX
                  );

                  setProgrammerPosition(
                    light.id,
                    {
                      x: resolved.position.x,
                      y: bar.y - 0.1,
                      z: bar.z,
                    }
                  );
                }
              );
            }}
            style={inputStyle}
          >
            <option value="">
              {commonBarId === null &&
              selectedLights.some(
                (light) =>
                  light.barId !== null
              )
                ? "Varas diferentes"
                : "Sin vara"}
            </option>

            {bars.map((bar) => (
              <option
                key={bar.id}
                value={bar.id}
              >
                {bar.name}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const idsToDuplicate =
                  [...selectedLightIds];

                idsToDuplicate.forEach(
                  (id) => {
                    duplicateLight(id);
                  }
                );
              }}
              style={{
                flex: 1,
                padding: 8,
                cursor: "pointer",
              }}
            >
              {multipleSelection
                ? `Duplicar ${selectedLights.length}`
                : "Duplicar"}
            </button>

            <button
              type="button"
              onClick={
                removeSelectedLights
              }
              style={{
                flex: 1,
                padding: 8,
                cursor: "pointer",
                background: "#7f1d1d",
                color: "white",
                border:
                  "1px solid #991b1b",
              }}
            >
              {multipleSelection
                ? `Eliminar ${selectedLights.length}`
                : "Eliminar"}
            </button>
          </div>
        </CollapsibleSection>

        <hr />

        <CollapsibleSection title="Power">
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setSelectedProgrammerPower(true)
              }
              style={{
                flex: 1,
                padding: "9px 10px",
                cursor: "pointer",
                border: resolvedSelectedLight.powered
                  ? "1px solid #7ddc8b"
                  : "1px solid #555",
                background: resolvedSelectedLight.powered
                  ? "#18351f"
                  : "#252525",
                color: resolvedSelectedLight.powered
                  ? "#9df0a7"
                  : "#bbb",
                fontWeight: 700,
              }}
            >
              ON
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedProgrammerPower(false)
              }
              style={{
                flex: 1,
                padding: "9px 10px",
                cursor: "pointer",
                border: !resolvedSelectedLight.powered
                  ? "1px solid #d96b6b"
                  : "1px solid #555",
                background: !resolvedSelectedLight.powered
                  ? "#3a1d1d"
                  : "#252525",
                color: !resolvedSelectedLight.powered
                  ? "#ff9b9b"
                  : "#bbb",
                fontWeight: 700,
              }}
            >
              OFF
            </button>
          </div>

          {!allSelectedHaveSamePower && (
            <p
              style={{
                marginBottom: 0,
                color: "#ffd36a",
                fontSize: 12,
              }}
            >
              Estado mixto en la selección
            </p>
          )}
        </CollapsibleSection>

        <hr />

        <CollapsibleSection title="Color">
          {!allSelectedHaveSameColor && (
            <p
              style={{
                marginTop: 0,
                marginBottom: 8,
                color: "#ffd36a",
                fontSize: 13,
              }}
            >
              Valores diferentes
            </p>
          )}

          <input
            data-tour="fixture-color"
            type="color"
            value={
              resolvedSelectedLight.color
            }
            onChange={(event) =>
              setSelectedProgrammerColor(
                event.target.value
              )
            }
            style={{
              width: "100%",
              height: 36,
            }}
          />
        </CollapsibleSection>

        <hr />

        <CollapsibleSection title="Beam">
          <label>
            Intensidad:{" "}
            {allSelectedHaveSameIntensity
              ? resolvedSelectedLight.intensity
              : "Mixto"}
          </label>

          <input
            type="range"
            min={0}
            max={150}
            value={Number.isFinite(resolvedSelectedLight.intensity) ? resolvedSelectedLight.intensity : 0}
            onChange={(event) =>
              setSelectedProgrammerIntensity(
                Number(
                  event.target.value
                )
              )
            }
            style={{
              width: "100%",
            }}
          />

          <label>
            Ángulo:{" "}
            {allSelectedHaveSameBeamAngle
              ? (Number.isFinite(resolvedSelectedLight.beamAngle)
                  ? resolvedSelectedLight.beamAngle
                  : 0.35).toFixed(2)
              : "Mixto"}
          </label>

          <input
            type="range"
            min={0.1}
            max={1.2}
            step={0.01}
            value={Number.isFinite(resolvedSelectedLight.beamAngle) ? resolvedSelectedLight.beamAngle : 0.35}
            onChange={(event) =>
              setSelectedProgrammerBeamAngle(
                Number(
                  event.target.value
                )
              )
            }
            style={{
              width: "100%",
            }}
          />
        </CollapsibleSection>

        <hr />

        <CollapsibleSection title="Transform">
          <p
            style={{
              marginTop: 0,
              opacity: 0.65,
              fontSize: 13,
            }}
          >
            {multipleSelection
              ? "El movimiento mantiene la separación entre las luminarias."
              : "Posición de la luminaria."}
          </p>

          <label>
            X / Offset:{" "}
            {resolvedSelectedLight.position.x}
          </label>

          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            value={
              resolvedSelectedLight.position.x
            }
            onChange={(event) =>
              moveSelectedLights({
                x: Number(
                  event.target.value
                ),

                y:
                  resolvedSelectedLight.position
                    .y,

                z:
                  resolvedSelectedLight.position
                    .z,
              })
            }
            style={{
              width: "100%",
            }}
          />

          <label>
            Y:{" "}
            {resolvedSelectedLight.position.y}
          </label>

          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={
              resolvedSelectedLight.position.y
            }
            onChange={(event) =>
              moveSelectedLights({
                x:
                  resolvedSelectedLight.position
                    .x,

                y: Number(
                  event.target.value
                ),

                z:
                  resolvedSelectedLight.position
                    .z,
              })
            }
            style={{
              width: "100%",
            }}
          />

          <label>
            Z:{" "}
            {resolvedSelectedLight.position.z}
          </label>

          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            value={
              resolvedSelectedLight.position.z
            }
            onChange={(event) =>
              moveSelectedLights({
                x:
                  resolvedSelectedLight.position
                    .x,

                y:
                  resolvedSelectedLight.position
                    .y,

                z: Number(
                  event.target.value
                ),
              })
            }
            style={{
              width: "100%",
            }}
          />
        </CollapsibleSection>

        {!multipleSelection && (
          <>
            <hr />

            <CollapsibleSection
              title="DMX"
              defaultOpen={false}
            >
              <p>
                Universo:{" "}
                {selectedLight.universe}
              </p>

              <p>
                Dirección:{" "}
                {selectedLight.address}
              </p>

              <p>
                Canal:{" "}
                {selectedLight.channel}
              </p>
            </CollapsibleSection>
          </>
        )}
      </>
    );
  }

  if (selectedBar) {
    return (
      <>
        <h2>Inspector</h2>

        <CollapsibleSection title="Bar">
          <label>Nombre</label>

          <input
            type="text"
            value={selectedBar.name}
            onChange={(event) =>
              updateBar(
                selectedBar.id,
                {
                  name:
                    event.target.value,
                }
              )
            }
            style={inputStyle}
          />

          <label>
            Altura Y: {selectedBar.y}
          </label>

          <input
            type="range"
            min={2}
            max={height}
            step={0.1}
            value={selectedBar.y}
            onChange={(event) =>
              updateBar(
                selectedBar.id,
                {
                  y: Number(
                    event.target.value
                  ),
                }
              )
            }
            style={{
              width: "100%",
            }}
          />

          <label>
            Profundidad Z:{" "}
            {selectedBar.z}
          </label>

          <input
            type="range"
            min={-depth}
            max={depth}
            step={0.1}
            value={selectedBar.z}
            onChange={(event) =>
              updateBar(
                selectedBar.id,
                {
                  z: Number(
                    event.target.value
                  ),
                }
              )
            }
            style={{
              width: "100%",
            }}
          />

          <label>
            Longitud:{" "}
            {selectedBar.width}
          </label>

          <input
            type="range"
            min={2}
            max={width}
            step={0.5}
            value={selectedBar.width}
            onChange={(event) =>
              updateBar(
                selectedBar.id,
                {
                  width: Number(
                    event.target.value
                  ),
                }
              )
            }
            style={{
              width: "100%",
            }}
          />

          <button
            type="button"
            onClick={() =>
              removeBar(selectedBar.id)
            }
            style={{
              width: "100%",
              marginTop: 12,
              padding: 8,
              cursor: "pointer",
              background: "#7f1d1d",
              color: "white",
              border:
                "1px solid #991b1b",
            }}
          >
            Eliminar vara
          </button>
        </CollapsibleSection>
      </>
    );
  }

  return (
    <>
      <h2>Inspector</h2>

      <p
        style={{
          opacity: 0.6,
        }}
      >
        Seleccioná una luminaria o una
        vara para editarla.
      </p>
    </>
  );
}