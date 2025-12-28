/**
 * @file Drawer - Swipe Gestures page
 */
import * as React from "react";
import { DrawerSwipe } from "../components/DrawerSwipe";
import DrawerSwipeSource from "../components/DrawerSwipe.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Drawer / Swipe Gestures" code={DrawerSwipeSource} codeTitle="DrawerSwipe.tsx" previewHeight={600}>
      <DrawerSwipe />
    </SingleSamplePage>
  );
};

export default Page;
