/**
 * @file ResizeHandle - Vertical resize page
 */
import * as React from "react";
import { VerticalResizeDemo, code as verticalCode } from "../components/VerticalResizeDemo";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Vertical" code={verticalCode} codeTitle="Vertical Resize Code">
      <VerticalResizeDemo />
    </SingleSamplePage>
  );
};

export default Page;
