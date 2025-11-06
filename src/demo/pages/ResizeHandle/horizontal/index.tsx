/**
 * @file ResizeHandle - Horizontal resize page
 */
import * as React from "react";
import { HorizontalResizeDemo, code as horizontalCode } from "../HorizontalResizeDemo";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>ResizeHandle / Horizontal</h1>
      <div style={{ marginBottom: "1rem" }}>
        <HorizontalResizeDemo />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={horizontalCode} title="Horizontal Resize Code" />
      </details>
    </div>
  );
};

export default Page;

