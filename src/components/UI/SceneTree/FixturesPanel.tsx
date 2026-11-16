import type {
  MouseEvent,
} from "react";

import { useLightingStore } from "../../../store/lightingStore";
import { useStageStore } from "../../../store/stageStore";
import { useProgrammerStore } from "../../../store/programmerStore";

import CollapsibleSection from "../CollapsibleSection";

import {
  itemStyle,
} from "./styles";

export default function FixturesPanel() {
  const {
    lights,
    selectedLightIds,
    selectLight,
  } = useLightingStore();

  const { bars } =
    useStageStore();

  /*
   * Cambios pendientes dentro
   * del Programmer.
   */
  const programmerEdits =
    useProgrammerStore(
      (state) => state.edits
    );

  const click = (
    event:
      MouseEvent<HTMLButtonElement>,
    id: number
  ) =>
    selectLight(
      id,
      event.shiftKey ||
        event.metaKey ||
        event.ctrlKey
    );

  return (
    <CollapsibleSection title="Fixtures">
      <div
        style={{
          marginLeft: 12,
        }}
      >
        {selectedLightIds.length >
          1 && (
          <p
            style={{
              marginTop: 0,
              marginBottom: 8,
              color: "#ffd36a",
              fontSize: 13,
            }}
          >
            {
              selectedLightIds.length
            }{" "}
            luminarias seleccionadas
          </p>
        )}

        {lights.length === 0 && (
          <p
            style={{
              marginTop: 0,
              opacity: 0.55,
              fontSize: 13,
            }}
          >
            No hay luminarias.
          </p>
        )}

        {lights.map((light) => {
          const bar = bars.find(
            (item) =>
              item.id ===
              light.barId
          );

          const selected =
            selectedLightIds.includes(
              light.id
            );

          const programmed =
            programmerEdits[
              light.id
            ] !== undefined;

          return (
            <button
              type="button"
              key={light.id}
              onClick={(event) =>
                click(
                  event,
                  light.id
                )
              }
              style={{
                ...itemStyle(
                  selected
                ),

                border: programmed
                  ? "1px solid #ffd36a"
                  : itemStyle(
                      selected
                    ).border,

                boxShadow: programmed
                  ? "inset 3px 0 0 #ffd36a"
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: 8,
                }}
              >
                <strong>
                  {light.name}
                </strong>

                {programmed && (
                  <span
                    title="Cambios pendientes en Programmer"
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      width: 21,
                      height: 21,
                      flexShrink: 0,
                      borderRadius: 5,
                      background:
                        "#ffd36a",
                      color: "#211b0d",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    P
                  </span>
                )}
              </div>

              <small>
                {bar
                  ? `en ${bar.name}`
                  : "Sin vara"}{" "}
                · Ch {light.channel}
              </small>
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}