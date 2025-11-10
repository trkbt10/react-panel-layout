/**
 * @file HorizontalDivider - Three Panel Layout page
 */
import * as React from "react";
import { ThreePanelLayout, code as threePanelCode } from "../ThreePanelLayout";
import { SingleSamplePage } from "../../components";

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
