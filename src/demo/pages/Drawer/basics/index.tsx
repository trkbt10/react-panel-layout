/**
 * @file Drawer - Basics page
 */
import * as React from "react";
import { DrawerBasics, code } from "../DrawerBasics";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Drawer / Basics" code={code} codeTitle="Drawer Basics Code" previewHeight={520}>
      <DrawerBasics />
    </SingleSamplePage>
  );
};

export default Page;
