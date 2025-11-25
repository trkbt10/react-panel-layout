/**
 * @file Drawer - Menu layout page
 */
import * as React from "react";
import { DrawerMenuLayout, code } from "../DrawerMenuLayout";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Drawer / Menu" code={code} codeTitle="Drawer Menu Code" previewHeight={640}>
      <DrawerMenuLayout />
    </SingleSamplePage>
  );
};

export default Page;
