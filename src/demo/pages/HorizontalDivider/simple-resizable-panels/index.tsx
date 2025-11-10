/**
 * @file HorizontalDivider - Simple resizable panels page
 */
import * as React from "react";
import { SimpleResizablePanels, code as simpleCode } from "../SimpleResizablePanels";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="HorizontalDivider / Simple Resizable Panels"
      code={simpleCode}
      codeTitle="Simple Resizable Panels Code"
    >
      <SimpleResizablePanels />
    </SingleSamplePage>
  );
};

export default Page;
