import { useLightingStore } from "../../store/lightingStore";
import { useViewportStore } from "../../store/viewportStore";

export default function ViewportOverlay() {
  const { lights, selectedLightId, selectedLightIds } = useLightingStore();
  const { viewMode, isDirectDraggingFixture } = useViewportStore();

  const selectedLight = lights.find((light) => light.id === selectedLightId);

  return (
    <div className="viewport-info-overlay">
      <div className="viewport-info-row">
        <span>VIEW</span>
        <strong>{viewMode.toUpperCase()}</strong>
      </div>
      <div className="viewport-info-row">
        <span>FIXTURES</span>
        <strong>{lights.length}</strong>
      </div>
      <div className="viewport-info-row">
        <span>SELECTED</span>
        <strong>
          {selectedLightIds.length > 1
            ? `${selectedLightIds.length} fixtures`
            : selectedLight
              ? selectedLight.name
              : "None"}
        </strong>
      </div>
      <div className="viewport-shortcuts">
        <span>Shift/Cmd + click · multi-select</span>
        <span>Alt + drag · duplicate</span>
        <span>Cmd/Ctrl + D · duplicate selection</span>
        <span>Delete · remove</span>
      </div>
      {isDirectDraggingFixture && (
        <div className="viewport-drag-status">MOVING FIXTURE</div>
      )}
    </div>
  );
}
