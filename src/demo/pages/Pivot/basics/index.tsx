/**
 * @file Pivot - Basics page
 */
import * as React from "react";
import { PivotBasics, code } from "../components/PivotBasics";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Basics" code={code} codeTitle="usePivot Hook" previewHeight={400}>
      <PivotBasics />
    </SingleSamplePage>
  );
};

export default Page;
