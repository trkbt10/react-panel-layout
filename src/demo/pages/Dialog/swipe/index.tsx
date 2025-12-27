/**
 * @file Dialog - Swipe Dismiss page
 */
import * as React from "react";
import { SwipeDialogDemo } from "../components/SwipeDialogDemo.js";
import SwipeDialogDemoSource from "../components/SwipeDialogDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout/index.js";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Dialog / Swipe Dismiss"
      code={SwipeDialogDemoSource}
      codeTitle="SwipeDialogDemo.tsx"
      previewHeight={600}
    >
      <SwipeDialogDemo />
    </SingleSamplePage>
  );
};

export default Page;
