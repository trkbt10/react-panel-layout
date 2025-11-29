/**
 * @file FloatingPanelFrame - With Controls sample page
 */
import * as React from "react";
import { PanelWithControls } from "../components/PanelWithControls";
import PanelWithControlsSource from "../components/PanelWithControls.tsx?raw";
import { SingleSamplePage } from "../../../components/layout";

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
      code={PanelWithControlsSource}
      codeTitle="PanelWithControls.tsx"
    >
      {renderBody()}
    </SingleSamplePage>
  );
};

export default Page;
