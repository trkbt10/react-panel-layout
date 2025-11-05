/**
 * @file Draggable overlays sample
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../panel-system/types";

const DraggablePanel: React.FC<{ title: string; color: string; children?: React.ReactNode }> = ({
  title,
  color,
  children,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "1rem",
          backgroundColor: color,
          color: "#fff",
          fontWeight: 600,
          cursor: "grab",
          userSelect: "none",
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
        {children ? children : <p style={{ margin: 0, color: "#666" }}>Drag the header to move this panel</p>}
      </div>
    </div>
  );
};

export const DraggableOverlays = () => {
  const config: PanelLayoutConfig = {
    areas: [["canvas"]],
    rows: [{ size: "100%" }],
    columns: [{ size: "100%" }],
    gap: "0",
  };

  const layers: LayerDefinition[] = [
    {
      id: "canvas",
      component: (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f0f4f8",
            backgroundImage: "linear-gradient(#e5e9ed 1px, transparent 1px), linear-gradient(90deg, #e5e9ed 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", color: "#999" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎨</div>
            <div>Canvas Area</div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Drag the floating panels around</div>
          </div>
        </div>
      ),
      gridArea: "canvas",
      zIndex: 0,
    },
    {
      id: "panel1",
      component: (
        <DraggablePanel title="🔧 Tools" color="#3498db">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button style={{ padding: "0.5rem", cursor: "pointer" }}>✏️ Pen</button>
            <button style={{ padding: "0.5rem", cursor: "pointer" }}>🖌️ Brush</button>
            <button style={{ padding: "0.5rem", cursor: "pointer" }}>⬜ Shape</button>
          </div>
        </DraggablePanel>
      ),
      position: { left: 20, top: 20 },
      width: 200,
      height: 250,
      zIndex: 10,
      floating: {
        draggable: true,
      },
    },
    {
      id: "panel2",
      component: (
        <DraggablePanel title="🎨 Colors" color="#e74c3c">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
            {["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#ecf0f1"].map((color) => {
              return (
                <div
                  key={color}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    backgroundColor: color,
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
              );
            })}
          </div>
        </DraggablePanel>
      ),
      position: { left: 260, top: 20 },
      width: 220,
      height: 200,
      zIndex: 11,
      floating: {
        draggable: true,
      },
    },
    {
      id: "panel3",
      component: (
        <DraggablePanel title="⚙️ Settings" color="#2ecc71">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Opacity</label>
              <input type="range" min="0" max="100" defaultValue="100" style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Size</label>
              <input type="range" min="1" max="50" defaultValue="10" style={{ width: "100%" }} />
            </div>
          </div>
        </DraggablePanel>
      ),
      position: { left: 20, top: 300 },
      width: 250,
      height: 180,
      zIndex: 12,
      floating: {
        draggable: true,
      },
    },
  ];

  return (
    <div style={{ width: "100%", height: "500px", overflow: "hidden", border: "1px solid #ddd" }}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};

export const code = `import { GridLayout } from "./components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "./panels";

const config: PanelLayoutConfig = {
  areas: [["canvas"]],
  rows: [{ size: "100%" }],
  columns: [{ size: "100%" }],
  gap: "0",
};

const layers: LayerDefinition[] = [
  {
    id: "canvas",
    component: <Canvas />,
    gridArea: "canvas",
    zIndex: 0,
  },
  {
    id: "panel1",
    component: <ToolsPanel />,
    floating: {
      bounds: {
        position: { left: 20, top: 20 },
        size: { width: 200, height: 250 },
      },
      draggable: true,
      zIndex: 10,
    },
  },
  {
    id: "panel2",
    component: <ColorsPanel />,
    floating: {
      bounds: {
        position: { left: 260, top: 20 },
        size: { width: 220, height: 200 },
      },
      draggable: true,
      zIndex: 11,
    },
  },
  {
    id: "panel3",
    component: <SettingsPanel />,
    floating: {
      bounds: {
        position: { left: 20, top: 300 },
        size: { width: 250, height: 180 },
      },
      draggable: true,
      zIndex: 12,
    },
  },
];

<GridLayout config={config} layers={layers} />`;
