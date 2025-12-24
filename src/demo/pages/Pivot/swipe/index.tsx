/**
 * @file Pivot - Swipe Navigation demo page
 */
import * as React from "react";
import { SwipePivot } from "../components/SwipePivot";
import SwipePivotSource from "../components/SwipePivot.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Pivot / Swipe Navigation"
      code={SwipePivotSource}
      codeTitle="SwipePivot.tsx"
      previewHeight={500}
    >
      <SwipePivot />
    </SingleSamplePage>
  );
};

export default Page;
