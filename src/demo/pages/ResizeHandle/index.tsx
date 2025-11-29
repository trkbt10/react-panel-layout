/**
 * @file ResizeHandle component preview page
 */
import * as React from "react";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { VerticalResizeDemo } from "./components/VerticalResizeDemo";
import VerticalResizeDemoSource from "./components/VerticalResizeDemo.tsx?raw";
import { HorizontalResizeDemo } from "./components/HorizontalResizeDemo";
import HorizontalResizeDemoSource from "./components/HorizontalResizeDemo.tsx?raw";
import { BothDirectionsDemo } from "./components/BothDirectionsDemo";
import BothDirectionsDemoSource from "./components/BothDirectionsDemo.tsx?raw";
import { NestedPanelsDemo } from "./components/NestedPanelsDemo";
import NestedPanelsDemoSource from "./components/NestedPanelsDemo.tsx?raw";
import { DemoPage } from "../../components/layout";
import styles from "./index.module.css";

export const ResizeHandlePreview: React.FC = () => {

  return (
    <DemoPage title="ResizeHandle Component" padding="2rem">
      <Section title="Vertical Resize Handle">
        <Story
          title="Vertical Resize"
          description="Drag the vertical handle on the left to resize the panel width. Min: 150px, Max: 600px"
        >
          <VerticalResizeDemo />
        </Story>
        <CodePreview code={VerticalResizeDemoSource} title="VerticalResizeDemo.tsx" />
      </Section>

      <Section title="Horizontal Resize Handle">
        <Story
          title="Horizontal Resize"
          description="Drag the horizontal handle on the top to resize the panel height. Min: 100px, Max: 500px"
        >
          <HorizontalResizeDemo />
        </Story>
        <CodePreview code={HorizontalResizeDemoSource} title="HorizontalResizeDemo.tsx" />
      </Section>

      <Section title="Combined Resize Handles">
        <Story
          title="Both Directions"
          description="A box with both vertical (left) and horizontal (top) resize handles. Try resizing from both edges!"
        >
          <BothDirectionsDemo />
        </Story>
        <CodePreview code={BothDirectionsDemoSource} title="BothDirectionsDemo.tsx" />
      </Section>

      <Section title="Nested Panels">
        <Story title="Complex Layout" description="Multiple resize handles in a nested panel layout">
          <NestedPanelsDemo />
        </Story>
        <CodePreview code={NestedPanelsDemoSource} title="NestedPanelsDemo.tsx" />
      </Section>

      <Section title="Usage Notes">
        <Story title="Interaction Guide" description="How to use the resize handles">
          <div className={styles.infoBox}>
            <p>
              <strong>Usage:</strong> Drag the resize handles to adjust panel dimensions. Each demo above is interactive
              and can be resized within the specified min/max constraints.
            </p>
          </div>
        </Story>
      </Section>
    </DemoPage>
  );
};
