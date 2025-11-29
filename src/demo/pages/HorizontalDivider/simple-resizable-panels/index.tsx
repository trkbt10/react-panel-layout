/**
 * @file HorizontalDivider - Simple resizable panels page
 */
import * as React from "react";
import { SimpleResizablePanels } from "../components/SimpleResizablePanels";
import SimpleResizablePanelsSource from "../components/SimpleResizablePanels.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="HorizontalDivider / Simple Resizable Panels"
      code={SimpleResizablePanelsSource}
      codeTitle="SimpleResizablePanels.tsx"
    >
      <SimpleResizablePanels />
    </SingleSamplePage>
  );
};

export default Page;
