/**
 * @file PanelLayout - Simple Grid page
 */
import * as React from "react";
import { SimpleGrid } from "../components/SimpleGrid";
import SimpleGridSource from "../components/SimpleGrid.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / Simple Grid"
      code={SimpleGridSource}
      codeTitle="SimpleGrid.tsx"
      previewHeight={400}
    >
      <SimpleGrid />
    </SingleSamplePage>
  );
};

export default Page;
