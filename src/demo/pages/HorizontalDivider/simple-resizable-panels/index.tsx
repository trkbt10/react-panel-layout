/**
 * @file HorizontalDivider - Simple resizable panels page
 */
import * as React from "react";
import { SimpleResizablePanels, code as simpleCode } from "../components/SimpleResizablePanels";
import { SingleSamplePage } from "../../../components/layout";

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
