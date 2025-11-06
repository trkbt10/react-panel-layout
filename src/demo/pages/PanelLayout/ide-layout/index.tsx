/**
 * @file PanelLayout - IDE Layout page
 */
import * as React from "react";
import { IDELayout, code as ideLayoutCode } from "../IDELayout";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / IDE Layout</h1>
      <div style={{ marginBottom: "1rem" }}>
        <IDELayout />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={ideLayoutCode} title="IDE Layout Code" />
      </details>
    </div>
  );
};

export default Page;

