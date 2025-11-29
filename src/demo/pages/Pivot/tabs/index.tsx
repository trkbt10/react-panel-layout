/**
 * @file Pivot - Tabs page
 */
import * as React from "react";
import { PivotTabs } from "../components/PivotTabs";
import PivotTabsSource from "../components/PivotTabs.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Tab Navigation" code={PivotTabsSource} codeTitle="PivotTabs.tsx" previewHeight={400}>
      <PivotTabs />
    </SingleSamplePage>
  );
};

export default Page;
