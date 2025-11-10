/**
 * @file ResizeHandle - Horizontal resize page
 */
import * as React from "react";
import { HorizontalResizeDemo, code as horizontalCode } from "../HorizontalResizeDemo";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>ResizeHandle / Horizontal</h1>
      <div style={{ marginBottom: "1rem" }}>
        <HorizontalResizeDemo />
      </div>
      <CodePreview code={horizontalCode} title="Horizontal Resize Code" />
    </div>
  );
};

export default Page;

