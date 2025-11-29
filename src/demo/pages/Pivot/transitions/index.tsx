/**
 * @file Pivot - Transitions page
 */
import * as React from "react";
import { PivotTransitions, code } from "../components/PivotTransitions";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Transitions" code={code} codeTitle="Transition Options" previewHeight={600}>
      <PivotTransitions />
    </SingleSamplePage>
  );
};

export default Page;
