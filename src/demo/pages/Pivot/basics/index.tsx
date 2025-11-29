/**
 * @file Pivot - Basics page
 */
import * as React from "react";
import { PivotBasics } from "../components/PivotBasics";
import PivotBasicsSource from "../components/PivotBasics.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Basics" code={PivotBasicsSource} codeTitle="PivotBasics.tsx" previewHeight={400}>
      <PivotBasics />
    </SingleSamplePage>
  );
};

export default Page;
