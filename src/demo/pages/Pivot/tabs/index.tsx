/**
 * @file Pivot - Tabs page
 */
import * as React from "react";
import { PivotTabs, code } from "../PivotTabs";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Tab Navigation" code={code} codeTitle="Tab Navigation" previewHeight={400}>
      <PivotTabs />
    </SingleSamplePage>
  );
};

export default Page;
