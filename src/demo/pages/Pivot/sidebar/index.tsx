/**
 * @file Pivot - Sidebar page
 */
import * as React from "react";
import { PivotSidebar, code } from "../components/PivotSidebar";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Sidebar Navigation" code={code} codeTitle="Sidebar Navigation" previewHeight={450}>
      <PivotSidebar />
    </SingleSamplePage>
  );
};

export default Page;
