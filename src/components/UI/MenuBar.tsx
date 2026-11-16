import { useEffect, useState } from "react";
import ProjectName from "./ProjectName";
import FileMenu from "./FileMenu";
import AboutModal from "./AboutModal";
import { useAppStore } from "../../store/appStore";
import { createNewProject, saveProjectToFile } from "../../core/project/projectSerializer";
import { useStatusStore } from "../../store/statusStore";
import { useLightingStore } from "../../store/lightingStore";

type MenuBarProps = { onHome?: () => void };

export default function MenuBar({ onHome }: MenuBarProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const openTutorial = useAppStore((state) => state.openTutorial);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        useStatusStore.getState().markSaving();
        saveProjectToFile();
        useStatusStore.getState().markSaved();
      }
      if (key === "n") {
        event.preventDefault();
        if (window.confirm("¿Crear un proyecto nuevo? Los cambios sin guardar se perderán.")) {
          createNewProject();
          useStatusStore.getState().markReady();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="studio-menubar">
        <button className="brand-button" onClick={onHome} title="Volver al launcher">
          <span className="brand-mark">▮▮▮</span>
          <span>LIGHT IT UP</span>
        </button>

        <ProjectName />
        <FileMenu />

        <nav className="desktop-menu" onMouseLeave={() => setMenuOpen(null)}>
          <Menu label="File" open={menuOpen === "file"} onOpen={() => setMenuOpen("file")}
            items={[
              { label: "New Project", shortcut: "⌘/Ctrl N", action: () => { createNewProject(); useStatusStore.getState().markReady(); } },
              { label: "Save", shortcut: "⌘/Ctrl S", action: () => { useStatusStore.getState().markSaving(); saveProjectToFile(); useStatusStore.getState().markSaved(); } },
              { label: "Back to Launcher", action: () => onHome?.() },
            ]}
          />
          <Menu label="Edit" open={menuOpen === "edit"} onOpen={() => setMenuOpen("edit")}
            items={[
              { label: "Undo", shortcut: "⌘/Ctrl Z", action: () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", metaKey: true })) },
              { label: "Redo", shortcut: "⌘/Ctrl ⇧ Z", action: () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", metaKey: true, shiftKey: true })) },
              { label: "Copy Fixtures", shortcut: "⌘/Ctrl C", action: () => useLightingStore.getState().copySelectedLights() },
              { label: "Paste Fixtures", shortcut: "⌘/Ctrl V", action: () => useLightingStore.getState().pasteLights() },
              { label: "Duplicate", shortcut: "⌘/Ctrl D", action: () => useLightingStore.getState().duplicateSelectedLights() },
              { label: "Select All Fixtures", shortcut: "⌘/Ctrl A", action: () => useLightingStore.getState().selectAllLights() },
              { label: "Deselect", shortcut: "Esc", action: () => useLightingStore.getState().clearLightSelection() },
              { label: "Group Selection", shortcut: "⌘/Ctrl G", action: () => useLightingStore.getState().createGroupFromSelection() },
              { label: "Delete Selection", shortcut: "⌫ / Del", action: () => useLightingStore.getState().removeSelectedLights() },
            ]}
          />
          <Menu label="View" open={menuOpen === "view"} onOpen={() => setMenuOpen("view")}
            items={[{ label: "Reset interface", action: () => window.location.reload() }]}
          />
          <Menu label="Help" open={menuOpen === "help"} onOpen={() => setMenuOpen("help")}
            items={[
              { label: "First Steps", action: openTutorial },
              { label: "About Light It Up", action: () => setAboutOpen(true) },
            ]}
          />
        </nav>
      </header>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </>
  );
}

type MenuItem = { label: string; shortcut?: string; action: () => void };
type MenuProps = { label: string; open: boolean; onOpen: () => void; items: MenuItem[] };

function Menu({ label, open, onOpen, items }: MenuProps) {
  return (
    <div className="menu-root">
      <button className={open ? "menu-trigger menu-trigger-active" : "menu-trigger"} onClick={onOpen}>{label}</button>
      {open && (
        <div className="menu-popover">
          {items.map((item) => (
            <button key={item.label} onClick={() => { item.action(); }}>
              <span>{item.label}</span><kbd>{item.shortcut}</kbd>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
