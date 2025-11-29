/**
 * @file Simple resizable panels with HorizontalDivider
 */
import * as React from "react";
import { HorizontalDivider } from "../../../../components/resizer/HorizontalDivider";
import styles from "./SimpleResizablePanels.module.css";

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
