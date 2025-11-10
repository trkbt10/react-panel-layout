/**
 * @file PanelSystem - Preview page
 */
import * as React from "react";
import { PanelSystemPreview } from "../../PanelSystemPreview";

const Page: React.FC = () => {
  return (
    <div style={{ padding: "1.5rem", height: "100%" }}>
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%", minHeight: 0 }}>
        <h1 style={{ margin: "0 0 1rem 0" }}>PanelSystem / Preview</h1>
        <div style={{ minHeight: 0 }}>
          <PanelSystemPreview />
        </div>
      </div>
    </div>
  );
};

export default Page;
