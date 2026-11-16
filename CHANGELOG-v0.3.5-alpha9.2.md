# Light It Up v0.3.5 — Alpha 9.2

## Save / Open exact-state fix

- El formato de proyecto pasa a v2.
- Guardar ahora persiste los cambios que todavía están en PROGRAMMER (posición, pan/tilt, color, intensidad, beam, power y attachment).
- Abrir restaura PROGRAMMER después de la Cue LIVE para conservar la misma prioridad visual que antes de guardar.
- Los efectos de Alpha 9 también se guardan y restauran.
- Los archivos v1 siguen siendo compatibles. Si un v1 fue guardado por una versión anterior que no incluía PROGRAMMER, esos datos históricos no pueden reconstruirse exactamente porque nunca quedaron escritos en el archivo.
- El Status Bar ahora muestra v0.3.5 Alpha 9.2.
- Se conserva la corrección Alpha 9.1 de Cmd/Ctrl+A y Escape.
