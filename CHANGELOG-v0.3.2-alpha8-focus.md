# Light It Up v0.3.2 Alpha 8 — Focus Tool

## Nuevo: Focus múltiple

- Nueva herramienta **Focus** en el toolbar del viewport.
- Atajo de teclado: **F**.
- Seleccioná una o varias luminarias y activá Focus.
- Una mira sigue el cursor sobre el escenario.
- Al hacer click, todas las luminarias seleccionadas calculan automáticamente su Pan/Tilt para converger en ese punto.
- Los valores se escriben en el **Programmer**, por lo que pueden grabarse después en Position Presets o Cues.
- El último punto de focus queda visible como referencia al salir de la herramienta.

## Arquitectura

- `calculatePanTiltToTarget()` centraliza la conversión de coordenadas 3D a Pan/Tilt y comparte la misma convención que `calculateBeamDirection()`.
- `viewportStore` conserva `focusTarget` y `focusPreview`.
- Nuevo componente `FocusTarget.tsx` para interacción y visualización de la mira.
