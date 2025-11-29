/**
 * @file Drawer - Animations comparison page
 */
import * as React from "react";
import { DrawerAnimations } from "../components/DrawerAnimations";
import DrawerAnimationsSource from "../components/DrawerAnimations.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Drawer / Animations"
      code={DrawerAnimationsSource}
      codeTitle="DrawerAnimations.tsx"
      previewHeight={480}
    >
      <DrawerAnimations />
    </SingleSamplePage>
  );
};

export default Page;
