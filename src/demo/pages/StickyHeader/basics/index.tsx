/**
 * @file StickyHeader - Basics page
 */
import * as React from "react";
import { StickyHeaderBasics } from "../components/StickyHeaderBasics";
import StickyHeaderBasicsSource from "../components/StickyHeaderBasics.tsx?raw";
import { SingleSamplePage } from "../../../components/layout/SingleSamplePage";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="StickyHeader / Basics" code={StickyHeaderBasicsSource} codeTitle="StickyHeaderBasics.tsx">
      <StickyHeaderBasics />
    </SingleSamplePage>
  );
};

export default Page;
