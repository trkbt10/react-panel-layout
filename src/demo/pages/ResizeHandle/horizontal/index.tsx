/**
 * @file ResizeHandle - Horizontal resize page
 */
import * as React from "react";
import { HorizontalResizeDemo } from "../components/HorizontalResizeDemo";
import HorizontalResizeDemoSource from "../components/HorizontalResizeDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Horizontal" code={HorizontalResizeDemoSource} codeTitle="HorizontalResizeDemo.tsx">
      <HorizontalResizeDemo />
    </SingleSamplePage>
  );
};

export default Page;
