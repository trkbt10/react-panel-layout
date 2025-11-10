/**
 * @file ResizeHandle component preview page
 */
import * as React from "react";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { VerticalResizeDemo, code as verticalCode } from "./VerticalResizeDemo";
import { HorizontalResizeDemo, code as horizontalCode } from "./HorizontalResizeDemo";
import { BothDirectionsDemo, code as bothDirectionsCode } from "./BothDirectionsDemo";
import { NestedPanelsDemo, code as nestedPanelsCode } from "./NestedPanelsDemo";
import styles from "../ResizeHandlePreview.module.css";

export const ResizeHandlePreview: React.FC = () => {

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>ResizeHandle Component</h1>

      <Section title="Vertical Resize Handle">
        <Story
          title="Vertical Resize"
          description="Drag the vertical handle on the left to resize the panel width. Min: 150px, Max: 600px"
        >
          <VerticalResizeDemo />
        </Story>
        <CodePreview code={verticalCode} title="Vertical Resize Code" />
      </Section>

      <Section title="Horizontal Resize Handle">
        <Story
          title="Horizontal Resize"
          description="Drag the horizontal handle on the top to resize the panel height. Min: 100px, Max: 500px"
        >
          <HorizontalResizeDemo />
        </Story>
        <CodePreview code={horizontalCode} title="Horizontal Resize Code" />
      </Section>

      <Section title="Combined Resize Handles">
        <Story
          title="Both Directions"
          description="A box with both vertical (left) and horizontal (top) resize handles. Try resizing from both edges!"
        >
          <BothDirectionsDemo />
        </Story>
        <CodePreview code={bothDirectionsCode} title="Both Directions Code" />
      </Section>

      <Section title="Nested Panels">
        <Story title="Complex Layout" description="Multiple resize handles in a nested panel layout">
          <NestedPanelsDemo />
        </Story>
        <CodePreview code={nestedPanelsCode} title="Nested Panels Code" />
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
    </div>
  );
};
