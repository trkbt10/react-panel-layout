/**
 * @file ResizeHandle - Both directions page
 */
import * as React from "react";
import { BothDirectionsDemo, code as bothCode } from "../components/BothDirectionsDemo";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Both Directions" code={bothCode} codeTitle="Both Directions Code">
      <BothDirectionsDemo />
    </SingleSamplePage>
  );
};

export default Page;
