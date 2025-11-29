/**
 * @file PanelLayout - Draggable Overlays page
 */
import * as React from "react";
import { DraggableOverlays } from "../components/DraggableOverlays";
import DraggableOverlaysSource from "../components/DraggableOverlays.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / Draggable Overlays"
      code={DraggableOverlaysSource}
      codeTitle="DraggableOverlays.tsx"
      previewHeight={600}
    >
      <DraggableOverlays />
    </SingleSamplePage>
  );
};

export default Page;
