/**
 * @file PanelLayout - Simple Grid page
 */
import * as React from "react";
import { SimpleGrid, code as simpleGridCode } from "../SimpleGrid";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / Simple Grid</h1>
      <div style={{ marginBottom: "1rem" }}>
        <SimpleGrid />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={simpleGridCode} title="Simple Grid Code" />
      </details>
    </div>
  );
};

export default Page;

