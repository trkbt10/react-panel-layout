/**
 * @file Basic drawer layout sample (default Drawer styling)
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { LayerDefinition, PanelLayoutConfig } from "../../../types";
import { DemoButton } from "../../components/ui/DemoButton";
import styles from "./DrawerBasics.module.css";

export const DrawerBasics: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const config = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["content"]],
      rows: [{ size: "1fr" }],
      columns: [{ size: "1fr" }],
      gap: "0",
    }),
    [],
  );

  const layers: LayerDefinition[] = [
    {
      id: "content",
      gridArea: "content",
      component: (
        <div className={styles.container}>
          <div className={styles.hero}>
            <DemoButton variant="primary" size="lg" onClick={() => setOpen(true)}>
              Open drawer
            </DemoButton>
            <p className={styles.lead}>
              This sample uses the default Drawer styling. The drawer anchors to the left, covers the page surface, and
              uses the built-in header/close affordance.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "drawer-basics",
      component: (
        <div className={styles.drawerContent}>
          <h3 style={{ margin: 0 }}>Navigation</h3>
          <ul className={styles.drawerList}>
            <li className={styles.drawerItem}>
              Dashboard <small>Overview</small>
            </li>
            <li className={styles.drawerItem}>
              Projects <small>8 active</small>
            </li>
            <li className={styles.drawerItem}>
              Team <small>23 members</small>
            </li>
          </ul>
          <DemoButton variant="secondary" size="md" onClick={() => setOpen(false)}>
            Close drawer
          </DemoButton>
        </div>
      ),
      drawer: {
        open,
        onStateChange: setOpen,
        dismissible: true,
        header: { title: "Navigation" },
      },
      position: { left: 0 },
      width: 320,
      height: "100%",
      zIndex: 1200,
    },
  ];

  return <GridLayout config={config} layers={layers} />;
};

export const code = `import * as React from "react";
import { GridLayout } from "react-panel-layout";

const config = {
  areas: [["content"]],
  rows: [{ size: "1fr" }],
  columns: [{ size: "1fr" }],
};

export function DrawerBasics() {
  const [open, setOpen] = React.useState(false);

  const layers = [
    {
      id: "content",
      gridArea: "content",
      component: <button onClick={() => setOpen(true)}>Open drawer</button>,
    },
    {
      id: "drawer-basics",
      component: <DrawerContent />,
      drawer: {
        open,
        onStateChange: setOpen,
        dismissible: true,
        header: { title: "Navigation" },
      },
      position: { left: 0 },
      width: 320,
      height: "100%",
    },
  ];

  return <GridLayout config={config} layers={layers} />;
};

const DrawerContent = () => (
  <nav>
    <h3>Navigation</h3>
    {/* links */}
  </nav>
);`;
