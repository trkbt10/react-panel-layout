/**
 * @file ResizeHandle - Vertical resize page
 */
import * as React from "react";
import { VerticalResizeDemo, code as verticalCode } from "../VerticalResizeDemo";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Vertical" code={verticalCode} codeTitle="Vertical Resize Code">
      <VerticalResizeDemo />
    </SingleSamplePage>
  );
};

export default Page;
