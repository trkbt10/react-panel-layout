/**
 * @file FloatingPanelFrame - With Controls sample page
 */
import * as React from "react";
import { PanelWithControls, code as panelWithControlsCode } from "../PanelWithControls";
import { SingleSamplePage } from "../../components";

const Page: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const renderBody = (): React.ReactNode => {
    if (open) {
      return <PanelWithControls onClose={() => { setOpen(false); }} />;
    }
    return <button onClick={() => { setOpen(true); }}>Show Panel</button>;
  };

  return (
    <SingleSamplePage
      title="FloatingPanelFrame / With Controls"
      code={panelWithControlsCode}
      codeTitle="Panel with Controls Code"
    >
      {renderBody()}
    </SingleSamplePage>
  );
};

export default Page;
