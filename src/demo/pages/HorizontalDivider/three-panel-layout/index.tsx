/**
 * @file HorizontalDivider - Three Panel Layout page
 */
import * as React from "react";
import { ThreePanelLayout, code as threePanelCode } from "../components/ThreePanelLayout";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="HorizontalDivider / Three Panel Layout"
      code={threePanelCode}
      codeTitle="Three Panel Layout Code"
    >
      <ThreePanelLayout />
    </SingleSamplePage>
  );
};

export default Page;
