/**
 * @file ResizeHandle - Both directions page
 */
import * as React from "react";
import { BothDirectionsDemo, code as bothCode } from "../BothDirectionsDemo";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>ResizeHandle / Both Directions</h1>
      <div style={{ marginBottom: "1rem" }}>
        <BothDirectionsDemo />
      </div>
      <CodePreview code={bothCode} title="Both Directions Code" />
    </div>
  );
};

export default Page;

