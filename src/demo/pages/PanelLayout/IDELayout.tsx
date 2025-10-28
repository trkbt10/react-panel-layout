/**
 * @file IDE-style layout sample
 */
import * as React from "react";
import { GridLayout } from "../../../components/layout/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../panels";
import { DataPreview } from "../../components/DataPreview";

const DemoPanel: React.FC<{ title: string; bgColor?: string; children?: React.ReactNode }> = ({
  title,
  bgColor = "#f0f0f0",
  children,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bgColor,
        padding: "1rem",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
      {children ? children : <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>Panel content goes here...</p>}
    </div>
  );
};

export const IDELayout = () => {
  const config: PanelLayoutConfig = {
    areas: [
      ["toolbar", "toolbar", "toolbar"],
      ["sidebar", "canvas", "inspector"],
      ["statusbar", "statusbar", "statusbar"],
    ],
    rows: [
      { size: "60px" },
      { size: "1fr" },
      { size: "30px" },
    ],
    columns: [
      { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
      { size: "1fr" },
      { size: "300px", resizable: true, minSize: 250, maxSize: 500 },
    ],
    gap: "0",
  };

  const layers: LayerDefinition[] = [
    {
      id: "toolbar",
      component: (
        <DemoPanel title="Toolbar" bgColor="#2c3e50">
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>File</button>
            <button style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>Edit</button>
            <button style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>View</button>
          </div>
        </DemoPanel>
      ),
      gridArea: "toolbar",
      zIndex: 10,
      visible: true,
    },
    {
      id: "sidebar",
      component: (
        <DemoPanel title="Sidebar" bgColor="#ecf0f1">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ padding: "0.5rem", cursor: "pointer", borderRadius: "4px" }}>📁 Project Files</li>
            <li style={{ padding: "0.5rem", cursor: "pointer", borderRadius: "4px" }}>🔍 Search</li>
            <li style={{ padding: "0.5rem", cursor: "pointer", borderRadius: "4px" }}>⚙️ Settings</li>
          </ul>
        </DemoPanel>
      ),
      gridArea: "sidebar",
      zIndex: 1,
      visible: true,
    },
    {
      id: "canvas",
      component: (
        <DemoPanel title="Canvas" bgColor="#ffffff">
          <div
            style={{
              border: "2px dashed #ccc",
              borderRadius: "8px",
              padding: "2rem",
              textAlign: "center",
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ color: "#999", fontSize: "1rem" }}>Main canvas area - your content goes here</p>
          </div>
        </DemoPanel>
      ),
      gridArea: "canvas",
      zIndex: 0,
      visible: true,
    },
    {
      id: "inspector",
      component: (
        <DemoPanel title="Inspector" bgColor="#ecf0f1">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Width</label>
              <input type="number" defaultValue={100} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Height</label>
              <input type="number" defaultValue={100} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Color</label>
              <input type="color" defaultValue="#3498db" style={{ width: "100%", padding: "0.25rem" }} />
            </div>
          </div>
        </DemoPanel>
      ),
      gridArea: "inspector",
      zIndex: 1,
      visible: true,
    },
    {
      id: "statusbar",
      component: (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#34495e",
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            color: "#ecf0f1",
            fontSize: "0.75rem",
          }}
        >
          Ready | Line 1, Column 1
        </div>
      ),
      gridArea: "statusbar",
      zIndex: 10,
      visible: true,
    },
  {
    id: "data-preview",
    component: <DataPreview width={300} height={400} />,
    floating: {
      bounds: {
        position: { left: 720, top: 10 },
        size: { width: 300, height: 400 },
      },
      draggable: true,
      zIndex: 20,
    },
    visible: true,
  },
];

  return (
    <div style={{ width: "100%", height: "600px", overflow: "hidden", border: "1px solid #ddd" }}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};

export const code = `import { GridLayout } from "./components/layout/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "./panels";

const config: PanelLayoutConfig = {
  areas: [
    ["toolbar", "toolbar", "toolbar"],
    ["sidebar", "canvas", "inspector"],
    ["statusbar", "statusbar", "statusbar"],
  ],
  rows: [
    { size: "60px" },
    { size: "1fr" },
    { size: "30px" },
  ],
  columns: [
    { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
    { size: "1fr" },
    { size: "300px", resizable: true, minSize: 250, maxSize: 500 },
  ],
  gap: "0",
};

const layers: LayerDefinition[] = [
  {
    id: "toolbar",
    component: <Toolbar />,
    gridArea: "toolbar",
    zIndex: 10,
  },
  {
    id: "sidebar",
    component: <Sidebar />,
    gridArea: "sidebar",
    zIndex: 1,
  },
  {
    id: "canvas",
    component: <Canvas />,
    gridArea: "canvas",
    zIndex: 0,
  },
  {
    id: "inspector",
    component: <Inspector />,
    gridArea: "inspector",
    zIndex: 1,
  },
  {
    id: "statusbar",
    component: <StatusBar />,
    gridArea: "statusbar",
    zIndex: 10,
  },
  // Draggable floating panel
  {
    id: "data-preview",
    component: <DataPreview />,
    floating: {
      bounds: {
        position: { left: 720, top: 10 },
        size: { width: 300, height: 400 },
      },
      draggable: true,
      zIndex: 20,
    },
  },
];

<GridLayout config={config} layers={layers} />`;
