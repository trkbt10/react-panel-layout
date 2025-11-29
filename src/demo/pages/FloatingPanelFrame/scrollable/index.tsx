/**
 * @file FloatingPanelFrame - Scrollable sample page
 */
import * as React from "react";
import { ScrollablePanel } from "../components/ScrollablePanel";
import ScrollablePanelSource from "../components/ScrollablePanel.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

const Page: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const renderBody = (): React.ReactNode => {
    if (open) {
      return <ScrollablePanel onClose={() => { setOpen(false); }} />;
    }
    return <button onClick={() => { setOpen(true); }}>Show Panel</button>;
  };

  return (
    <SingleSamplePage
      title="FloatingPanelFrame / Scrollable"
      code={ScrollablePanelSource}
      codeTitle="ScrollablePanel.tsx"
    >
      {renderBody()}
    </SingleSamplePage>
  );
};

export default Page;
