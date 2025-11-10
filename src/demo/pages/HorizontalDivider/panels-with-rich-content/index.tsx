/**
 * @file HorizontalDivider - Panels with Rich Content page
 */
import * as React from "react";
import { PanelsWithRichContent, code as richContentCode } from "../PanelsWithRichContent";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>HorizontalDivider / Panels with Rich Content</h1>
      <div style={{ marginBottom: "1rem" }}>
        <PanelsWithRichContent />
      </div>
      <CodePreview code={richContentCode} title="Panels with Rich Content Code" />
    </div>
  );
};

export default Page;

