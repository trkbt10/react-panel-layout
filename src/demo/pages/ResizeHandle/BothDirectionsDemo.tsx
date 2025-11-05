/**
 * @file Both directions resize handle demo
 */
import * as React from "react";
import { ResizeHandle } from "../../../components/resizer/ResizeHandle";
import styles from "./samples.module.css";

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

export const code = `import * as React from "react";
import { ResizeHandle } from "./components/panels/ResizeHandle";

export const BothDirectionsDemo = () => {
  const [boxWidth, setBoxWidth] = React.useState(400);
  const [boxHeight, setBoxHeight] = React.useState(300);

  const handleVerticalResize = React.useCallback((delta: number) => {
    setBoxWidth((prev) => Math.max(200, Math.min(800, prev - delta)));
  }, []);

  const handleHorizontalResize = React.useCallback((delta: number) => {
    setBoxHeight((prev) => Math.max(150, Math.min(600, prev - delta)));
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", zIndex: 10 }}>
        <ResizeHandle direction="vertical" onResize={handleVerticalResize} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "6px", zIndex: 10 }}>
        <ResizeHandle direction="horizontal" onResize={handleHorizontalResize} />
      </div>
      <div style={{ width: \`\${boxWidth}px\`, height: \`\${boxHeight}px\` }}>
        Resizable Box
      </div>
    </div>
  );
};`;
