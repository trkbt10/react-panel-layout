/**
 * @file ResizeHandle - Nested panels page
 */
import * as React from "react";
import { NestedPanelsDemo, code as nestedPanelsCode } from "../NestedPanelsDemo";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Nested Panels" code={nestedPanelsCode} codeTitle="Nested Panels Code">
      <NestedPanelsDemo />
    </SingleSamplePage>
  );
};

export default Page;
