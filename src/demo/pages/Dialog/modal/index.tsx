/**
 * @file Dialog - Modal page
 */
import * as React from "react";
import { ModalBasics } from "../components/ModalBasics";
import ModalBasicsSource from "../components/ModalBasics.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  return (
    <SingleSamplePage title="Dialog / Modal" code={ModalBasicsSource} codeTitle="ModalBasics.tsx" previewHeight={480}>
      <ModalBasics />
    </SingleSamplePage>
  );
};

export default Page;
