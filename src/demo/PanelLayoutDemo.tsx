/**
 * @file Panel Layout Demo
 * Demonstrates the GridLayout component with various panel configurations
 */
import * as React from "react";
import { GridLayout } from "../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../types";
import { DataPreview } from "./components/DataPreview";
import { Section, Story } from "./components/Story";
import { CodePreview } from "./components/CodePreview";
import { DemoPage } from "./pages/components";
// Keep only the featured workspace sample on this page to ensure single-sample per page.
import "./demo.css";

/**
 * Demo Panel Component
 */
const DemoPanel: React.FC<{ title: string; bgColor?: string; children?: React.ReactNode }> = ({
  title,
  bgColor = "#f0f0f0",
  children,
}) => {
  const renderContent = () => {
    if (children) {
      return children;
    }
    return <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>Panel content goes here...</p>;
  };

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
      {renderContent()}
    </div>
  );
};

const featuredConfig: PanelLayoutConfig = {
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

const featuredLayers: LayerDefinition[] = [
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
    position: { left: 720, top: 10 },
    width: 300,
    height: 400,
    zIndex: 20,
    floating: {
      draggable: true,
    },
    visible: true,
  },
];

const featuredCode = `import { GridLayout } from "../components/grid/GridLayout";
import { DataPreview } from "./components/DataPreview";

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
  { id: "toolbar", gridArea: "toolbar", component: <Toolbar /> },
  { id: "sidebar", gridArea: "sidebar", component: <Sidebar /> },
  { id: "canvas", gridArea: "canvas", component: <Canvas /> },
  { id: "inspector", gridArea: "inspector", component: <Inspector /> },
  { id: "statusbar", gridArea: "statusbar", component: <StatusBar /> },
  {
    id: "data-preview",
    position: { left: 720, top: 10 },
    width: 300,
    height: 400,
    zIndex: 20,
    floating: {
      draggable: true,
    },
    component: <DataPreview width={300} height={400} />,
  },
];

<GridLayout config={config} layers={layers} />;`;


/**
 * Panel Layout Demo Component
 */
export const PanelLayoutDemo: React.FC = () => {
  return (
    <DemoPage
      title="Panel Layout Demo"
      padding="2rem"
      intro={
        <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
          Explore the featured workspace configuration and browse additional panel layout presets grouped similarly to
          the Component Previews section.
        </p>
      }
    >
      <Section title="Featured Workspace">
        <Story
          title="Creative Studio"
          description="Primary demo used across the documentation with toolbar, canvas, inspector, and draggable overlays."
        >
          <div style={{ width: "100%", height: "600px" }}>
            <GridLayout config={featuredConfig} layers={featuredLayers} />
          </div>
        </Story>
        <CodePreview code={featuredCode} title="Creative Studio Code" />
      </Section>

      {/* Intentionally no gallery here; each sample has its own page under Components / PanelLayout. */}
    </DemoPage>
  );
};
