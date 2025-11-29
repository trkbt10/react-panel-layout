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

export const code = `import * as React from "react";
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
