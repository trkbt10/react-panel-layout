/**
 * @file Drawer - Basics page
 */
import * as React from "react";
import { DrawerBasics } from "../components/DrawerBasics";
import DrawerBasicsSource from "../components/DrawerBasics.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Drawer / Basics" code={DrawerBasicsSource} codeTitle="DrawerBasics.tsx" previewHeight={520}>
      <DrawerBasics />
    </SingleSamplePage>
  );
};

export default Page;
