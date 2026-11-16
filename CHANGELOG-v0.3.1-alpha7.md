# Light It Up v0.3.1 Alpha 7 — Playback & Workflow Polish

## Correcciones principales

- Se agregó una fuente de playback compartida (`manual` / `timeline`) para impedir que GO y Timeline ejecuten transiciones simultáneas.
- El Timeline ahora dispara las cues según su `timelineTime`; ya no adelanta automáticamente una cue antes de alcanzar su marca.
- Se limpian correctamente el estado temporal, la fuente de reproducción y el progreso al detener o completar una reproducción.
- Los controles manuales de cues quedan bloqueados mientras el Timeline está reproduciendo o pausado.
- Las cargas manuales de cues también quedan protegidas durante la reproducción del Timeline.
- Se mantienen los fades y delays individuales de cada cue.
- Se mejoró la legibilidad de las etiquetas de varas mediante contorno, render prioritario y desactivación de oclusión por profundidad.

## Versión

- Proyecto actualizado a `0.3.1-alpha.7`.

## Validación

El entorno de empaquetado no pudo descargar `zustand@5.0.14` desde su registro interno, por lo que el build final debe verificarse localmente con:

```bash
npm install
npm run build
npm run dev
```
