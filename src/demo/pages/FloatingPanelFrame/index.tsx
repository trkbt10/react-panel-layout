/**
 * @file FloatingPanelFrame component preview page
 */
import * as React from "react";
import { Section, Story, StoryActionButton } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { BasicPanel } from "./components/BasicPanel";
import BasicPanelSource from "./components/BasicPanel.tsx?raw";
import { PanelWithMeta } from "./components/PanelWithMeta";
import PanelWithMetaSource from "./components/PanelWithMeta.tsx?raw";
import { PanelWithControls } from "./components/PanelWithControls";
import PanelWithControlsSource from "./components/PanelWithControls.tsx?raw";
import { ComplexPanel } from "./components/ComplexPanel";
import ComplexPanelSource from "./components/ComplexPanel.tsx?raw";
import { ScrollablePanel } from "./components/ScrollablePanel";
import ScrollablePanelSource from "./components/ScrollablePanel.tsx?raw";
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
        <CodePreview code={BasicPanelSource} title="BasicPanel.tsx" />
      </Section>

      <Section title="Panel with Meta Information">
        <Story
          title="Panel with Meta"
          description="Panel with title and metadata"
        >
          <PanelWithMeta />
        </Story>
        <CodePreview code={PanelWithMetaSource} title="PanelWithMeta.tsx" />
      </Section>

      <Section title="Panel with Controls">
        <Story
          title="Panel with Action Buttons"
          description="Panel with header controls"
          actions={!showPanel1 ? <StoryActionButton onClick={() => setShowPanel1(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel1 ? <PanelWithControls onClose={() => setShowPanel1(false)} /> : <p>Panel closed</p>}
        </Story>
        <CodePreview code={PanelWithControlsSource} title="PanelWithControls.tsx" />
      </Section>

      <Section title="Complex Panel">
        <Story
          title="Full Featured Panel"
          description="Panel with all components: title, meta, controls, and rich content"
          actions={!showPanel2 ? <StoryActionButton onClick={() => setShowPanel2(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel2 ? <ComplexPanel onClose={() => setShowPanel2(false)} /> : <p>Panel closed</p>}
        </Story>
        <CodePreview code={ComplexPanelSource} title="ComplexPanel.tsx" />
      </Section>

      <Section title="Scrollable Content">
        <Story
          title="Long Content Panel"
          description="Panel with scrollable content area"
          actions={!showPanel3 ? <StoryActionButton onClick={() => setShowPanel3(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel3 ? <ScrollablePanel onClose={() => setShowPanel3(false)} /> : <p>Panel closed</p>}
        </Story>
        <CodePreview code={ScrollablePanelSource} title="ScrollablePanel.tsx" />
      </Section>
    </DemoPage>
  );
};
