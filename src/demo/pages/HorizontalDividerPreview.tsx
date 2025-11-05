/**
 * @file HorizontalDivider component preview page
 */
import * as React from "react";
import { HorizontalDivider } from "../../modules/resizer/HorizontalDivider";
import { Section, Story } from "../components/Story";
import { CodeBlock } from "../components/CodeBlock";
import styles from "./HorizontalDividerPreview.module.css";

// ============================================================================
// Sample Components (Exported for Storybook-style usage)
// ============================================================================

export const SimpleResizablePanels: React.FC = () => {
  const [leftWidth, setLeftWidth] = React.useState(200);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(100, Math.min(400, prev + deltaX)));
  }, []);

  return (
    <div className={styles.demoContainer}>
      <div className={styles.leftPanel} style={{ width: `${leftWidth}px` }}>
        <h4 className={styles.panelTitle}>Left Panel</h4>
        <p className={styles.panelInfo}>Width: {leftWidth}px</p>
        <p className={styles.panelText}>This panel can be resized by dragging the divider.</p>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div className={styles.rightPanel}>
        <h4 className={styles.panelTitle}>Right Panel</h4>
        <p className={styles.panelText}>This panel automatically fills the remaining space.</p>
      </div>
    </div>
  );
};

export const PanelsWithRichContent: React.FC = () => {
  const [leftWidth, setLeftWidth] = React.useState(300);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(150, Math.min(500, prev + deltaX)));
  }, []);

  return (
    <div className={`${styles.demoContainer} ${styles.demoContainerTall}`}>
      <div className={styles.sidebarPanel} style={{ width: `${leftWidth}px` }}>
        <h4 className={styles.sidebarTitle}>Sidebar</h4>
        <p className={styles.panelInfo}>Width: {leftWidth}px</p>
        <nav className={styles.sidebarNav}>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Projects</a>
          <a href="#" className={styles.navLink}>Tasks</a>
          <a href="#" className={styles.navLink}>Settings</a>
        </nav>
        <div className={styles.recentFiles}>
          <h5>Recent Files</h5>
          <ul>
            <li>document.pdf</li>
            <li>image.png</li>
            <li>report.docx</li>
          </ul>
        </div>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div className={styles.mainPanel}>
        <h4 className={styles.mainTitle}>Main Content</h4>
        <p>This is the main content area. It contains the primary information and controls.</p>
        <div className={styles.cardList}>
          <div className={styles.card}>
            <h5>Card 1</h5>
            <p>Some content in a card</p>
          </div>
          <div className={styles.card}>
            <h5>Card 2</h5>
            <p>More content in another card</p>
          </div>
          <div className={styles.card}>
            <h5>Card 3</h5>
            <p>Even more content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ThreePanelLayout: React.FC = () => {
  const [leftWidth, setLeftWidth] = React.useState(250);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(100, Math.min(600, prev + deltaX)));
  }, []);

  return (
    <div className={`${styles.demoContainer} ${styles.demoContainerMedium}`}>
      <div className={styles.leftPanel} style={{ width: `${leftWidth}px` }}>
        <h4 className={styles.panelTitle}>Left Panel</h4>
        <p className={styles.panelInfo}>Width: {leftWidth}px</p>
        <p className={styles.panelText}>This is the left panel. You can put navigation or tools here.</p>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div className={styles.centerPanel}>
        <h4 className={styles.centerTitle}>Center Panel</h4>
        <p>This is the center panel with the main content.</p>
        <p>It automatically fills the available space between the left and right panels.</p>
      </div>
    </div>
  );
};

// ============================================================================
// Sample Code Strings
// ============================================================================

const SIMPLE_RESIZABLE_CODE = `import * as React from "react";
import { HorizontalDivider } from "./components/panels/HorizontalDivider";

export const SimpleResizablePanels = () => {
  const [leftWidth, setLeftWidth] = React.useState(200);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(100, Math.min(400, prev + deltaX)));
  }, []);

  return (
    <div style={{ display: "flex", height: "300px" }}>
      <div style={{ width: \`\${leftWidth}px\`, background: "#e3f2fd", padding: "1rem" }}>
        <h4>Left Panel</h4>
        <p>Width: {leftWidth}px</p>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div style={{ flex: 1, background: "#f3e5f5", padding: "1rem" }}>
        <h4>Right Panel</h4>
      </div>
    </div>
  );
};`;

const RICH_CONTENT_CODE = `import * as React from "react";
import { HorizontalDivider } from "./components/panels/HorizontalDivider";

export const PanelsWithRichContent = () => {
  const [leftWidth, setLeftWidth] = React.useState(300);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(150, Math.min(500, prev + deltaX)));
  }, []);

  return (
    <div style={{ display: "flex", height: "400px" }}>
      <div style={{ width: \`\${leftWidth}px\`, overflow: "auto" }}>
        <h4>Sidebar</h4>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Projects</a>
        </nav>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div style={{ flex: 1, overflow: "auto" }}>
        <h4>Main Content</h4>
        <p>Primary content area...</p>
      </div>
    </div>
  );
};`;

// ============================================================================
// Preview Page Component
// ============================================================================

export const HorizontalDividerPreview: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>HorizontalDivider Component</h1>

      <Section title="Basic Usage">
        <Story
          title="Simple Resizable Panels"
          description="Drag the divider to resize the left and right panels. Min width: 100px, Max width: 400px"
        >
          <SimpleResizablePanels />
        </Story>
        <CodeBlock code={SIMPLE_RESIZABLE_CODE} title="Simple Resizable Panels Code" />
      </Section>

      <Section title="With Content">
        <Story
          title="Panels with Rich Content"
          description="Resize panels containing various content types. Min width: 150px, Max width: 500px"
        >
          <PanelsWithRichContent />
        </Story>
        <CodeBlock code={RICH_CONTENT_CODE} title="Panels with Rich Content Code" />
      </Section>

      <Section title="Three-Panel Layout">
        <Story
          title="Multiple Dividers"
          description="Use multiple dividers to create complex layouts. Each panel can be resized independently."
        >
          <ThreePanelLayout />
        </Story>
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
    </div>
  );
};
