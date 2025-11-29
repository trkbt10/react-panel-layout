/**
 * @file Three panel layout with HorizontalDivider
 */
import * as React from "react";
import { HorizontalDivider } from "../../../../components/resizer/HorizontalDivider";
import styles from "./ThreePanelLayout.module.css";

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

export const code = `import * as React from "react";
import { HorizontalDivider } from "./components/panels/HorizontalDivider";

export const ThreePanelLayout = () => {
  const [leftWidth, setLeftWidth] = React.useState(250);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(100, Math.min(600, prev + deltaX)));
  }, []);

  return (
    <div style={{ display: "flex", height: "350px" }}>
      <div style={{ width: \`\${leftWidth}px\` }}>
        <h4>Left Panel</h4>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div style={{ flex: 1 }}>
        <h4>Center Panel</h4>
      </div>
    </div>
  );
};`;
