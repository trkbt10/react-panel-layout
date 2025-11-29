/**
 * @file PanelLayout - Draggable Overlays page
 */
import * as React from "react";
import { DraggableOverlays, code as draggableOverlaysCode } from "../components/DraggableOverlays";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / Draggable Overlays"
      code={draggableOverlaysCode}
      codeTitle="Draggable Overlays Code"
      previewHeight={600}
    >
      <DraggableOverlays />
    </SingleSamplePage>
  );
};

export default Page;
