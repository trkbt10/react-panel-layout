/**
 * @file Responsive Layout - Adaptive workspace page
 */
import * as React from "react";
import { ResponsiveWorkspace, code } from "../ResponsiveWorkspace";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Responsive Layout / Adaptive Workspace"
      code={code}
      codeTitle="Responsive Layout Code"
      maxWidth={1400}
    >
      <ResponsiveWorkspace />
    </SingleSamplePage>
  );
};

export default Page;
