/**
 * @file Horizontal resize handle demo
 */
import * as React from "react";
import { ResizeHandle } from "../../../components/panels/ResizeHandle";
import styles from "./samples.module.css";

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

export const code = `import * as React from "react";
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
