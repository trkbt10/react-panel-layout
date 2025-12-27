/**
 * @file Dialog - Alerts page
 */
import * as React from "react";
import { AlertDialogDemo } from "../components/AlertDialogDemo";
import AlertDialogDemoSource from "../components/AlertDialogDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Dialog / Alert, Confirm, Prompt"
      code={AlertDialogDemoSource}
      codeTitle="AlertDialogDemo.tsx"
      previewHeight={520}
    >
      <AlertDialogDemo />
    </SingleSamplePage>
  );
};

export default Page;
