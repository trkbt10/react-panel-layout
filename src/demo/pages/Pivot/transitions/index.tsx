/**
 * @file Pivot - Transitions page
 */
import * as React from "react";
import { PivotTransitions } from "../components/PivotTransitions";
import PivotTransitionsSource from "../components/PivotTransitions.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Transitions" code={PivotTransitionsSource} codeTitle="PivotTransitions.tsx" previewHeight={600}>
      <PivotTransitions />
    </SingleSamplePage>
  );
};

export default Page;
