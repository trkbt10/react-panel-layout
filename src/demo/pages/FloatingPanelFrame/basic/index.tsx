/**
 * @file FloatingPanelFrame - Basic sample page (single sample)
 */
import * as React from "react";
import { BasicPanel } from "../components/BasicPanel";
import BasicPanelSource from "../components/BasicPanel.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="FloatingPanelFrame / Basic" code={BasicPanelSource} codeTitle="BasicPanel.tsx">
      <BasicPanel />
    </SingleSamplePage>
  );
};

export default Page;
