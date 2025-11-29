/**
 * @file Horizontal resize handle demo
 */
import * as React from "react";
import { ResizeHandle } from "../../../../components/resizer/ResizeHandle";
import styles from "./HorizontalResizeDemo.module.css";

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
