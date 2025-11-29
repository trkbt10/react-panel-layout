/**
 * @file Pivot - Sidebar page
 */
import * as React from "react";
import { PivotSidebar } from "../components/PivotSidebar";
import PivotSidebarSource from "../components/PivotSidebar.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Sidebar Navigation" code={PivotSidebarSource} codeTitle="PivotSidebar.tsx" previewHeight={450}>
      <PivotSidebar />
    </SingleSamplePage>
  );
};

export default Page;
