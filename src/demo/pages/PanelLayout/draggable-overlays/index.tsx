/**
 * @file PanelLayout - Draggable Overlays page
 */
import * as React from "react";
import { DraggableOverlays, code as draggableOverlaysCode } from "../DraggableOverlays";
import { SingleSamplePage } from "../../components";

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
