/**
 * @file ResizeHandle - Vertical resize page
 */
import * as React from "react";
import { VerticalResizeDemo, code as verticalCode } from "../VerticalResizeDemo";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>ResizeHandle / Vertical</h1>
      <div style={{ marginBottom: "1rem" }}>
        <VerticalResizeDemo />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={verticalCode} title="Vertical Resize Code" />
      </details>
    </div>
  );
};

export default Page;

