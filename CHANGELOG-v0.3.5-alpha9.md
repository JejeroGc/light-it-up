# Light It Up v0.3.5 — Alpha 9

## Effects Engine
- Nuevo panel **Effects** dentro del Scene Tree.
- Efectos en tiempo real sobre luminarias seleccionadas o grupos: **Strobe, Pulse, Chase, Flicker y Color Chase**.
- Control de velocidad por efecto.
- Control de profundidad para efectos de intensidad.
- ON/OFF individual, eliminación y comando **Detener todos**.
- Los efectos se aplican como capa visual posterior a Fixture → Cue LIVE → Programmer, sin destruir los valores programados.

## Position Presets 2.0
- Los presets de posición ahora pueden guardar el Pan/Tilt individual de cada luminaria seleccionada.
- Al recuperar un preset sobre el mismo grupo, cada foco vuelve a su propia orientación en vez de copiar un único Pan/Tilt a todos.
- Compatibilidad hacia atrás con presets de posición anteriores.

## Estabilidad
- Los efectos temporales se limpian al crear o abrir un proyecto para evitar arrastrar estados de otra sesión.
- Se mantiene la arquitectura y funcionalidades de v0.3.4 Alpha 8.2 Power Recovery Fix.
