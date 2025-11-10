/**
 * @file PanelLayout - IDE Layout page
 */
import * as React from "react";
import { IDELayout, code as ideLayoutCode } from "../IDELayout";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="PanelLayout / IDE Layout"
      code={ideLayoutCode}
      codeTitle="IDE Layout Code"
      previewHeight={600}
    >
      <IDELayout />
    </SingleSamplePage>
  );
};

export default Page;
