/**
 * @file ResizeHandle component preview page
 */
import * as React from "react";
import { ResizeHandle } from "../../modules/resizer/ResizeHandle";
import { Section, Story } from "../components/Story";
import { CodeBlock } from "../components/CodeBlock";
import styles from "./ResizeHandlePreview.module.css";

// ============================================================================
// Sample Components (Exported for Storybook-style usage)
// ============================================================================

export const VerticalResizeDemo: React.FC = () => {
  const [panelWidth, setPanelWidth] = React.useState(300);

  const handleResize = React.useCallback((delta: number) => {
    setPanelWidth((prev) => Math.max(150, Math.min(600, prev - delta)));
  }, []);

  return (
    <div className={styles.demoContainer}>
      <div className={styles.resizeWrapper}>
        <div className={styles.verticalHandleWrapper}>
          <ResizeHandle direction="vertical" onResize={handleResize} />
        </div>
        <div className={styles.resizablePanel} style={{ width: `${panelWidth}px` }}>
          <h4 className={styles.panelTitle}>Resizable Panel</h4>
          <p className={styles.panelInfo}>Width: {panelWidth}px</p>
          <p className={styles.panelText}>Drag the handle on the left edge to resize this panel.</p>
        </div>
      </div>
      <div className={styles.staticPanel}>
        <h4 className={styles.staticPanelTitle}>Fixed Content</h4>
        <p>This area remains static.</p>
      </div>
    </div>
  );
};

export const HorizontalResizeDemo: React.FC = () => {
  const [panelHeight, setPanelHeight] = React.useState(200);

  const handleResize = React.useCallback((delta: number) => {
    setPanelHeight((prev) => Math.max(100, Math.min(500, prev - delta)));
  }, []);

  return (
    <div className={styles.demoContainerVertical}>
      <div style={{ position: "relative" }}>
        <div className={styles.horizontalHandleWrapper}>
          <ResizeHandle direction="horizontal" onResize={handleResize} />
        </div>
        <div className={styles.resizablePanelAlt} style={{ height: `${panelHeight}px` }}>
          <h4 className={styles.panelTitle}>Resizable Panel</h4>
          <p className={styles.panelInfo}>Height: {panelHeight}px</p>
          <p className={styles.panelText}>Drag the handle on the top edge to resize this panel.</p>
        </div>
      </div>
      <div className={styles.staticPanelMinHeight}>
        <h4 className={styles.staticPanelTitle}>Fixed Content</h4>
        <p>This area remains static.</p>
      </div>
    </div>
  );
};

export const BothDirectionsDemo: React.FC = () => {
  const [boxWidth, setBoxWidth] = React.useState(400);
  const [boxHeight, setBoxHeight] = React.useState(300);

  const handleVerticalResize = React.useCallback((delta: number) => {
    setBoxWidth((prev) => Math.max(200, Math.min(800, prev - delta)));
  }, []);

  const handleHorizontalResize = React.useCallback((delta: number) => {
    setBoxHeight((prev) => Math.max(150, Math.min(600, prev - delta)));
  }, []);

  return (
    <div className={styles.demoContainerInline}>
      <div className={styles.verticalHandleWrapper}>
        <ResizeHandle direction="vertical" onResize={handleVerticalResize} />
      </div>
      <div className={styles.horizontalHandleWrapper}>
        <ResizeHandle direction="horizontal" onResize={handleHorizontalResize} />
      </div>
      <div className={styles.resizableBox} style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}>
        <h4 className={styles.panelTitle}>Resizable Box</h4>
        <p className={styles.panelInfo}>
          Width: {boxWidth}px × Height: {boxHeight}px
        </p>
        <p className={styles.panelText}>Drag the handles on the left or top edge to resize.</p>
        <div className={styles.sizeInfo}>
          <p className={styles.sizeInfoText}>Min Width: 200px, Max Width: 800px</p>
          <p className={styles.sizeInfoText}>Min Height: 150px, Max Height: 600px</p>
        </div>
      </div>
    </div>
  );
};

export const NestedPanelsDemo: React.FC = () => {
  const [panelWidth, setPanelWidth] = React.useState(300);
  const [panelHeight, setPanelHeight] = React.useState(200);

  const handleVerticalResize = React.useCallback((delta: number) => {
    setPanelWidth((prev) => Math.max(150, Math.min(600, prev - delta)));
  }, []);

  const handleHorizontalResize = React.useCallback((delta: number) => {
    setPanelHeight((prev) => Math.max(100, Math.min(500, prev - delta)));
  }, []);

  return (
    <div className={styles.demoContainerNested}>
      <div className={styles.nestedLayout}>
        <div className={styles.resizeWrapper}>
          <div className={styles.verticalHandleWrapper}>
            <ResizeHandle direction="vertical" onResize={handleVerticalResize} />
          </div>
          <div className={styles.nestedSidebar} style={{ width: `${panelWidth}px` }}>
            <h4 className={styles.staticPanelTitle}>Sidebar</h4>
            <p className={styles.panelInfo}>Width: {panelWidth}px</p>
            <p className={styles.panelText}>This sidebar can be resized using the left handle.</p>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative" }}>
            <div className={styles.horizontalHandleWrapper}>
              <ResizeHandle direction="horizontal" onResize={handleHorizontalResize} />
            </div>
            <div className={styles.nestedTop} style={{ height: `${panelHeight}px` }}>
              <h4 className={styles.staticPanelTitle}>Top Panel</h4>
              <p className={styles.panelInfo}>Height: {panelHeight}px</p>
              <p className={styles.panelText}>This panel can be resized using the top handle.</p>
            </div>
          </div>
          <div className={styles.nestedBottom}>
            <h4 className={styles.staticPanelTitle}>Main Content</h4>
            <p>This area fills the remaining space.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Sample Code Strings
// ============================================================================

const VERTICAL_RESIZE_CODE = `import * as React from "react";
import { ResizeHandle } from "./components/panels/ResizeHandle";

export const VerticalResizeDemo = () => {
  const [panelWidth, setPanelWidth] = React.useState(300);

  const handleResize = React.useCallback((delta: number) => {
    setPanelWidth((prev) => Math.max(150, Math.min(600, prev - delta)));
  }, []);

  return (
    <div style={{ display: "flex", height: "300px" }}>
      <div style={{ position: "relative", display: "flex" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", zIndex: 10 }}>
          <ResizeHandle direction="vertical" onResize={handleResize} />
        </div>
        <div style={{ width: \`\${panelWidth}px\`, background: "#667eea", color: "white", padding: "1rem 1rem 1rem 1.5rem" }}>
          <h4>Resizable Panel</h4>
          <p>Width: {panelWidth}px</p>
        </div>
      </div>
      <div style={{ flex: 1, background: "#f5f5f5", padding: "1rem" }}>
        <h4>Fixed Content</h4>
      </div>
    </div>
  );
};`;

const HORIZONTAL_RESIZE_CODE = `import * as React from "react";
import { ResizeHandle } from "./components/panels/ResizeHandle";

export const HorizontalResizeDemo = () => {
  const [panelHeight, setPanelHeight] = React.useState(200);

  const handleResize = React.useCallback((delta: number) => {
    setPanelHeight((prev) => Math.max(100, Math.min(500, prev - delta)));
  }, []);

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "6px", zIndex: 10 }}>
          <ResizeHandle direction="horizontal" onResize={handleResize} />
        </div>
        <div style={{ height: \`\${panelHeight}px\`, background: "#f5576c", color: "white", padding: "1.5rem 1rem 1rem" }}>
          <h4>Resizable Panel</h4>
          <p>Height: {panelHeight}px</p>
        </div>
      </div>
      <div style={{ background: "#f5f5f5", padding: "1rem", minHeight: "100px" }}>
        <h4>Fixed Content</h4>
      </div>
    </div>
  );
};`;

// ============================================================================
// Preview Page Component
// ============================================================================

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
        <CodeBlock code={VERTICAL_RESIZE_CODE} title="Vertical Resize Code" />
      </Section>

      <Section title="Horizontal Resize Handle">
        <Story
          title="Horizontal Resize"
          description="Drag the horizontal handle on the top to resize the panel height. Min: 100px, Max: 500px"
        >
          <HorizontalResizeDemo />
        </Story>
        <CodeBlock code={HORIZONTAL_RESIZE_CODE} title="Horizontal Resize Code" />
      </Section>

      <Section title="Combined Resize Handles">
        <Story
          title="Both Directions"
          description="A box with both vertical (left) and horizontal (top) resize handles. Try resizing from both edges!"
        >
          <BothDirectionsDemo />
        </Story>
      </Section>

      <Section title="Nested Panels">
        <Story title="Complex Layout" description="Multiple resize handles in a nested panel layout">
          <NestedPanelsDemo />
        </Story>
      </Section>

      <Section title="Usage Notes">
        <Story title="Interaction Guide" description="How to use the resize handles">
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", fontSize: "0.875rem" }}>
            <p style={{ margin: 0 }}>
              <strong>Usage:</strong> Drag the resize handles to adjust panel dimensions. Each demo above is interactive
              and can be resized within the specified min/max constraints.
            </p>
          </div>
        </Story>
      </Section>
    </div>
  );
};
