/**
 * @file PanelLayout - Dashboard Layout page
 */
import * as React from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import DashboardLayoutSource from "../components/DashboardLayout.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / Dashboard"
      code={DashboardLayoutSource}
      codeTitle="DashboardLayout.tsx"
      previewHeight={600}
    >
      <DashboardLayout />
    </SingleSamplePage>
  );
};

export default Page;
