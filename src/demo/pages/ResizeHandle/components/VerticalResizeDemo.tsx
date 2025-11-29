/**
 * @file Vertical resize handle demo
 */
import * as React from "react";
import { ResizeHandle } from "../../../../components/resizer/ResizeHandle";
import styles from "./VerticalResizeDemo.module.css";

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
