/**
 * @file FloatingPanelFrame - With Meta sample page
 */
import * as React from "react";
import { PanelWithMeta, code as panelWithMetaCode } from "../components/PanelWithMeta";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="FloatingPanelFrame / With Meta" code={panelWithMetaCode} codeTitle="Panel with Meta Code">
      <PanelWithMeta />
    </SingleSamplePage>
  );
};

export default Page;
