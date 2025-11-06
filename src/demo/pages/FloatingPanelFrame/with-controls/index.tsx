/**
 * @file FloatingPanelFrame - With Controls sample page
 */
import * as React from "react";
import { PanelWithControls, code as panelWithControlsCode } from "../PanelWithControls";
import { CodeBlock } from "../../../components/CodeBlock";

const Page: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const renderBody = (): React.ReactNode => {
    if (open) {
      return <PanelWithControls onClose={() => { setOpen(false); }} />;
    }
    return <button onClick={() => { setOpen(true); }}>Show Panel</button>;
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>FloatingPanelFrame / With Controls</h1>
      <div style={{ marginBottom: "1rem" }}>{renderBody()}</div>
      <details>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Show Code</summary>
        <CodeBlock code={panelWithControlsCode} title="Panel with Controls Code" />
      </details>
    </div>
  );
};

export default Page;
