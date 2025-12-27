/**
 * @file Dialog - Card Expansion page (Apple Music style)
 */
import * as React from "react";
import { CardExpandDemo } from "../components/CardExpandDemo.js";
import CardExpandDemoSource from "../components/CardExpandDemo.tsx?raw";
import { SingleSamplePage } from "../../../components/layout/index.js";

const Page: React.FC = () => {
  return (
    <SingleSamplePage
      title="Dialog / Card Expansion"
      code={CardExpandDemoSource}
      codeTitle="CardExpandDemo.tsx"
      previewHeight={600}
    >
      <CardExpandDemo />
    </SingleSamplePage>
  );
};

export default Page;
