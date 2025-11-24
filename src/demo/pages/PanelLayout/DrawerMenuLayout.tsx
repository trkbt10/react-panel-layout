/**
 * @file Drawer menu layout sample using DrawerLayers + GridLayout
 */
import * as React from "react";
import { GridLayout } from "../../../components/grid/GridLayout";
import type { LayerDefinition, PanelLayoutConfig } from "../../../types";
import { DemoButton } from "../../components/ui/DemoButton";
import styles from "./DrawerMenuLayout.module.css";

const DrawerContent: React.FC = () => {
  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>
        <div className={styles.appBadge}>UX</div>
        <div>
          <div>Design System</div>
          <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Navigation & Assets</div>
        </div>
      </div>

      <div className={styles.drawerSection}>
        <div className={styles.sectionLabel}>Projects</div>
        <ul className={styles.navList}>
          <li className={`${styles.navItem} ${styles.navItemActive}`}>
            Workspace
            <span className={styles.navTag}>Live</span>
          </li>
          <li className={styles.navItem}>
            Marketing
            <span className={styles.navTag}>QA</span>
          </li>
          <li className={styles.navItem}>
            Mobile
            <span className={styles.navTag}>Beta</span>
          </li>
        </ul>
      </div>

      <div className={styles.drawerSection}>
        <div className={styles.sectionLabel}>Quick links</div>
        <ul className={styles.navList}>
          <li className={styles.navItem}>Components</li>
          <li className={styles.navItem}>Icons</li>
          <li className={styles.navItem}>Changelog</li>
        </ul>
      </div>

      <div className={styles.footerCard}>
        <strong>Hand-off ready</strong>
        Sync tokens, components, and documentation with your team.
      </div>
    </div>
  );
};

export const DrawerMenuLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const openMenu = React.useCallback(() => {
    setMenuOpen(true);
  }, []);

  const config = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["surface"]],
      rows: [{ size: "1fr" }],
      columns: [{ size: "1fr" }],
      gap: "0",
    }),
    [],
  );

  const layers: LayerDefinition[] = [
    {
      id: "surface",
      gridArea: "surface",
      component: (
        <div className={styles.shell}>
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <button className={styles.menuButton} onClick={openMenu} type="button">
                <span className={styles.menuIcon}>☰</span>
                Menu
              </button>
              <div className={styles.breadcrumbs}>
                <span>Workspace</span>
                <span>/</span>
                <span className={styles.crumbActive}>Overview</span>
              </div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.presence}>4 online</div>
              <DemoButton variant="ghost" size="sm">Share</DemoButton>
              <DemoButton variant="primary" size="sm">Publish</DemoButton>
            </div>
          </header>

          <div className={styles.body}>
            <div className={styles.main}>
              <div className={styles.mainHeader}>
                <div className={styles.titleGroup}>
                  <h3>Product Overview</h3>
                  <p>Monitor performance and hand-off progress across platforms</p>
                </div>
                <DemoButton variant="secondary" size="sm">Export</DemoButton>
              </div>

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Active screens</span>
                  <div className={styles.statValue}>
                    128 <span className={styles.trend}>+12 this week</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Components synced</span>
                  <div className={styles.statValue}>
                    482 <span className={styles.trend}>+4%</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Open hand-offs</span>
                  <div className={styles.statValue}>
                    18 <span className={styles.trend}>-3</span>
                  </div>
                </div>
              </div>

              <div className={styles.activity}>
                <div className={styles.activityItem}>
                  <span>Header navigation updated</span>
                  <span className={styles.activityTag}>Figma</span>
                </div>
                <div className={styles.activityItem}>
                  <span>Tokens synced to iOS</span>
                  <span className={styles.activityTag}>Mobile</span>
                </div>
                <div className={styles.activityItem}>
                  <span>Added new chart variants</span>
                  <span className={styles.activityTag}>Charts</span>
                </div>
              </div>
            </div>

            <aside className={styles.sidePanel}>
              <div className={styles.sideHeader}>
                <div>
                  <div>Review queue</div>
                  <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Hand-offs pending approval</div>
                </div>
                <span className={styles.chip}>6</span>
              </div>

              <div className={styles.list}>
                <div className={styles.listItem}>
                  Billing dashboard
                  <small>UI / Desktop</small>
                </div>
                <div className={styles.listItem}>
                  Session replay
                  <small>UX copy</small>
                </div>
                <div className={styles.listItem}>
                  Settings drawer
                  <small>Mobile</small>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ),
    },
    {
      id: "drawer-menu",
      component: <DrawerContent />,
      drawer: {
        open: menuOpen,
        onStateChange: setMenuOpen,
        dismissible: true,
        header: { title: "Workspace Menu" },
      },
      position: { left: 0 },
      width: 340,
      height: "100%",
      zIndex: 1200,
      backdropStyle: { background: "linear-gradient(135deg, rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.55))" },
      style: { top: 0 },
    },
  ];

  return (
    <div className={styles.container}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};

export const code = `import * as React from "react";
import { GridLayout } from "react-panel-layout";

const config = {
  areas: [["surface"]],
  rows: [{ size: "1fr" }],
  columns: [{ size: "1fr" }],
};

export function DrawerMenuLayout() {
  const [open, setOpen] = React.useState(false);

  const layers = [
    {
      id: "surface",
      gridArea: "surface",
      component: (
        <>
          <button onClick={() => setOpen(true)}>Open menu</button>
          <main>{/* page layout */}</main>
        </>
      ),
    },
    {
      id: "drawer-menu",
      component: <DrawerContent />,
      drawer: {
        open,
        onStateChange: setOpen,
        dismissible: true,
        header: { title: "Workspace Menu" },
      },
      position: { left: 0 },
      width: 340,
      height: "100%",
      backdropStyle: { background: "rgba(15, 23, 42, 0.55)" },
    },
  ];

  return <GridLayout config={config} layers={layers} />;
}

const DrawerContent = () => (
  <div className="drawer">
    <h3>Projects</h3>
    {/* nav items */}
  </div>
);`;
