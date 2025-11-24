/**
 * @file Simple 2x2 grid layout sample
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../types";

import { DemoCard } from "../../components/ui/DemoCard";

const GridCell: React.FC<{ title: string; color: string }> = ({ title, color }) => {
  return (
    <DemoCard
      hoverEffect
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: color,
        padding: "var(--rpl-demo-space-lg)",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        fontWeight: 600,
        color: "#fff",
        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
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
    <div style={{ width: "100%", height: "400px", border: "1px solid #ddd" }}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};

export const code = `import { GridLayout } from "./components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "./panels";

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
    component: <Cell1 />,
    gridArea: "cell1",
  },
  {
    id: "cell2",
    component: <Cell2 />,
    gridArea: "cell2",
  },
  {
    id: "cell3",
    component: <Cell3 />,
    gridArea: "cell3",
  },
  {
    id: "cell4",
    component: <Cell4 />,
    gridArea: "cell4",
  },
];

<GridLayout config={config} layers={layers} />`;
