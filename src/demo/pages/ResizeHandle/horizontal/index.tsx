/**
 * @file ResizeHandle - Horizontal resize page
 */
import * as React from "react";
import { HorizontalResizeDemo, code as horizontalCode } from "../components/HorizontalResizeDemo";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="ResizeHandle / Horizontal" code={horizontalCode} codeTitle="Horizontal Resize Code">
      <HorizontalResizeDemo />
    </SingleSamplePage>
  );
};

export default Page;
