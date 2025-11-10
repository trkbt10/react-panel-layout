/**
 * @file FloatingPanelFrame - Basic sample page (single sample)
 */
import * as React from "react";
import { BasicPanel, code as basicPanelCode } from "../BasicPanel";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="FloatingPanelFrame / Basic" code={basicPanelCode} codeTitle="Basic Panel Code">
      <BasicPanel />
    </SingleSamplePage>
  );
};

export default Page;
