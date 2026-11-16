import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from "react";

import launcherReference from "../../assets/landing/launcher-reference.png";
import {
  applyProjectSnapshot,
  createNewProject,
  loadProjectFromFile,
} from "../../core/project/projectSerializer";
import {
  getRecentProjects,
  removeRecentProject,
  type RecentProject,
} from "../../core/project/recentProjects";
import { useAppStore } from "../../store/appStore";
import RiderImportModal from "../UI/RiderImportModal";
import { applyAuditorioBelgranoVenue, applyEspacioAguirreVenue } from "../../core/project/applyVenuePreset";

type LandingPageProps = {
  onEditorOpen?: () => void;
};

export default function LandingPage({ onEditorOpen }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [riderOpen, setRiderOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(() =>
    getRecentProjects()
  );
  const { openEditor } = useAppStore();

  const startNewProject = () => {
    setIsLaunching(true);
    createNewProject();
    onEditorOpen?.();
    window.setTimeout(() => openEditor(false), 260);
  };

  const createVenueFromRider = (venue: "belgrano" | "aguirre") => {
    if (venue === "aguirre") applyEspacioAguirreVenue(); else applyAuditorioBelgranoVenue();
    setIsLaunching(true);
    onEditorOpen?.();
    window.setTimeout(() => openEditor(false), 260);
  };

  const startTutorial = () => {
    setIsLaunching(true);
    createNewProject();
    onEditorOpen?.();
    window.setTimeout(() => openEditor(true), 260);
  };

  const openRecentProject = (recentProject: RecentProject) => {
    try {
      applyProjectSnapshot(recentProject.snapshot);
      setRecentProjects(getRecentProjects());
      setIsLaunching(true);
      onEditorOpen?.();
      window.setTimeout(() => openEditor(false), 260);
    } catch (error) {
      console.error("No se pudo abrir el proyecto reciente:", error);
      setStatusMessage("No se pudo recuperar ese proyecto reciente.");
    }
  };

  const forgetRecentProject = (event: MouseEvent, id: string) => {
    event.stopPropagation();
    setRecentProjects(removeRecentProject(id));
  };

  const openProjectFile = async (file: File) => {
    setStatusMessage("Abriendo proyecto…");

    try {
      await loadProjectFromFile(file);
      setIsLaunching(true);
      onEditorOpen?.();
      window.setTimeout(() => openEditor(false), 260);
    } catch (error) {
      console.error("No se pudo abrir el proyecto:", error);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "El archivo seleccionado no es válido."
      );
    }
  };

  const handleProjectFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      await openProjectFile(file);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await openProjectFile(file);
    }
  };

  useEffect(() => {
    const preventBrowserNavigation = (event: globalThis.DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) {
        event.preventDefault();
      }
    };

    window.addEventListener("dragover", preventBrowserNavigation);
    window.addEventListener("drop", preventBrowserNavigation);

    return () => {
      window.removeEventListener("dragover", preventBrowserNavigation);
      window.removeEventListener("drop", preventBrowserNavigation);
    };
  }, []);

  return (
    <main
      className={`launcher-page launcher-reference-page ${isLaunching ? "launcher-page-leaving" : ""} ${
        isDraggingFile ? "launcher-drop-active" : ""
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDraggingFile(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDraggingFile(false);
        }
      }}
      onDrop={handleDrop}
    >
      <img
        className="launcher-reference-image"
        src={launcherReference}
        alt="Light It Up — launcher"
      />

      <button
        className="launcher-hotspot launcher-hotspot-new"
        onClick={startNewProject}
        aria-label="Nuevo proyecto"
      />

      <button
        className="launcher-rider-button"
        onClick={() => setRiderOpen(true)}
        type="button"
      ><span>✨ PRO</span><strong>IMPORTAR RIDER</strong><small>PDF · imagen · DOCX</small></button>

      <button
        className="launcher-hotspot launcher-hotspot-open"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Abrir proyecto"
      />

      <button
        className="launcher-hotspot launcher-hotspot-tutorial"
        onClick={startTutorial}
        aria-label="Primeros pasos"
      />


      <section className="launcher-recent-projects" aria-label="Proyectos recientes">
        {recentProjects.map((recentProject, index) => (
          <button
            key={recentProject.id}
            type="button"
            className={`launcher-recent-card launcher-recent-card-${index + 1}`}
            onClick={() => openRecentProject(recentProject)}
            title={`Abrir ${recentProject.name}`}
          >
            <span className="launcher-recent-icon" aria-hidden="true">▰</span>
            <span className="launcher-recent-copy">
              <strong>{recentProject.name}</strong>
              <small>Guardado {new Date(recentProject.updatedAt).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}</small>
            </span>
            <span
              className="launcher-recent-remove"
              role="button"
              tabIndex={0}
              aria-label={`Quitar ${recentProject.name} de recientes`}
              onClick={(event) => forgetRecentProject(event, recentProject.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setRecentProjects(removeRecentProject(recentProject.id));
                }
              }}
            >×</span>
          </button>
        ))}
      </section>

      {statusMessage && (
        <div className="launcher-reference-status" role="status">
          {statusMessage}
        </div>
      )}

      {isDraggingFile && (
        <div className="launcher-drop-overlay">
          <div>
            <span aria-hidden="true">⇩</span>
            <strong>Soltá el proyecto para abrirlo</strong>
            <small>Light It Up verificará el archivo antes de cargarlo.</small>
          </div>
        </div>
      )}

      <RiderImportModal open={riderOpen} onClose={() => setRiderOpen(false)} onVenueCreated={createVenueFromRider} />

      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        accept=".lightitup,application/json"
        onChange={handleProjectFileChange}
      />
    </main>
  );
}
