/**
 * @file HorizontalDivider - Simple resizable panels page
 */
import * as React from "react";
import { SimpleResizablePanels, code as simpleCode } from "../SimpleResizablePanels";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>HorizontalDivider / Simple Resizable Panels</h1>
      <div style={{ marginBottom: "1rem" }}>
        <SimpleResizablePanels />
      </div>
      <CodePreview code={simpleCode} title="Simple Resizable Panels Code" />
    </div>
  );
};

export default Page;

