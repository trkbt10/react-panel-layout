/**
 * @file Drawer - Menu layout page
 */
import * as React from "react";
import { DrawerMenuLayout } from "../components/DrawerMenuLayout";
import DrawerMenuLayoutSource from "../components/DrawerMenuLayout.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Drawer / Menu" code={DrawerMenuLayoutSource} codeTitle="DrawerMenuLayout.tsx" previewHeight={640}>
      <DrawerMenuLayout />
    </SingleSamplePage>
  );
};

export default Page;
