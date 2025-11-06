/**
 * @file PanelSystem - Preview page
 */
import * as React from "react";
import { PanelSystemPreview } from "../../PanelSystemPreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", height: "100%" }}>
      <h1 style={{ margin: "0 0 1rem 0" }}>PanelSystem / Preview</h1>
      <div style={{ height: "60vh", minHeight: 360 }}>
        <PanelSystemPreview />
      </div>
    </div>
  );
};

export default Page;

