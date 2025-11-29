/**
 * @file HorizontalDivider - Three Panel Layout page
 */
import * as React from "react";
import { ThreePanelLayout } from "../components/ThreePanelLayout";
import ThreePanelLayoutSource from "../components/ThreePanelLayout.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="HorizontalDivider / Three Panel Layout"
      code={ThreePanelLayoutSource}
      codeTitle="ThreePanelLayout.tsx"
    >
      <ThreePanelLayout />
    </SingleSamplePage>
  );
};

export default Page;
