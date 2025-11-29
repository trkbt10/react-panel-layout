/**
 * @file FloatingPanelFrame component preview page
 */
import * as React from "react";
import { Section, Story, StoryActionButton } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { BasicPanel, code as basicPanelCode } from "./components/BasicPanel";
import { PanelWithMeta, code as panelWithMetaCode } from "./components/PanelWithMeta";
import { PanelWithControls, code as panelWithControlsCode } from "./components/PanelWithControls";
import { ComplexPanel, code as complexPanelCode } from "./components/ComplexPanel";
import { ScrollablePanel, code as scrollablePanelCode } from "./components/ScrollablePanel";
import { DemoPage } from "../../components/layout";

export const FloatingPanelFramePreview: React.FC = () => {
  const [showPanel1, setShowPanel1] = React.useState(true);
  const [showPanel2, setShowPanel2] = React.useState(true);
  const [showPanel3, setShowPanel3] = React.useState(true);

  return (
    <DemoPage title="FloatingPanelFrame Components" padding="2rem">
      <Section title="Basic Panel">
        <Story
          title="Simple Panel"
          description="Basic floating panel with header, title, and content"
        >
          <BasicPanel />
        </Story>
        <CodePreview code={basicPanelCode} title="Basic Panel Code" />
      </Section>

      <Section title="Panel with Meta Information">
        <Story
          title="Panel with Meta"
          description="Panel with title and metadata"
        >
          <PanelWithMeta />
        </Story>
        <CodePreview code={panelWithMetaCode} title="Panel with Meta Code" />
      </Section>

      <Section title="Panel with Controls">
        <Story
          title="Panel with Action Buttons"
          description="Panel with header controls"
          actions={!showPanel1 ? <StoryActionButton onClick={() => setShowPanel1(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel1 ? <PanelWithControls onClose={() => setShowPanel1(false)} /> : <p>Panel closed</p>}
        </Story>
        <CodePreview code={panelWithControlsCode} title="Panel with Controls Code" />
      </Section>

      <Section title="Complex Panel">
        <Story
          title="Full Featured Panel"
          description="Panel with all components: title, meta, controls, and rich content"
          actions={!showPanel2 ? <StoryActionButton onClick={() => setShowPanel2(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel2 ? <ComplexPanel onClose={() => setShowPanel2(false)} /> : <p>Panel closed</p>}
        </Story>
        <CodePreview code={complexPanelCode} title="Complex Panel Code" />
      </Section>

      <Section title="Scrollable Content">
        <Story
          title="Long Content Panel"
          description="Panel with scrollable content area"
          actions={!showPanel3 ? <StoryActionButton onClick={() => setShowPanel3(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel3 ? <ScrollablePanel onClose={() => setShowPanel3(false)} /> : <p>Panel closed</p>}
        </Story>
        <CodePreview code={scrollablePanelCode} title="Scrollable Panel Code" />
      </Section>
    </DemoPage>
  );
};
