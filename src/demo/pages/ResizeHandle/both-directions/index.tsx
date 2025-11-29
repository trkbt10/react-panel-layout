/**
 * @file ResizeHandle - Both directions page
 */
import * as React from "react";
import { BothDirectionsDemo } from "../components/BothDirectionsDemo";
import BothDirectionsDemoSource from "../components/BothDirectionsDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Both Directions" code={BothDirectionsDemoSource} codeTitle="BothDirectionsDemo.tsx">
      <BothDirectionsDemo />
    </SingleSamplePage>
  );
};

export default Page;
