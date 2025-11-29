/**
 * @file Dashboard-style layout sample
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../../types";
import styles from "./DashboardLayout.module.css";

import { DemoCard } from "../../../components/ui/DemoCard";

const DashboardCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <DemoCard className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>{title}</div>
          <div className={styles.cardValue} style={{ color }}>{value}</div>
        </div>
        <div className={styles.cardIcon}>{icon}</div>
      </div>
    </DemoCard>
  );
};

const ChartCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <DemoCard className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartArea}>
        Chart Area
      </div>
    </DemoCard>
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
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Dashboard</h1>
          <div className={styles.headerMeta}>Last updated: Just now</div>
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
        <div className={styles.activityCard}>
          <h3 className={styles.activityTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {["New order #1234", "User registered", "Payment received", "Support ticket #567"].map((activity, i) => (
              <div key={i} className={styles.activityItem}>
                {activity}
              </div>
            ))}
          </div>
        </div>
      ),
      gridArea: "activity",
    },
  ];

  return (
    <div className={styles.container}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};
