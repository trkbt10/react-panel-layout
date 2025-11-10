/**
 * @file PanelLayout - Draggable Overlays page
 */
import * as React from "react";
import { DraggableOverlays, code as draggableOverlaysCode } from "../DraggableOverlays";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / Draggable Overlays</h1>
      <div style={{ marginBottom: "1rem", height: "600px" }}>
        <DraggableOverlays />
      </div>
      <CodePreview code={draggableOverlaysCode} title="Draggable Overlays Code" />
    </div>
  );
};

export default Page;

