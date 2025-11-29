/**
 * @file PanelLayout - IDE Layout page
 */
import * as React from "react";
import { IDELayout } from "../components/IDELayout";
import IDELayoutSource from "../components/IDELayout.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / IDE Layout"
      code={IDELayoutSource}
      codeTitle="IDELayout.tsx"
      previewHeight={600}
    >
      <IDELayout />
    </SingleSamplePage>
  );
};

export default Page;
