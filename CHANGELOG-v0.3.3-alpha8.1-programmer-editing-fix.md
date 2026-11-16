# Light It Up v0.3.3 — Alpha 8.1

## Programmer Editing Fix

- Move/Translate ahora escribe posición en Programmer en lugar de modificar directamente el Lighting Store.
- El drag directo de luminarias sobre varas escribe posición y relación con vara en Programmer.
- Los cambios de posición desde Inspector escriben en Programmer y respetan selección múltiple.
- Color, Beam y Position Presets se aplican al Programmer.
- Los presets se crean usando el valor visible incluyendo overrides del Programmer.
- Encendido/apagado por doble click se guarda como override del Programmer.
- Programmer ahora soporta `powered`, `barId`, `offsetX` y `selectedLightOffsetX`.
- `resolveFixture` resuelve esos valores con prioridad sobre una Cue LIVE.
- Focus y Rotate conservan el comportamiento basado en Programmer.

Objetivo: permitir editar una escena mientras una Cue está LIVE y luego consolidar los cambios con **Actualizar** sin que la Cue visible pise la edición.
