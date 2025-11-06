/**
 * @file Resizable Floating Panels - Edge Resize page
 */
import * as React from "react";
import { ResizableFloatingPanelsPreview } from "../../ResizableFloatingPanelsPreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>Resizable Floating Panels / Edge Resize</h1>
      <ResizableFloatingPanelsPreview />
    </div>
  );
};

export default Page;

