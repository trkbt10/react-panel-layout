/**
 * @file FloatingPanelFrame - Basic sample page (single sample)
 */
import * as React from "react";
import { BasicPanel, code as basicPanelCode } from "../BasicPanel";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>FloatingPanelFrame / Basic</h1>
      <div style={{ marginBottom: "1rem" }}>
        <BasicPanel />
      </div>
      <CodePreview code={basicPanelCode} title="Basic Panel Code" />
    </div>
  );
};

export default Page;

