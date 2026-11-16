# Light It Up v0.2.0-alpha5 — Direct Manipulation & Playback Flow

## Correcciones
- PLAY ahora continúa automáticamente por todos los cues en orden, incluso si no hay otro cue pendiente en la cola temporal.
- La transición siguiente se inicia en el frame posterior para evitar carreras entre callbacks de playback.
- Mejor contraste del nombre y coordenadas de las varas en Scene Tree.

## Interacción 3D
- Arrastre directo de luminarias desde el cuerpo del foco.
- Snap automático a la vara más cercana.
- Movimiento horizontal limitado al ancho real de la vara.
- Precisión de 5 cm durante el arrastre.
- Resaltado celeste de la vara de destino.
- La cámara orbital se bloquea mientras se arrastra un foco.
- La luminaria conserva selección, cues, presets y datos DMX.

## Estabilidad
- Sin dependencias nuevas.
- Se mantiene el gizmo para traslación y rotación avanzada.
