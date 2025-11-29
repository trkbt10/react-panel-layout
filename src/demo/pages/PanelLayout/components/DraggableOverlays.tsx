/**
 * @file Draggable overlays sample - demonstrating FloatingBehavior with chrome
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../../types";
import styles from "./DraggableOverlays.module.css";

import { DemoButton } from "../../../components/ui/DemoButton";

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
    // New API: chrome enabled - header auto-becomes drag handle
    {
      id: "panel1",
      component: (
        <div className={styles.toolsList}>
          <DemoButton variant="secondary" size="sm">✏️ Pen</DemoButton>
          <DemoButton variant="secondary" size="sm">🖌️ Brush</DemoButton>
          <DemoButton variant="secondary" size="sm">⬜ Shape</DemoButton>
        </div>
      ),
      floating: {
        defaultPosition: { left: 20, top: 20 },
        defaultSize: { width: 200, height: 250 },
        zIndex: 10,
        draggable: true,
        chrome: true,
        header: {
          title: "Tools",
          showCloseButton: true,
        },
        onClose: () => console.log("Tools panel closed"),
      },
    },
    // New API: chrome enabled with resize
    {
      id: "panel2",
      component: (
        <div className={styles.colorGrid}>
          {["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#ecf0f1"].map((color) => (
            <div
              key={color}
              className={styles.colorSwatch}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      ),
      floating: {
        defaultPosition: { left: 260, top: 20 },
        defaultSize: { width: 220, height: 200 },
        zIndex: 11,
        draggable: true,
        resizable: true,
        chrome: true,
        header: {
          title: "Colors",
        },
        constraints: {
          minWidth: 150,
          minHeight: 150,
          maxWidth: 400,
          maxHeight: 400,
        },
      },
    },
    // New API: chrome enabled
    {
      id: "panel3",
      component: (
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
      ),
      floating: {
        defaultPosition: { left: 20, top: 300 },
        defaultSize: { width: 250, height: 180 },
        zIndex: 12,
        draggable: true,
        chrome: true,
        header: {
          title: "Settings",
        },
      },
    },
  ];

  return (
    <div className={styles.container}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};
