/**
 * @file Data Preview Component
 * A draggable preview panel for demonstrating floating UI elements
 */
import * as React from "react";
import { useLayerDragHandle } from "../../modules/grid/useLayerDragHandle";
import styles from "./DataPreview.module.css";

export type DataPreviewProps = {
  width?: number;
  height?: number;
};

const renderPropertiesTab = (width: number, height: number): React.ReactNode => {
  return (
    <div className={styles.propertyList}>
      <div>
        <div className={styles.propertyLabel}>ID</div>
        <div className={styles.propertyValue}>data-preview-001</div>
      </div>
      <div>
        <div className={styles.propertyLabel}>Type</div>
        <div>Floating Panel</div>
      </div>
      <div>
        <div className={styles.propertyLabel}>Position Mode</div>
        <div className={styles.propertyValueHighlight}>absolute</div>
      </div>
      <div>
        <div className={styles.propertyLabel}>Dimensions</div>
        <div className={styles.propertyValue}>
          {width}px × {height}px
        </div>
      </div>
      <div>
        <div className={styles.propertyLabel}>Draggable</div>
        <div className={styles.propertyValueHighlight}>✓ Yes</div>
      </div>
      <div>
        <div className={styles.propertyLabel}>Z-Index</div>
        <div className={styles.propertyValue}>20</div>
      </div>
    </div>
  );
};

const renderDataTab = (): React.ReactNode => {
  return (
    <div className={styles.dataList}>
      <div className={styles.codeBlock}>
        <div className={styles.codeComment}>// Sample data structure</div>
        <div>
          <span className={styles.codeKeyword}>const</span> <span className={styles.codeVariable}>config</span>{" "}
          <span className={styles.codeOperator}>=</span> <span className={styles.codeOperator}>{"{"}</span>
        </div>
        <div className={styles.codeIndent}>
          <span className={styles.codeVariable}>id</span>: <span className={styles.codeString}>"preview-001"</span>,
        </div>
        <div className={styles.codeIndent}>
          <span className={styles.codeVariable}>draggable</span>: <span className={styles.codeKeyword}>true</span>,
        </div>
        <div className={styles.codeIndent}>
          <span className={styles.codeVariable}>zIndex</span>: <span className={styles.codeNumber}>20</span>
        </div>
        <div>
          <span className={styles.codeOperator}>{"}"}</span>;
        </div>
      </div>
      <div className={styles.hint}>💡 Try dragging this panel around the canvas</div>
    </div>
  );
};

export const DataPreview: React.FC<DataPreviewProps> = ({ width = 300, height = 400 }) => {
  const [selectedTab, setSelectedTab] = React.useState<"properties" | "data">("properties");
  const dragHandleProps = useLayerDragHandle();

  const renderContent = (): React.ReactNode => {
    if (selectedTab === "properties") {
      return renderPropertiesTab(width, height);
    }
    return renderDataTab();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} {...dragHandleProps}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>📊</div>
          <h4 className={styles.headerTitle}>Data Preview</h4>
        </div>
        <div className={styles.headerBadge}>Draggable</div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${selectedTab === "properties" ? styles.tabActive : ""}`}
          onClick={() => setSelectedTab("properties")}
        >
          Properties
        </button>
        <button
          className={`${styles.tab} ${selectedTab === "data" ? styles.tabActive : ""}`}
          onClick={() => setSelectedTab("data")}
        >
          Data
        </button>
      </div>

      <div className={styles.content}>{renderContent()}</div>

      <div className={styles.footer}>Drag from header to reposition</div>
    </div>
  );
};
