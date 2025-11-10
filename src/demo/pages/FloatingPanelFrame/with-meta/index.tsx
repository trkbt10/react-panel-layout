/**
 * @file FloatingPanelFrame - With Meta sample page
 */
import * as React from "react";
import { PanelWithMeta, code as panelWithMetaCode } from "../PanelWithMeta";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>FloatingPanelFrame / With Meta</h1>
      <div style={{ marginBottom: "1rem" }}>
        <PanelWithMeta />
      </div>
      <CodePreview code={panelWithMetaCode} title="Panel with Meta Code" />
    </div>
  );
};

export default Page;

