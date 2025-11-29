/**
 * @file FloatingPanelFrame - With Meta sample page
 */
import * as React from "react";
import { PanelWithMeta } from "../components/PanelWithMeta";
import PanelWithMetaSource from "../components/PanelWithMeta.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="FloatingPanelFrame / With Meta" code={PanelWithMetaSource} codeTitle="PanelWithMeta.tsx">
      <PanelWithMeta />
    </SingleSamplePage>
  );
};

export default Page;
