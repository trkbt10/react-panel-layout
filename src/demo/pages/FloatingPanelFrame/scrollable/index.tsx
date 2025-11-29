/**
 * @file FloatingPanelFrame - Scrollable sample page
 */
import * as React from "react";
import { ScrollablePanel, code as scrollablePanelCode } from "../components/ScrollablePanel";
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
      code={scrollablePanelCode}
      codeTitle="Scrollable Panel Code"
    >
      {renderBody()}
    </SingleSamplePage>
  );
};

export default Page;
