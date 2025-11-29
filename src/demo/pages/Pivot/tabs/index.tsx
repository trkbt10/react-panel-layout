/**
 * @file Pivot - Tabs page
 */
import * as React from "react";
import { PivotTabs, code } from "../components/PivotTabs";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Tab Navigation" code={code} codeTitle="Tab Navigation" previewHeight={400}>
      <PivotTabs />
    </SingleSamplePage>
  );
};

export default Page;
