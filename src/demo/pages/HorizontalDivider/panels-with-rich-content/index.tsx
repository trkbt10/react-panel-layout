/**
 * @file HorizontalDivider - Panels with Rich Content page
 */
import * as React from "react";
import { PanelsWithRichContent, code as richContentCode } from "../components/PanelsWithRichContent";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="HorizontalDivider / Panels with Rich Content"
      code={richContentCode}
      codeTitle="Panels with Rich Content Code"
    >
      <PanelsWithRichContent />
    </SingleSamplePage>
  );
};

export default Page;
