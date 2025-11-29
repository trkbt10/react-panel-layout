/**
 * @file Panel Layout Demo
 * Demonstrates the GridLayout component with various panel configurations
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../types";
import { DataPreview } from "../../components/DataPreview";
import { Section, Story } from "../../components/Story";
import { CodePreview } from "../../components/CodePreview";
import { DemoPage } from "../../components/layout/index";
import styles from "./PanelLayoutDemo.module.css";
import "../../demo.css";
import { FiFolder, FiSearch, FiSettings, FiCommand, FiLayers, FiLayout } from "react-icons/fi";

const DemoPanel: React.FC<{ title: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <div className={styles.demoPanel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelContent}>
        {children ? children : <p className={styles.panelText}>Panel content goes here...</p>}
      </div>
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
    { size: "52px" },
    { size: "1fr" },
    { size: "28px" },
  ],
  columns: [
    { size: "260px", resizable: true, minSize: 200, maxSize: 400 },
    { size: "1fr" },
    { size: "320px", resizable: true, minSize: 250, maxSize: 500 },
  ],
  gap: "0",
};

const featuredLayers: LayerDefinition[] = [
  {
    id: "toolbar",
    component: (
      <div className={styles.demoPanel} style={{ flexDirection: 'row', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid var(--rpl-demo-sidebar-border)' }}>
        <div className={styles.toolbar}>
          <button className={styles.toolbarButton}><FiCommand /> File</button>
          <button className={styles.toolbarButton}><FiLayout /> View</button>
          <button className={styles.toolbarButton}><FiLayers /> Layer</button>
        </div>
      </div>
    ),
    gridArea: "toolbar",
    zIndex: 10,
    visible: true,
  },
  {
    id: "sidebar",
    component: (
      <DemoPanel title="Explorer">
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem}><FiFolder /> src</li>
          <li className={styles.sidebarItem}><FiFolder /> components</li>
          <li className={styles.sidebarItem}><FiFolder /> assets</li>
          <li className={styles.sidebarItem}><FiSearch /> Search</li>
          <li className={styles.sidebarItem}><FiSettings /> Settings</li>
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
      <div className={styles.demoPanel} style={{ background: '#f5f5f7' }}>
        <div className={styles.canvasArea}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              background: 'var(--rpl-demo-accent)',
              borderRadius: '16px',
              margin: '0 auto 16px',
              opacity: 0.1
            }} />
            <p className={styles.canvasText}>Drag panels to resize</p>
          </div>
        </div>
      </div>
    ),
    gridArea: "canvas",
    zIndex: 0,
    visible: true,
  },
  {
    id: "inspector",
    component: (
      <DemoPanel title="Properties">
        <div className={styles.inspectorForm}>
          <div>
            <label className={styles.formLabel}>Dimensions</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" defaultValue={1920} className={styles.formInputNumber} placeholder="W" />
              <input type="number" defaultValue={1080} className={styles.formInputNumber} placeholder="H" />
            </div>
          </div>
          <div>
            <label className={styles.formLabel}>Fill</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" defaultValue="#0071e3" className={styles.formInputColor} style={{ width: 40 }} />
              <input type="text" defaultValue="#0071E3" className={styles.formInputNumber} />
            </div>
          </div>
          <div>
            <label className={styles.formLabel}>Opacity</label>
            <input type="range" style={{ width: '100%' }} />
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
        <span style={{ marginRight: 16 }}>Ready</span>
        <span style={{ opacity: 0.6 }}>UTF-8</span>
        <span style={{ marginLeft: 'auto', opacity: 0.6 }}>TypeScript React</span>
      </div>
    ),
    gridArea: "statusbar",
    zIndex: 10,
    visible: true,
  },
  {
    id: "data-preview",
    component: <DataPreview width={300} height={400} />,
    position: { left: 720, top: 100 },
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
    { size: "52px" },
    { size: "1fr" },
    { size: "28px" },
  ],
  columns: [
    { size: "260px", resizable: true, minSize: 200, maxSize: 400 },
    { size: "1fr" },
    { size: "320px", resizable: true, minSize: 250, maxSize: 500 },
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
    position: { left: 720, top: 100 },
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
      padding="var(--rpl-demo-space-xl)"
      intro={
        <p className={styles.intro}>
          Explore the featured workspace configuration and browse additional panel layout presets.
          This demo showcases the power of the grid system combined with floating panels.
        </p>
      }
    >
      <Section title="Featured Workspace">
        <Story
          title="Creative Studio"
          description="A complex IDE-like layout with toolbar, sidebar, inspector, and status bar. Try resizing the panels or dragging the floating data preview."
        >
          <div className={styles.featuredContainer}>
            <GridLayout config={featuredConfig} layers={featuredLayers} />
          </div>
        </Story>
        <CodePreview code={featuredCode} title="Configuration" />
      </Section>
    </DemoPage>
  );
};
