/**
 * @file ResizeHandle - Both directions page
 */
import * as React from "react";
import { BothDirectionsDemo, code as bothCode } from "../BothDirectionsDemo";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>ResizeHandle / Both Directions</h1>
      <div style={{ marginBottom: "1rem" }}>
        <BothDirectionsDemo />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={bothCode} title="Both Directions Code" />
      </details>
    </div>
  );
};

export default Page;

