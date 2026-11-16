import { useLightingStore } from "../../store/lightingStore";
import {
  useProgrammerStore,
  type ProgrammerValues,
} from "../../store/programmerStore";

const getActiveParameters = (
  values: ProgrammerValues
): string[] => {
  const parameters: string[] = [];

  if (values.color !== undefined) {
    parameters.push("Color");
  }

  if (values.intensity !== undefined) {
    parameters.push("Intensity");
  }

  if (values.pan !== undefined) {
    parameters.push("Pan");
  }

  if (values.tilt !== undefined) {
    parameters.push("Tilt");
  }

  if (values.beamAngle !== undefined) {
    parameters.push("Beam");
  }

  if (values.position !== undefined) {
    parameters.push("Position");
  }

  if (values.powered !== undefined) {
    parameters.push(values.powered ? "Power ON" : "Power OFF");
  }

  return parameters;
};

export default function ProgrammerPanel() {
  const lights = useLightingStore(
    (state) => state.lights
  );

  const {
    edits,
    clearFixture,
    clearProgrammer,
  } = useProgrammerStore();

  /*
   * Convertimos el objeto de edits
   * en una lista de luminarias con
   * valores activos en el Programmer.
   */
  const programmedFixtures =
    Object.entries(edits)
      .map(([fixtureId, values]) => {
        const numericFixtureId =
          Number(fixtureId);

        const fixture = lights.find(
          (light) =>
            light.id ===
            numericFixtureId
        );

        return {
          fixtureId:
            numericFixtureId,

          fixtureName:
            fixture?.name ??
            `Fixture ${numericFixtureId}`,

          values,
        };
      })
      .sort(
        (a, b) =>
          a.fixtureId -
          b.fixtureId
      );

  const hasProgrammerValues =
    programmedFixtures.length > 0;

  return (
    <section
      style={{
        marginTop: 24,
        paddingTop: 18,
        borderTop:
          "1px solid #333",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              letterSpacing: 0.8,
            }}
          >
            PROGRAMMER
          </h3>

          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color:
                hasProgrammerValues
                  ? "#ffd36a"
                  : "#777",
            }}
          >
            {hasProgrammerValues
              ? `${programmedFixtures.length} fixture${
                  programmedFixtures.length ===
                  1
                    ? ""
                    : "s"
                } con cambios`
              : "Sin cambios pendientes"}
          </div>
        </div>

        <div
          style={{
            width: 10,
            height: 10,
            flexShrink: 0,
            borderRadius: "50%",
            background:
              hasProgrammerValues
                ? "#ffd36a"
                : "#444",
            boxShadow:
              hasProgrammerValues
                ? "0 0 10px rgba(255, 211, 106, 0.7)"
                : "none",
          }}
        />
      </div>

      {!hasProgrammerValues && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            border:
              "1px solid #303030",
            background: "#191919",
            color: "#777",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          Los cambios de color,
          intensidad y beam aparecerán
          acá antes de ser grabados en
          una Cue.
        </div>
      )}

      {hasProgrammerValues && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {programmedFixtures.map(
            ({
              fixtureId,
              fixtureName,
              values,
            }) => {
              const activeParameters =
                getActiveParameters(
                  values
                );

              return (
                <div
                  key={fixtureId}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border:
                      "1px solid #3d3829",
                    background:
                      "#211f18",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          color:
                            "#ffd36a",
                          fontWeight: 600,
                          fontSize: 13,
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {fixtureName}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color: "#aaa",
                          fontSize: 11,
                        }}
                      >
                        {activeParameters.join(
                          " · "
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      title={`Limpiar ${fixtureName}`}
                      onClick={() =>
                        clearFixture(
                          fixtureId
                        )
                      }
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border:
                          "1px solid #555",
                        background:
                          "#252525",
                        color: "#bbb",
                        cursor:
                          "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!hasProgrammerValues}
        onClick={clearProgrammer}
        style={{
          width: "100%",
          marginTop: 14,
          padding: "10px 12px",
          borderRadius: 8,
          border:
            hasProgrammerValues
              ? "1px solid #b84c4c"
              : "1px solid #383838",
          background:
            hasProgrammerValues
              ? "#3a1d1d"
              : "#222",
          color:
            hasProgrammerValues
              ? "#ff9b9b"
              : "#666",
          cursor:
            hasProgrammerValues
              ? "pointer"
              : "not-allowed",
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        CLEAR PROGRAMMER
      </button>
    </section>
  );
}