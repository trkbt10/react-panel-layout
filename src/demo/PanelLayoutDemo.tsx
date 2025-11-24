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
import styles from "./PanelLayoutDemo.module.css";
import "./demo.css";

const DemoPanel: React.FC<{ title: string; bgColor?: string; children?: React.ReactNode }> = ({
  title,
  bgColor = "#f0f0f0",
  children,
}) => {
  const renderContent = () => {
    if (children) {
      return children;
    }
    return <p className={styles.panelText}>Panel content goes here...</p>;
  };

  return (
    <div className={styles.demoPanel} style={{ backgroundColor: bgColor }}>
      <h3 className={styles.panelTitle}>{title}</h3>
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
        <div className={styles.toolbar}>
          <button className={styles.toolbarButton}>File</button>
          <button className={styles.toolbarButton}>Edit</button>
          <button className={styles.toolbarButton}>View</button>
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
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem}>📁 Project Files</li>
          <li className={styles.sidebarItem}>🔍 Search</li>
          <li className={styles.sidebarItem}>⚙️ Settings</li>
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
        <div className={styles.canvasArea}>
          <p className={styles.canvasText}>Main canvas area - your content goes here</p>
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
        <div className={styles.inspectorForm}>
          <div>
            <label className={styles.formLabel}>Width</label>
            <input type="number" defaultValue={100} className={styles.formInputNumber} />
          </div>
          <div>
            <label className={styles.formLabel}>Height</label>
            <input type="number" defaultValue={100} className={styles.formInputNumber} />
          </div>
          <div>
            <label className={styles.formLabel}>Color</label>
            <input type="color" defaultValue="#3498db" className={styles.formInputColor} />
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
      <div className={styles.statusBar}>
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


export const PanelLayoutDemo: React.FC = () => {
  return (
    <DemoPage
      title="Panel Layout Demo"
      padding="2rem"
      intro={
        <p className={styles.intro}>
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
          <div className={styles.featuredContainer}>
            <GridLayout config={featuredConfig} layers={featuredLayers} />
          </div>
        </Story>
        <CodePreview code={featuredCode} title="Creative Studio Code" />
      </Section>
    </DemoPage>
  );
};
