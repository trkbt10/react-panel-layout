/**
 * @file IDE-style layout sample
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../../types";
import { DataPreview } from "../../../components/DataPreview";
import styles from "./IDELayout.module.css";

import { DemoButton } from "../../../components/ui/DemoButton";

const DemoPanel: React.FC<{ title: string; bgColor?: string; children?: React.ReactNode }> = ({
  title,
  bgColor = "#f0f0f0",
  children,
}) => {
  return (
    <div className={styles.demoPanel} style={{ backgroundColor: bgColor }}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {children ? children : <p className={styles.panelText}>Panel content goes here...</p>}
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
    gap: "var(--rpl-demo-space-xs)",
  };

  const layers: LayerDefinition[] = [
    {
      id: "toolbar",
      component: (
        <DemoPanel title="Toolbar" bgColor="#2c3e50">
          <div className={styles.toolbar}>
            <DemoButton variant="ghost" size="sm" style={{ color: "#ecf0f1" }}>File</DemoButton>
            <DemoButton variant="ghost" size="sm" style={{ color: "#ecf0f1" }}>Edit</DemoButton>
            <DemoButton variant="ghost" size="sm" style={{ color: "#ecf0f1" }}>View</DemoButton>
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
              <input type="number" defaultValue={100} className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>Height</label>
              <input type="number" defaultValue={100} className={styles.formInput} />
            </div>
            <div>
              <label className={styles.formLabel}>Color</label>
              <input type="color" defaultValue="#3498db" className={styles.colorInput} />
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

  return (
    <div className={styles.container}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};
