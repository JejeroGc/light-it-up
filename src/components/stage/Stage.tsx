import { useStageStore } from "../../store/stageStore";
import { useViewportStore } from "../../store/viewportStore";

import Floor from "./Floor";
import Cyclorama from "./Cyclorama";
import HangingBar from "./HangingBar";
import StageArchitecture from "./StageArchitecture";
import StageDrapery from "./StageDrapery";

export default function Stage() {
  const { width, depth, height, bars, selectedBarId, selectBar } =
    useStageStore();

  const { snapPreviewBarId } = useViewportStore();

  return (
    <>
      <StageArchitecture width={width} depth={depth} height={height} />
      <StageDrapery width={width} depth={depth} height={height} />
      <Floor width={width} depth={depth} />

      <Cyclorama width={width} depth={depth} height={height} />

      {bars.map((bar) => (
        <HangingBar
          key={bar.id}
          width={bar.width}
          x={bar.x}
          y={bar.y}
          z={bar.z}
          label={bar.name}
          selected={selectedBarId === bar.id}
          snapPreview={snapPreviewBarId === bar.id}
          onSelect={() => selectBar(bar.id)}
        />
      ))}
    </>
  );
}