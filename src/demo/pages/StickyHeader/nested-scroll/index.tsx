/**
 * @file StickyHeader - Nested Scroll page
 */
import * as React from "react";
import { StickyHeaderNested } from "../components/StickyHeaderNested";
import StickyHeaderNestedSource from "../components/StickyHeaderNested.tsx?raw";
import { SingleSamplePage } from "../../../components/layout/SingleSamplePage";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="StickyHeader / Nested Scroll"
      code={StickyHeaderNestedSource}
      codeTitle="StickyHeaderNested.tsx"
    >
      <StickyHeaderNested />
    </SingleSamplePage>
  );
};

export default Page;
