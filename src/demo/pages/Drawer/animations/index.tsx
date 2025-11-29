/**
 * @file Drawer - Animations comparison page
 */
import * as React from "react";
import { DrawerAnimations, code } from "../components/DrawerAnimations";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Drawer / Animations"
      code={code}
      codeTitle="Drawer Animations Code"
      previewHeight={480}
    >
      <DrawerAnimations />
    </SingleSamplePage>
  );
};

export default Page;
