/**
 * @file FloatingPanelFrame - Complex sample page
 */
import * as React from "react";
import { ComplexPanel, code as complexPanelCode } from "../components/ComplexPanel";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const renderBody = (): React.ReactNode => {
    if (open) {
      return <ComplexPanel onClose={() => { setOpen(false); }} />;
    }
    return <button onClick={() => { setOpen(true); }}>Show Panel</button>;
  };

  return (
    <SingleSamplePage title="FloatingPanelFrame / Complex" code={complexPanelCode} codeTitle="Complex Panel Code">
      {renderBody()}
    </SingleSamplePage>
  );
};

export default Page;
