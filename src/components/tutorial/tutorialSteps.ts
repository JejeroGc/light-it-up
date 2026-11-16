export type TutorialPlacement = "left" | "right" | "top" | "bottom" | "center";

export type TutorialStep = {
  selector: string | null;
  eyebrow: string;
  title: string;
  description: string;
  tip?: string;
  placement: TutorialPlacement;
};

export const tutorialSteps: TutorialStep[] = [
  {
    selector: null,
    eyebrow: "Bienvenido a Light It Up",
    title: "Creá tu primera escena en menos de dos minutos",
    description:
      "Este recorrido señala las herramientas esenciales. Podés avanzar con las flechas del teclado y salir en cualquier momento con Esc.",
    tip: "No modifica tu proyecto: solamente te muestra dónde está cada función.",
    placement: "center",
  },
  {
    selector: '[data-tour="add-fixture"]',
    eyebrow: "01 · Crear",
    title: "Agregá una luminaria",
    description:
      "Este botón incorpora un nuevo foco al escenario. Después aparecerá en el árbol de escena para que puedas seleccionarlo y organizarlo.",
    tip: "Al terminar el tutorial, probá crear uno y seleccionarlo.",
    placement: "right",
  },
  {
    selector: '[data-tour="viewport"]',
    eyebrow: "02 · Diseñar",
    title: "Trabajá directamente sobre el escenario 3D",
    description:
      "Usá el mouse para recorrer el espacio. Seleccioná una luminaria y utilizá el gizmo para moverla o rotarla sobre el escenario.",
    tip: "Podés cambiar la vista desde la barra de herramientas del viewport.",
    placement: "left",
  },
  {
    selector: '[data-tour="fixture-color"]',
    eyebrow: "03 · Programar",
    title: "Cambiá color, intensidad y haz",
    description:
      "El Inspector reúne los parámetros de la selección. Los cambios se aplican también a varias luminarias seleccionadas al mismo tiempo.",
    tip: "Seleccioná primero un fixture para ver este control activo.",
    placement: "left",
  },
  {
    selector: '[data-tour="playback"]',
    eyebrow: "04 · Cues",
    title: "Construí y reproducí escenas de iluminación",
    description:
      "Desde Playback podés guardar estados como cues y ejecutarlos con transiciones. GO avanza hacia la siguiente escena programada.",
    tip: "Creá al menos dos cues para comprobar el fade entre escenas.",
    placement: "top",
  },
  {
    selector: '[data-tour="timeline"]',
    eyebrow: "05 · Secuencia",
    title: "Ordená tus cues en la Timeline",
    description:
      "La línea de tiempo permite ubicar escenas, ajustar su duración y reproducir una secuencia completa de iluminación.",
    tip: "El botón ▶ reproduce la secuencia desde el cursor actual.",
    placement: "top",
  },
  {
    selector: '[data-tour="save-project"]',
    eyebrow: "06 · Guardar",
    title: "Descargá tu proyecto .lightitup",
    description:
      "Guardar genera un archivo que contiene el escenario, las luminarias, grupos, presets, cues y timeline. Después podés abrirlo desde el launcher.",
    tip: "Atajo: Cmd + S en Mac o Ctrl + S en Windows y Linux.",
    placement: "bottom",
  },
  {
    selector: null,
    eyebrow: "Listo para empezar",
    title: "Tu primer diseño está a unos pocos clics",
    description:
      "Agregá una luminaria, cambiale el color, creá dos cues y presioná GO. Ese recorrido alcanza para probar el núcleo del MVP.",
    tip: "Podés volver a abrir este tutorial desde Help → Primeros pasos.",
    placement: "center",
  },
];
