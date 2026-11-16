# SHREK automation – Light It Up v0.3.5 Alpha 9.2

Esta edición agrega un generador automático de cues para la puesta técnica de SHREK 2026.

## Cómo usarlo

1. Abrí Light It Up.
2. Abrí primero tu proyecto/escenario definitivo con todas las luminarias ubicadas.
3. En la barra superior vas a ver un nuevo botón `🎭 SHREK`.
4. Presionalo y confirmá el reemplazo de cues si ya existen cues cargadas.
5. Light It Up genera 57 cues adaptando paleta, intensidad, beam y distribución espacial a las luminarias existentes.
6. Revisá cada look y ajustá los especiales concretos (Fiona, Farquaad, narradores, etc.) según el rig real.
7. Guardá el proyecto normalmente.

## Importador genérico

También se agregó `⬇ Cues`, que acepta archivos JSON con formato `light-it-up-cue-sheet` v1. Esto permite preparar futuras obras sin editar el código.

## Qué automatiza esta primera versión

- número y nombre de cue
- color/paleta
- intensidad
- blackout
- fade y delay
- apertura de beam cuando la cue lo requiere
- distribución semántica: full stage, centro, laterales, frente y contraluz

Los efectos dinámicos escritos en la hoja (chase, flicker, movimiento, audience blinder) quedan indicados en el nombre/nota de la cue, pero no se activan por cue todavía porque el sistema actual de Effects es global y no está asociado al Playback. Ese puede ser el siguiente paso.

## Desarrollo

```bash
npm install
npm run dev
```

La verificación TypeScript (`npx tsc -b`) fue ejecutada correctamente en esta edición.
