/**
 * @file PanelLayout - Simple Grid page
 */
import * as React from "react";
import { SimpleGrid, code as simpleGridCode } from "../SimpleGrid";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / Simple Grid"
      code={simpleGridCode}
      codeTitle="Simple Grid Code"
      previewHeight={400}
    >
      <SimpleGrid />
    </SingleSamplePage>
  );
};

export default Page;
