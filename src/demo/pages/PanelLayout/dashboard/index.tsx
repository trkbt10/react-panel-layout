/**
 * @file PanelLayout - Dashboard Layout page
 */
import * as React from "react";
import { DashboardLayout, code as dashboardLayoutCode } from "../DashboardLayout";
import { CodePreview } from "../../../components/CodePreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelLayout / Dashboard</h1>
      <div style={{ marginBottom: "1rem", height: "600px" }}>
        <DashboardLayout />
      </div>
      <CodePreview code={dashboardLayoutCode} title="Dashboard Layout Code" />
    </div>
  );
};

export default Page;

