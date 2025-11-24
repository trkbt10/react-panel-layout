/**
 * @file Draggable overlays sample
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../types";
import styles from "./DraggableOverlays.module.css";

import { DemoButton } from "../../components/ui/DemoButton";
import { DemoCard } from "../../components/ui/DemoCard";

const DraggablePanel: React.FC<{ title: string; color: string; children?: React.ReactNode }> = ({
  title,
  color,
  children,
}) => {
  return (
    <DemoCard className={styles.draggablePanel}>
      <div className={styles.panelHeader} style={{ backgroundColor: color }}>
        {title}
      </div>
      <div className={styles.panelContent}>
        {children ? children : <p className={styles.panelText}>Drag the header to move this panel</p>}
      </div>
    </DemoCard>
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
        <div className={styles.canvas}>
          <div className={styles.canvasContent}>
            <div className={styles.canvasIcon}>🎨</div>
            <div>Canvas Area</div>
            <div className={styles.canvasHint}>Drag the floating panels around</div>
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
          <div className={styles.toolsList}>
            <DemoButton variant="secondary" size="sm">✏️ Pen</DemoButton>
            <DemoButton variant="secondary" size="sm">🖌️ Brush</DemoButton>
            <DemoButton variant="secondary" size="sm">⬜ Shape</DemoButton>
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
          <div className={styles.colorGrid}>
            {["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#ecf0f1"].map((color) => (
              <div
                key={color}
                className={styles.colorSwatch}
                style={{ backgroundColor: color }}
              />
            ))}
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
          <div className={styles.settingsForm}>
            <div>
              <label className={styles.formLabel}>Opacity</label>
              <input type="range" min="0" max="100" defaultValue="100" className={styles.rangeInput} />
            </div>
            <div>
              <label className={styles.formLabel}>Size</label>
              <input type="range" min="1" max="50" defaultValue="10" className={styles.rangeInput} />
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
    <div className={styles.container}>
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
