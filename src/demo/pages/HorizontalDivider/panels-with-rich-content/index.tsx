/**
 * @file HorizontalDivider - Panels with Rich Content page
 */
import * as React from "react";
import { PanelsWithRichContent } from "../components/PanelsWithRichContent";
import PanelsWithRichContentSource from "../components/PanelsWithRichContent.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="HorizontalDivider / Panels with Rich Content"
      code={PanelsWithRichContentSource}
      codeTitle="PanelsWithRichContent.tsx"
    >
      <PanelsWithRichContent />
    </SingleSamplePage>
  );
};

export default Page;
