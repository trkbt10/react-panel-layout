/**
 * @file Dashboard-style layout sample
 */
import * as React from "react";
import { GridLayout } from "../../../components/layout/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../panels";

const DashboardCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        padding: "1.5rem",
        boxSizing: "border-box",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>{title}</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
        </div>
        <div style={{ fontSize: "2rem", opacity: 0.3 }}>{icon}</div>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        padding: "1.5rem",
        boxSizing: "border-box",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
      <div
        style={{
          height: "calc(100% - 2rem)",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
        }}
      >
        Chart Area
      </div>
    </div>
  );
};

export const DashboardLayout = () => {
  const config: PanelLayoutConfig = {
    areas: [
      ["header", "header", "header", "header"],
      ["stat1", "stat2", "stat3", "stat4"],
      ["chart1", "chart1", "chart2", "chart2"],
      ["chart3", "chart3", "chart3", "activity"],
    ],
    rows: [{ size: "80px" }, { size: "120px" }, { size: "200px" }, { size: "1fr" }],
    columns: [{ size: "1fr" }, { size: "1fr" }, { size: "1fr" }, { size: "1fr" }],
    gap: "1rem",
    style: { padding: "1rem", backgroundColor: "#f5f5f5" },
  };

  const layers: LayerDefinition[] = [
    {
      id: "header",
      component: (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            padding: "1.5rem",
            boxSizing: "border-box",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
          <div style={{ fontSize: "0.875rem", color: "#666" }}>Last updated: Just now</div>
        </div>
      ),
      gridArea: "header",
    },
    {
      id: "stat1",
      component: <DashboardCard title="Total Users" value="12,543" icon="👥" color="#3498db" />,
      gridArea: "stat1",
    },
    {
      id: "stat2",
      component: <DashboardCard title="Revenue" value="$24.5k" icon="💰" color="#2ecc71" />,
      gridArea: "stat2",
    },
    {
      id: "stat3",
      component: <DashboardCard title="Orders" value="1,234" icon="📦" color="#f39c12" />,
      gridArea: "stat3",
    },
    {
      id: "stat4",
      component: <DashboardCard title="Growth" value="+15%" icon="📈" color="#e74c3c" />,
      gridArea: "stat4",
    },
    {
      id: "chart1",
      component: <ChartCard title="Sales Overview" />,
      gridArea: "chart1",
    },
    {
      id: "chart2",
      component: <ChartCard title="Traffic Sources" />,
      gridArea: "chart2",
    },
    {
      id: "chart3",
      component: <ChartCard title="Revenue Trends" />,
      gridArea: "chart3",
    },
    {
      id: "activity",
      component: (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            padding: "1.5rem",
            boxSizing: "border-box",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "auto",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600 }}>Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["New order #1234", "User registered", "Payment received", "Support ticket #567"].map((activity, i) => {
              return (
                <div key={i} style={{ padding: "0.5rem", backgroundColor: "#f8f9fa", borderRadius: "4px", fontSize: "0.875rem" }}>
                  {activity}
                </div>
              );
            })}
          </div>
        </div>
      ),
      gridArea: "activity",
    },
  ];

  return (
    <div style={{ width: "100%", height: "600px", overflow: "auto", border: "1px solid #ddd" }}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};

export const code = `import { GridLayout } from "./components/layout/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "./panels";

const config: PanelLayoutConfig = {
  areas: [
    ["header", "header", "header", "header"],
    ["stat1", "stat2", "stat3", "stat4"],
    ["chart1", "chart1", "chart2", "chart2"],
    ["chart3", "chart3", "chart3", "activity"],
  ],
  rows: [
    { size: "80px" },
    { size: "120px" },
    { size: "200px" },
    { size: "1fr" },
  ],
  columns: [
    { size: "1fr" },
    { size: "1fr" },
    { size: "1fr" },
    { size: "1fr" },
  ],
  gap: "1rem",
  style: { padding: "1rem", backgroundColor: "#f5f5f5" },
};

const layers: LayerDefinition[] = [
  {
    id: "header",
    component: <Header />,
    gridArea: "header",
  },
  {
    id: "stat1",
    component: <StatCard title="Total Users" value="12,543" />,
    gridArea: "stat1",
  },
  // ... more layers
];

<GridLayout config={config} layers={layers} />`;
