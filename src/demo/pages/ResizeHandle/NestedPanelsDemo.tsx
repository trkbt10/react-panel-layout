/**
 * @file Nested panels with resize handles demo
 */
import * as React from "react";
import { ResizeHandle } from "../../../components/resizer/ResizeHandle";
import styles from "./NestedPanelsDemo.module.css";

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

export const code = `import * as React from "react";
import { ResizeHandle } from "./components/panels/ResizeHandle";

export const NestedPanelsDemo = () => {
  const [panelWidth, setPanelWidth] = React.useState(300);
  const [panelHeight, setPanelHeight] = React.useState(200);

  const handleVerticalResize = (delta) => {
    setPanelWidth((prev) => Math.max(150, Math.min(600, prev - delta)));
  };

  const handleHorizontalResize = (delta) => {
    setPanelHeight((prev) => Math.max(100, Math.min(500, prev - delta)));
  };

  return (
    <div style={{ display: "flex", height: "400px" }}>
      {/* Sidebar with vertical resize handle */}
      <div style={{ position: "relative" }}>
        <ResizeHandle direction="vertical" onResize={handleVerticalResize} />
        <div style={{ width: \`\${panelWidth}px\` }}>Sidebar</div>
      </div>

      {/* Main area with top panel and horizontal resize handle */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative" }}>
          <ResizeHandle direction="horizontal" onResize={handleHorizontalResize} />
          <div style={{ height: \`\${panelHeight}px\` }}>Top Panel</div>
        </div>
        <div style={{ flex: 1 }}>Main Content</div>
      </div>
    </div>
  );
};`;
