/**
 * @file Pivot - Sidebar page
 */
import * as React from "react";
import { PivotSidebar, code } from "../PivotSidebar";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Sidebar Navigation" code={code} codeTitle="Sidebar Navigation" previewHeight={450}>
      <PivotSidebar />
    </SingleSamplePage>
  );
};

export default Page;
