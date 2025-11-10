/**
 * @file HorizontalDivider component preview page
 */
import * as React from "react";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { SimpleResizablePanels, code as simpleCode } from "./SimpleResizablePanels";
import { PanelsWithRichContent, code as richContentCode } from "./PanelsWithRichContent";
import { ThreePanelLayout, code as threePanelCode } from "./ThreePanelLayout";
import { DemoPage } from "../components";
import styles from "./page.module.css";

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
        <CodePreview code={simpleCode} title="Simple Resizable Panels Code" />
      </Section>

      <Section title="With Content">
        <Story
          title="Panels with Rich Content"
          description="Resize panels containing various content types. Min width: 150px, Max width: 500px"
        >
          <PanelsWithRichContent />
        </Story>
        <CodePreview code={richContentCode} title="Panels with Rich Content Code" />
      </Section>

      <Section title="Three-Panel Layout">
        <Story
          title="Multiple Dividers"
          description="Use multiple dividers to create complex layouts. Each panel can be resized independently."
        >
          <ThreePanelLayout />
        </Story>
        <CodePreview code={threePanelCode} title="Three-Panel Layout Code" />
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
