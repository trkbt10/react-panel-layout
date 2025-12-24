/**
 * @file Stack - Basics demo page
 */
import * as React from "react";
import { StackBasics } from "../components/StackBasics";
import StackBasicsSource from "../components/StackBasics.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Stack / Basics"
      code={StackBasicsSource}
      codeTitle="StackBasics.tsx"
      previewHeight={500}
    >
      <StackBasics />
    </SingleSamplePage>
  );
};

export default Page;
