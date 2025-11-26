/**
 * @file Pivot - Transitions page
 */
import * as React from "react";
import { PivotTransitions, code } from "../PivotTransitions";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Pivot / Transitions" code={code} codeTitle="Transition Options" previewHeight={600}>
      <PivotTransitions />
    </SingleSamplePage>
  );
};

export default Page;
