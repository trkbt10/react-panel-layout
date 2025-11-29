/**
 * @file ResizeHandle - Vertical resize page
 */
import * as React from "react";
import { VerticalResizeDemo } from "../components/VerticalResizeDemo";
import VerticalResizeDemoSource from "../components/VerticalResizeDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Vertical" code={VerticalResizeDemoSource} codeTitle="VerticalResizeDemo.tsx">
      <VerticalResizeDemo />
    </SingleSamplePage>
  );
};

export default Page;
