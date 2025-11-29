/**
 * @file HorizontalDivider component preview page
 */
import * as React from "react";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { SimpleResizablePanels } from "./components/SimpleResizablePanels";
import SimpleResizablePanelsSource from "./components/SimpleResizablePanels.tsx?raw";
import { PanelsWithRichContent } from "./components/PanelsWithRichContent";
import PanelsWithRichContentSource from "./components/PanelsWithRichContent.tsx?raw";
import { ThreePanelLayout } from "./components/ThreePanelLayout";
import ThreePanelLayoutSource from "./components/ThreePanelLayout.tsx?raw";
import { DemoPage } from "../../components/layout";
import styles from "./index.module.css";

export const HorizontalDividerPreview: React.FC = () => {
  return (
    <DemoPage title="HorizontalDivider Component" padding="2rem">
      <Section title="Basic Usage">
        <Story
          title="Simple Resizable Panels"
          description="Drag the divider to resize the left and right panels. Min width: 100px, Max width: 400px"
        >
          <SimpleResizablePanels />
        </Story>
        <CodePreview code={SimpleResizablePanelsSource} title="SimpleResizablePanels.tsx" />
      </Section>

      <Section title="With Content">
        <Story
          title="Panels with Rich Content"
          description="Resize panels containing various content types. Min width: 150px, Max width: 500px"
        >
          <PanelsWithRichContent />
        </Story>
        <CodePreview code={PanelsWithRichContentSource} title="PanelsWithRichContent.tsx" />
      </Section>

      <Section title="Three-Panel Layout">
        <Story
          title="Multiple Dividers"
          description="Use multiple dividers to create complex layouts. Each panel can be resized independently."
        >
          <ThreePanelLayout />
        </Story>
        <CodePreview code={ThreePanelLayoutSource} title="ThreePanelLayout.tsx" />
      </Section>

      <Section title="Interactive Demo">
        <Story
          title="Reset & Control"
          description="Test the divider with additional controls"
        >
          <div className={styles.infoBox}>
            <p>
              <strong>Usage:</strong> Drag the vertical divider bars to resize the panels. The divider provides visual
              feedback on hover and during dragging.
            </p>
          </div>
        </Story>
      </Section>
    </DemoPage>
  );
};
