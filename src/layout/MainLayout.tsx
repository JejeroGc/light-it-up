import EditorScene from "../scenes/EditorScene";
import FixtureList from "../components/UI/FixtureList";
import Inspector from "../components/UI/Inspector";
import StagePanel from "../components/UI/StagePanel";
import ViewportToolbar from "../components/UI/ViewportToolbar";
import ViewportOverlay from "../components/UI/ViewportOverlay";
import ViewCube from "../components/UI/ViewCube";
import MenuBar from "../components/UI/MenuBar";
import StatusBar from "../components/UI/StatusBar";
import HistoryController from "../components/system/HistoryController";
import ProjectStatusController from "../components/system/ProjectStatusController";
import TimelinePanel from "../components/timeline/TimelinePanel";
import ProgrammerPanel from "../components/UI/ProgrammerPanel";
import RiderImportModal from "../components/UI/RiderImportModal";
import { useState } from "react";
import { useVenueStore } from "../store/venueStore";
import { applyAuditorioBelgranoVenue, applyEspacioAguirreVenue } from "../core/project/applyVenuePreset";

type MainLayoutProps = { onHome?: () => void };

export default function MainLayout({ onHome }: MainLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [riderOpen, setRiderOpen] = useState(false);
  const activeVenueName = useVenueStore((state) => state.activeVenueName);
  const loadVenue = (venue: "belgrano" | "aguirre") => venue === "aguirre" ? applyEspacioAguirreVenue() : applyAuditorioBelgranoVenue();
  return (
    <div className={`studio-layout ${!leftOpen ? "panel-left-collapsed" : ""} ${!rightOpen ? "panel-right-collapsed" : ""} ${!timelineOpen ? "timeline-collapsed" : ""}`}>
      <HistoryController />
      <ProjectStatusController />
      <MenuBar onHome={onHome} />
      <div className="workspace-controls">
        <button onClick={() => setLeftOpen(v => !v)} title="Mostrar/ocultar inventario y escenario">{leftOpen ? "◀ Panel" : "▶ Panel"}</button>
        <button onClick={() => setRightOpen(v => !v)} title="Mostrar/ocultar inspector y programmer">{rightOpen ? "Panel ▶" : "Panel ◀"}</button>
        <button onClick={() => setTimelineOpen(v => !v)} title="Mostrar/ocultar timeline">{timelineOpen ? "▼ Timeline" : "▲ Timeline"}</button>
        <button className="rider-import-button" onClick={() => setRiderOpen(true)} title="Importar rider técnico">📄 RIDER</button>
        <button className="venue-preset-button" onClick={() => setRiderOpen(true)} title="Venue activo / importar otro rider">{activeVenueName}</button>
      </div>

      <aside data-tour="fixture-list" className="studio-panel studio-panel-left" aria-hidden={!leftOpen}>
        <FixtureList />
        <div style={{ marginTop: 24 }}><StagePanel /></div>
      </aside>

      <main data-tour="viewport" className="studio-viewport">
        <ViewportToolbar />
        <ViewportOverlay />
        <ViewCube />
        <EditorScene />
      </main>

      <aside data-tour="inspector" className="studio-panel studio-panel-right" aria-hidden={!rightOpen}>
        <Inspector />
        <ProgrammerPanel />
      </aside>

      <footer data-tour="timeline" className="studio-timeline" aria-hidden={!timelineOpen}>
        <TimelinePanel />
      </footer>

      <StatusBar />
      <RiderImportModal open={riderOpen} onClose={() => setRiderOpen(false)} onVenueCreated={loadVenue} />
    </div>
  );
}
