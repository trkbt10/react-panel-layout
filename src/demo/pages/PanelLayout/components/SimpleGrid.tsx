/**
 * @file Simple 2x2 grid layout sample
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../../types";
import styles from "./SimpleGrid.module.css";

import { DemoCard } from "../../../components/ui/DemoCard";

const GridCell: React.FC<{ title: string; color: string }> = ({ title, color }) => {
  return (
    <DemoCard
      hoverEffect
      className={styles.gridCell}
      style={{ backgroundColor: color }}
    >
      {title}
    </DemoCard>
  );
};

export const SimpleGrid = () => {
  const config: PanelLayoutConfig = {
    areas: [
      ["cell1", "cell2"],
      ["cell3", "cell4"],
    ],
    rows: [{ size: "1fr" }, { size: "1fr" }],
    columns: [{ size: "1fr" }, { size: "1fr" }],
    gap: "1rem",
  };

  const layers: LayerDefinition[] = [
    {
      id: "cell1",
      component: <GridCell title="Cell 1" color="#3498db" />,
      gridArea: "cell1",
    },
    {
      id: "cell2",
      component: <GridCell title="Cell 2" color="#e74c3c" />,
      gridArea: "cell2",
    },
    {
      id: "cell3",
      component: <GridCell title="Cell 3" color="#2ecc71" />,
      gridArea: "cell3",
    },
    {
      id: "cell4",
      component: <GridCell title="Cell 4" color="#f39c12" />,
      gridArea: "cell4",
    },
  ];

  return (
    <div className={styles.container}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};
