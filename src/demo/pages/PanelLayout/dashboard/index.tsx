/**
 * @file PanelLayout - Dashboard Layout page
 */
import * as React from "react";
import { DashboardLayout, code as dashboardLayoutCode } from "../components/DashboardLayout";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / Dashboard"
      code={dashboardLayoutCode}
      codeTitle="Dashboard Layout Code"
      previewHeight={600}
    >
      <DashboardLayout />
    </SingleSamplePage>
  );
};

export default Page;
