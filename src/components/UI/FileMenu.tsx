import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
} from "react";

import {
  loadProjectFromFile,
  saveProjectToFile,
} from "../../core/project/projectSerializer";
import { useStatusStore } from "../../store/statusStore";
import { useLightingStore } from "../../store/lightingStore";
import { useCueStore } from "../../store/cueStore";
import { usePlaybackStore } from "../../store/playbackStore";
import { buildCuesFromSheet, parseShowCueSheet } from "../../core/project/showCueImporter";
import { shrekCueSheet } from "../../core/project/shrekCueSheet";

export default function FileMenu() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const cueSheetInputRef =
    useRef<HTMLInputElement>(null);

  const [isDraggingFile, setIsDraggingFile] =
    useState(false);

  const handleSaveProject = () => {
    try {
      useStatusStore.getState().markSaving();
      saveProjectToFile();
      useStatusStore.getState().markSaved();
    } catch (error) {
      console.error(
        "No se pudo guardar el proyecto:",
        error
      );

      window.alert(
        "Ocurrió un error al guardar el proyecto."
      );
    }
  };

  const openProjectFile = async (
    file: File
  ) => {
    const confirmed =
      window.confirm(
        "Al abrir este proyecto se reemplazará el show actual. ¿Querés continuar?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const project =
        await loadProjectFromFile(file);

      useStatusStore.getState().markSaved();

      window.alert(
        `Proyecto “${project.project.name}” abierto correctamente.`
      );
    } catch (error) {
      console.error(
        "No se pudo abrir el proyecto:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "El archivo seleccionado no es válido.";

      window.alert(
        `No se pudo abrir el proyecto.\n\n${message}`
      );
    }
  };

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  const applyCueSheet = (
    sheet: ReturnType<typeof parseShowCueSheet>
  ) => {
    const fixtures = useLightingStore.getState().lights;

    if (fixtures.length === 0) {
      window.alert("No hay luminarias en el proyecto actual. Abrí o armá primero el escenario y después importá las cues.");
      return;
    }

    const currentCues = useCueStore.getState().cues;
    const confirmed =
      currentCues.length === 0 ||
      window.confirm(
        `Se reemplazarán las ${currentCues.length} cues actuales por ${sheet.cues.length} cues de “${sheet.name}”. ¿Continuar?`
      );

    if (!confirmed) return;

    const cues = buildCuesFromSheet(sheet, fixtures);
    useCueStore.getState().replaceCues({ cues, activeCueId: null });
    usePlaybackStore.getState().resetPlayback();
    useStatusStore.getState().markDirty();

    window.alert(
      `Listo: se generaron ${cues.length} cues de “${sheet.name}” usando las ${fixtures.length} luminarias del proyecto actual.`
    );
  };

  const handleLoadShrek = () => {
    applyCueSheet(shrekCueSheet);
  };

  const handleOpenCueSheet = () => {
    cueSheetInputRef.current?.click();
  };

  const handleCueSheetFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const sheet = parseShowCueSheet(await file.text());
      applyCueSheet(sheet);
    } catch (error) {
      console.error("No se pudo importar la hoja de cues:", error);
      window.alert(
        error instanceof Error
          ? `No se pudo importar la hoja de cues.\n\n${error.message}`
          : "No se pudo importar la hoja de cues."
      );
    }
  };

  const handleProjectFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    await openProjectFile(file);
  };

  const handleDragEnter = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingFile(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.currentTarget.contains(
        event.relatedTarget as Node | null
      )
    ) {
      return;
    }

    setIsDraggingFile(false);
  };

  const handleDrop = async (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    await openProjectFile(file);
  };

  /*
   * Evita que Chrome abandone la aplicación
   * y abra el JSON como una página cuando se
   * suelta un archivo fuera del botón Abrir.
   */
  useEffect(() => {
    const preventBrowserFileNavigation = (
      event: globalThis.DragEvent
    ) => {
      if (
        event.dataTransfer?.types.includes(
          "Files"
        )
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener(
      "dragover",
      preventBrowserFileNavigation
    );

    window.addEventListener(
      "drop",
      preventBrowserFileNavigation
    );

    return () => {
      window.removeEventListener(
        "dragover",
        preventBrowserFileNavigation
      );

      window.removeEventListener(
        "drop",
        preventBrowserFileNavigation
      );
    };
  }, []);

  const buttonStyle: CSSProperties = {};

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title="También podés arrastrar un archivo de proyecto sobre estos botones"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: 3,
        borderRadius: 8,
        outline: isDraggingFile
          ? "2px dashed #7dd3fc"
          : "2px solid transparent",
        background: isDraggingFile
          ? "rgba(125, 211, 252, 0.12)"
          : "transparent",
      }}
    >
      <button
        data-tour="save-project"
        type="button"
        onClick={handleSaveProject}
        title="Guardar proyecto"
        className="file-action-button" style={buttonStyle}
      >
        💾 Guardar
      </button>

      <button
        type="button"
        onClick={handleOpenProject}
        title="Abrir proyecto o soltarlo acá"
        className="file-action-button"
        style={{
          ...buttonStyle,
          borderColor: isDraggingFile ? "#7dd3fc" : undefined,
          color: isDraggingFile ? "#7dd3fc" : undefined,
        }}
      >
        {isDraggingFile
          ? "Soltar proyecto"
          : "📂 Abrir"}
      </button>

      <button
        type="button"
        onClick={handleLoadShrek}
        title="Generar automáticamente la puesta de SHREK sobre las luminarias del proyecto abierto"
        className="file-action-button"
        style={buttonStyle}
      >
        🎭 SHREK
      </button>

      <button
        type="button"
        onClick={handleOpenCueSheet}
        title="Importar una hoja de cues .json"
        className="file-action-button"
        style={buttonStyle}
      >
        ⬇ Cues
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleProjectFileChange}
        style={{
          display: "none",
        }}
      />

      <input
        ref={cueSheetInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleCueSheetFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
