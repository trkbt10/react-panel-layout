/**
 * @file Simple resizable panels with HorizontalDivider
 */
import * as React from "react";
import { HorizontalDivider } from "../../../components/panels/HorizontalDivider";
import styles from "./samples.module.css";

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

export const code = `import * as React from "react";
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
