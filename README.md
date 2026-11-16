# Light It Up — v0.3.13 Alpha 17

**Light It Up** es un estudio web experimental de previsualización, armado y programación de iluminación teatral en 3D.

Esta versión es una **Alpha pública de testing**. El objetivo de esta etapa es probar el editor con colegas y, especialmente, enfrentar el **Rider Import** a planos técnicos reales de distintos teatros y espacios.

> **Importante:** Light It Up todavía no es una consola de show ni debe utilizarse como sistema crítico durante una función en vivo.

## Qué incluye Alpha 17

- Escenario y luminarias en 3D.
- Barras/posiciones de iluminación y Scene Tree.
- Selección individual y múltiple, marquee y grupos.
- Shortcuts de edición: copiar, pegar, duplicar, seleccionar todo, borrar, agrupar, Undo/Redo y movimiento por teclado.
- Inspector de luminarias: intensidad, color, beam, Pan/Tilt y otros parámetros disponibles según fixture.
- Programmer.
- Presets.
- Cues y reproducción GO/BACK.
- Timeline con audio.
- Transiciones y editor contextual de transición.
- Combinación de FX en transiciones.
- Guardado y apertura de proyectos de Light It Up.
- **Rider Import** con revisión previa antes de crear el venue.

## Rider Import — qué estamos testeando

El importador intenta transformar información de un rider/plano técnico en una base editable dentro del escenario 3D.

### Casos actualmente validados

- **Auditorio Belgrano**
- **Espacio Aguirre**

Estos dos riders fueron utilizados durante el desarrollo y sirven como casos de referencia. **Que un rider distinto sea aceptado o interpretado correctamente no está garantizado todavía.** Esa es precisamente la finalidad de esta Alpha pública.

### Cómo probar tu rider

1. Abrí Light It Up.
2. Entrá al flujo **Rider Import**.
3. Cargá el rider/plano técnico disponible en el formato admitido por la interfaz.
4. Revisá el análisis antes de crear el venue.
5. Creá el venue.
6. Compará el resultado 3D con el rider original.
7. Probá seleccionar y editar luminarias, crear una Cue y reproducirla.
8. Si encontrás una diferencia o error, reportalo junto con el rider original cuando sea posible compartirlo.

Nos interesa especialmente saber si:

- reconoce correctamente dimensiones del espacio;
- identifica posiciones/barras;
- respeta la distribución de luminarias;
- interpreta correctamente tipos y cantidades de fixtures;
- conserva posiciones al seleccionar varias luminarias o usar `Cmd/Ctrl + A`;
- permite editar varias luminarias sin alterar accidentalmente su ubicación física;
- las Cues modifican parámetros de iluminación sin mover físicamente los fixtures;
- el venue continúa funcionando después de guardar/abrir el proyecto.

## Cómo reportar un problema

Usá **GitHub → Issues → New issue → Reportar un problema**.

Incluí, idealmente:

- nombre del teatro/espacio (si puede compartirse);
- formato del rider utilizado;
- navegador y sistema operativo;
- pasos exactos para reproducir el problema;
- qué esperabas que ocurriera;
- qué ocurrió realmente;
- captura o grabación de pantalla;
- rider original, únicamente si tenés permiso para compartirlo.

No publiques documentación técnica privada o confidencial sin autorización del espacio correspondiente.

## Ejecutar localmente

Requiere Node.js 22+ y npm.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

Para comprobar el build de producción:

```bash
npm run build
npm run preview
```

## GitHub Pages

El repositorio incluye `.github/workflows/deploy-pages.yml`. Cada push a `main` ejecuta el build y, con GitHub Pages configurado para usar **GitHub Actions**, publica la versión web.

Más detalles en [`GITHUB-PAGES.md`](./GITHUB-PAGES.md).

## Estado del proyecto

**Versión:** v0.3.13 Alpha 17 — Stability & Timeline Pass  
**Estado:** testing / desarrollo activo  
**Foco actual:** estabilidad del editor y validación del Rider Import con riders reales.

Gracias por probar Light It Up y ayudar a llevar el proyecto fuera de sus dos venues de referencia.
