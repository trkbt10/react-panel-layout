/**
 * @file PanelLayout - Simple Grid page
 */
import * as React from "react";
import { SimpleGrid, code as simpleGridCode } from "../SimpleGrid";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / Simple Grid</h1>
      <div style={{ marginBottom: "1rem", height: "400px" }}>
        <SimpleGrid />
      </div>
      <CodePreview code={simpleGridCode} title="Simple Grid Code" />
    </div>
  );
};

export default Page;

