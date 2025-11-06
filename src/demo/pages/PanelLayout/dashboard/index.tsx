/**
 * @file PanelLayout - Dashboard Layout page
 */
import * as React from "react";
import { DashboardLayout, code as dashboardLayoutCode } from "../DashboardLayout";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / Dashboard</h1>
      <div style={{ marginBottom: "1rem" }}>
        <DashboardLayout />
      </div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={dashboardLayoutCode} title="Dashboard Layout Code" />
      </details>
    </div>
  );
};

export default Page;

