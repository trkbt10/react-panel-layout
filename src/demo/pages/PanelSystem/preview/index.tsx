/**
 * @file PanelSystem - Preview page
 */
import * as React from "react";
import { PanelSystemPreview } from "../../PanelSystemPreview";
import { DemoPage } from "../../components";

const Page: React.FC = () => {
  return (
    <DemoPage title="PanelSystem / Preview" padding="var(--rpl-demo-space-lg)" fullHeight maxWidth="none">
      <div style={{ flex: 1, minHeight: 0 }}>
        <PanelSystemPreview />
      </div>
    </DemoPage>
  );
};

export default Page;
