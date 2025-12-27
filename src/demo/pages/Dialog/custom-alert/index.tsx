/**
 * @file Dialog - Custom Alert page
 */
import * as React from "react";
import { CustomAlertDialogDemo } from "../components/CustomAlertDialogDemo";
import CustomAlertDialogDemoSource from "../components/CustomAlertDialogDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Dialog / Custom Alert Component"
      code={CustomAlertDialogDemoSource}
      codeTitle="CustomAlertDialogDemo.tsx"
      previewHeight={520}
    >
      <CustomAlertDialogDemo />
    </SingleSamplePage>
  );
};

export default Page;
