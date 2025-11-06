/**
 * @file HorizontalDivider - Three Panel Layout page
 */
import * as React from "react";
import { ThreePanelLayout, code as threePanelCode } from "../ThreePanelLayout";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>HorizontalDivider / Three Panel Layout</h1>
      <div style={{ marginBottom: "1rem" }}>
        <ThreePanelLayout />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={threePanelCode} title="Three Panel Layout Code" />
      </details>
    </div>
  );
};

export default Page;

