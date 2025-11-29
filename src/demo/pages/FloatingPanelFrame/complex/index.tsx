/**
 * @file FloatingPanelFrame - Complex sample page
 */
import * as React from "react";
import { ComplexPanel } from "../components/ComplexPanel";
import ComplexPanelSource from "../components/ComplexPanel.tsx?raw";
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
    <SingleSamplePage title="FloatingPanelFrame / Complex" code={ComplexPanelSource} codeTitle="ComplexPanel.tsx">
      {renderBody()}
    </SingleSamplePage>
  );
};

export default Page;
