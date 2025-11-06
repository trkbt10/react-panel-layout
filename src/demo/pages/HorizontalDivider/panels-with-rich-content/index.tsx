/**
 * @file HorizontalDivider - Panels with Rich Content page
 */
import * as React from "react";
import { PanelsWithRichContent, code as richContentCode } from "../PanelsWithRichContent";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>HorizontalDivider / Panels with Rich Content</h1>
      <div style={{ marginBottom: "1rem" }}>
        <PanelsWithRichContent />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={richContentCode} title="Panels with Rich Content Code" />
      </details>
    </div>
  );
};

export default Page;

