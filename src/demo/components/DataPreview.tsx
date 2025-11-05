/**
 * @file Data Preview Component
 * A draggable preview panel for demonstrating floating UI elements
 */
import * as React from "react";
import { useLayerDragHandle } from "../../modules/grid/useLayerDragHandle";

export type DataPreviewProps = {
  width?: number;
  height?: number;
};

/**
 * Render properties tab content
 */
const renderPropertiesTab = (width: number, height: number): React.ReactNode => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div>
        <div style={{ color: "#858585", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>ID</div>
        <div style={{ fontFamily: "monospace" }}>data-preview-001</div>
      </div>
      <div>
        <div style={{ color: "#858585", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>Type</div>
        <div>Floating Panel</div>
      </div>
      <div>
        <div style={{ color: "#858585", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>Position Mode</div>
        <div style={{ fontFamily: "monospace", color: "#4ec9b0" }}>absolute</div>
      </div>
      <div>
        <div style={{ color: "#858585", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>Dimensions</div>
        <div style={{ fontFamily: "monospace" }}>
          {width}px × {height}px
        </div>
      </div>
      <div>
        <div style={{ color: "#858585", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>Draggable</div>
        <div style={{ color: "#4ec9b0" }}>✓ Yes</div>
      </div>
      <div>
        <div style={{ color: "#858585", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>Z-Index</div>
        <div style={{ fontFamily: "monospace" }}>20</div>
      </div>
    </div>
  );
};

/**
 * Render data tab content
 */
const renderDataTab = (): React.ReactNode => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div
        style={{
          padding: "0.5rem",
          backgroundColor: "#2d2d30",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "0.75rem",
        }}
      >
        <div style={{ color: "#858585" }}>// Sample data structure</div>
        <div>
          <span style={{ color: "#569cd6" }}>const</span> <span style={{ color: "#9cdcfe" }}>config</span>{" "}
          <span style={{ color: "#d4d4d4" }}>=</span> <span style={{ color: "#d4d4d4" }}>{"{"}</span>
        </div>
        <div style={{ paddingLeft: "1rem" }}>
          <span style={{ color: "#9cdcfe" }}>id</span>: <span style={{ color: "#ce9178" }}>"preview-001"</span>,
        </div>
        <div style={{ paddingLeft: "1rem" }}>
          <span style={{ color: "#9cdcfe" }}>draggable</span>: <span style={{ color: "#569cd6" }}>true</span>,
        </div>
        <div style={{ paddingLeft: "1rem" }}>
          <span style={{ color: "#9cdcfe" }}>zIndex</span>: <span style={{ color: "#b5cea8" }}>20</span>
        </div>
        <div>
          <span style={{ color: "#d4d4d4" }}>{"}"}</span>;
        </div>
      </div>
      <div style={{ color: "#858585", fontSize: "0.6875rem", marginTop: "0.5rem" }}>
        💡 Try dragging this panel around the canvas
      </div>
    </div>
  );
};

/**
 * Data Preview Component
 * Displays sample data in a draggable floating panel
 */
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
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: "#2d2d30",
          borderBottom: "1px solid #3e3e42",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "grab",
        }}
        {...dragHandleProps}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ fontSize: "1.125rem" }}>📊</div>
          <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Data Preview</h4>
        </div>
        <div style={{ fontSize: "0.75rem", color: "#858585" }}>Draggable</div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#252526",
          borderBottom: "1px solid #3e3e42",
        }}
      >
        <button
          style={{
            padding: "0.375rem 0.75rem",
            backgroundColor: selectedTab === "properties" ? "#007acc" : "transparent",
            color: selectedTab === "properties" ? "#ffffff" : "#cccccc",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onClick={() => {
            setSelectedTab("properties");
          }}
        >
          Properties
        </button>
        <button
          style={{
            padding: "0.375rem 0.75rem",
            backgroundColor: selectedTab === "data" ? "#007acc" : "transparent",
            color: selectedTab === "data" ? "#ffffff" : "#cccccc",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onClick={() => {
            setSelectedTab("data");
          }}
        >
          Data
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "1rem", overflow: "auto", fontSize: "0.8125rem" }}>{renderContent()}</div>

      {/* Footer */}
      <div
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#2d2d30",
          borderTop: "1px solid #3e3e42",
          fontSize: "0.6875rem",
          color: "#858585",
          textAlign: "center",
        }}
      >
        Drag from header to reposition
      </div>
    </div>
  );
};
