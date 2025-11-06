/**
 * @file HorizontalDivider - Simple resizable panels page
 */
import * as React from "react";
import { SimpleResizablePanels, code as simpleCode } from "../SimpleResizablePanels";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>HorizontalDivider / Simple Resizable Panels</h1>
      <div style={{ marginBottom: "1rem" }}>
        <SimpleResizablePanels />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={simpleCode} title="Simple Resizable Panels Code" />
      </details>
    </div>
  );
};

export default Page;

