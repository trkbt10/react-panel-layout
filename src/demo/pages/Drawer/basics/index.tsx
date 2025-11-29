/**
 * @file Drawer - Basics page
 */
import * as React from "react";
import { DrawerBasics, code } from "../components/DrawerBasics";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Drawer / Basics" code={code} codeTitle="Drawer Basics Code" previewHeight={520}>
      <DrawerBasics />
    </SingleSamplePage>
  );
};

export default Page;
