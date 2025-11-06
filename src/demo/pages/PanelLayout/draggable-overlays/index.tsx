/**
 * @file PanelLayout - Draggable Overlays page
 */
import * as React from "react";
import { DraggableOverlays, code as draggableOverlaysCode } from "../DraggableOverlays";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / Draggable Overlays</h1>
      <div style={{ marginBottom: "1rem" }}>
        <DraggableOverlays />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={draggableOverlaysCode} title="Draggable Overlays Code" />
      </details>
    </div>
  );
};

export default Page;

