/**
 * @file Drawer animation modes comparison demo
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { LayerDefinition, PanelLayoutConfig, DrawerBehavior } from "../../../types";
import { DemoButton } from "../../components/ui/DemoButton";
import styles from "./DrawerAnimations.module.css";

type TransitionMode = DrawerBehavior["transitionMode"];

type DrawerCardProps = {
  mode: TransitionMode;
  label: string;
  description: string;
  badgeClass: string;
};

const DrawerContent: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className={styles.drawerContent}>
    <h4>Sample Menu</h4>
    <ul>
      <li>Dashboard</li>
      <li>Settings</li>
      <li>Profile</li>
    </ul>
    <DemoButton variant="secondary" size="sm" onClick={onClose}>
      Close
    </DemoButton>
  </div>
);

const DrawerCard: React.FC<DrawerCardProps> = ({ mode, label, description, badgeClass }) => {
  const [open, setOpen] = React.useState(false);

  const config = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["main"]],
      rows: [{ size: "1fr" }],
      columns: [{ size: "1fr" }],
      gap: "0",
    }),
    [],
  );

  const layers = React.useMemo<LayerDefinition[]>(
    () => [
      {
        id: "main",
        gridArea: "main",
        component: (
          <DemoButton variant="primary" size="md" onClick={() => setOpen(true)}>
            Open
          </DemoButton>
        ),
      },
      {
        id: `drawer-${mode}`,
        component: <DrawerContent onClose={() => setOpen(false)} />,
        drawer: {
          open,
          onStateChange: setOpen,
          dismissible: true,
          transitionMode: mode,
          transitionDuration: "300ms",
          transitionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
          header: { title: `${label} Drawer` },
          inline: true,
        },
        position: { left: 0 },
        width: 180,
        height: "100%",
        zIndex: 10,
      },
    ],
    [mode, label, open],
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>
          {label} <span className={`${styles.badge} ${badgeClass}`}>{mode}</span>
        </h3>
        <p>{description}</p>
      </div>
      <div className={styles.cardBody}>
        <GridLayout config={config} layers={layers} />
      </div>
    </div>
  );
};

export const DrawerAnimations: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <h2>Drawer Transition Modes</h2>
        <p>Compare different animation strategies for drawer open/close transitions.</p>
      </div>

      <div className={styles.grid}>
        <DrawerCard
          mode="none"
          label="No Animation"
          description="Instant show/hide without transitions."
          badgeClass={styles.badgeNone}
        />
        <DrawerCard
          mode="css"
          label="CSS Transition"
          description="Smooth transform animation via CSS."
          badgeClass={styles.badgeCss}
        />
      </div>
    </div>
  );
};

export const code = `import * as React from "react";
import { GridLayout, type DrawerBehavior } from "react-panel-layout";

type TransitionMode = DrawerBehavior["transitionMode"];

export function DrawerWithAnimation({ mode }: { mode: TransitionMode }) {
  const [open, setOpen] = React.useState(false);

  const config = {
    areas: [["main"]],
    rows: [{ size: "1fr" }],
    columns: [{ size: "1fr" }],
  };

  const layers = [
    {
      id: "main",
      gridArea: "main",
      component: <button onClick={() => setOpen(true)}>Open</button>,
    },
    {
      id: "drawer",
      component: <DrawerContent onClose={() => setOpen(false)} />,
      drawer: {
        open,
        onStateChange: setOpen,
        dismissible: true,
        // Transition mode: "none" | "css"
        transitionMode: mode,
        transitionDuration: "300ms",
        transitionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
        header: { title: "Menu" },
      },
      position: { left: 0 },
      width: 280,
      height: "100%",
    },
  ];

  return <GridLayout config={config} layers={layers} />;
}`;
