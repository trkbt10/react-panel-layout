/**
 * @file Stack - Tablet demo page
 */
import * as React from "react";
import { StackTablet } from "../components/StackTablet";
import StackTabletSource from "../components/StackTablet.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Stack / Tablet"
      code={StackTabletSource}
      codeTitle="StackTablet.tsx"
      previewHeight={600}
    >
      <StackTablet />
    </SingleSamplePage>
  );
};

export default Page;
