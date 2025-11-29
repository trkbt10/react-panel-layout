/**
 * @file Responsive Layout - Adaptive workspace page
 */
import * as React from "react";
import { ResponsiveWorkspace } from "../components/ResponsiveWorkspace";
import ResponsiveWorkspaceSource from "../components/ResponsiveWorkspace.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Responsive Layout / Adaptive Workspace"
      code={ResponsiveWorkspaceSource}
      codeTitle="ResponsiveWorkspace.tsx"
      maxWidth={1400}
    >
      <ResponsiveWorkspace />
    </SingleSamplePage>
  );
};

export default Page;
