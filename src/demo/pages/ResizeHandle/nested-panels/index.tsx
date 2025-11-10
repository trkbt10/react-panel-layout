/**
 * @file ResizeHandle - Nested panels page
 */
import * as React from "react";
import { NestedPanelsDemo, code as nestedPanelsCode } from "../NestedPanelsDemo";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>ResizeHandle / Nested Panels</h1>
      <div style={{ marginBottom: "1rem" }}>
        <NestedPanelsDemo />
      </div>
      <CodePreview code={nestedPanelsCode} title="Nested Panels Code" />
    </div>
  );
};

export default Page;

