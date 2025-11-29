/**
 * @file ResizeHandle - Nested panels page
 */
import * as React from "react";
import { NestedPanelsDemo } from "../components/NestedPanelsDemo";
import NestedPanelsDemoSource from "../components/NestedPanelsDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Nested Panels" code={NestedPanelsDemoSource} codeTitle="NestedPanelsDemo.tsx">
      <NestedPanelsDemo />
    </SingleSamplePage>
  );
};

export default Page;
