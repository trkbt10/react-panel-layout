/**
 * @file Drawer menu layout sample using DrawerLayers + GridLayout
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import type { LayerDefinition, PanelLayoutConfig } from "../../../../types";
import { DemoButton } from "../../../components/ui/DemoButton";
import styles from "./DrawerMenuLayout.module.css";

const DrawerContent: React.FC = () => {
  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>
        <div>
          <div className={styles.drawerTitle}>Workspace menu</div>
          <div className={styles.drawerMeta}>Projects, links, and quick actions</div>
        </div>
        <span className={styles.navTag}>New</span>
      </div>

      <div className={styles.drawerSection}>
        <div className={styles.sectionLabel}>Projects</div>
        <ul className={styles.navList}>
          <li className={`${styles.navItem} ${styles.navItemActive}`}>
            Product design
            <span className={styles.navTag}>Live</span>
          </li>
          <li className={styles.navItem}>
            Marketing site
            <span className={styles.navTag}>QA</span>
          </li>
          <li className={styles.navItem}>
            Mobile UI kit
            <span className={styles.navTag}>Beta</span>
          </li>
        </ul>
      </div>

      <div className={styles.drawerSection}>
        <div className={styles.sectionLabel}>Shortcuts</div>
        <ul className={styles.navList}>
          <li className={styles.navItem}>Components library</li>
          <li className={styles.navItem}>Tokens & theming</li>
          <li className={styles.navItem}>Changelog</li>
        </ul>
      </div>

      <div className={styles.drawerFooter}>
        <strong>Invite reviewers</strong>
        Share the workspace with reviewers and track approvals in one place.
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
              <span className={styles.brand}>Orion Workbench</span>
              <div className={styles.breadcrumbs}>
                <span>Workspace</span>
                <span>/</span>
                <span className={styles.crumbActive}>Overview</span>
              </div>
            </div>
            <div className={styles.topActions}>
              <DemoButton variant="ghost" size="sm">Share</DemoButton>
              <DemoButton variant="primary" size="sm">Publish</DemoButton>
            </div>
          </header>

          <div className={styles.body}>
            <div className={styles.main}>
              <div className={styles.mainHeader}>
                <div className={styles.titleGroup}>
                  <h3>Product Overview</h3>
                  <p>Monitor progress across platforms and hand-offs in one place.</p>
                </div>
                <DemoButton variant="outline" size="sm">Export</DemoButton>
              </div>

              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <p className={styles.cardTitle}>Active screens</p>
                  <p className={styles.cardValue}>128</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardTitle}>Components synced</p>
                  <p className={styles.cardValue}>482</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardTitle}>Open hand-offs</p>
                  <p className={styles.cardValue}>18</p>
                </div>
              </div>

              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.badge}>1</span>
                  <div className={styles.timelineText}>
                    <span className={styles.timelineTitle}>Navigation updated</span>
                    <span className={styles.timelineMeta}>2m ago • Figma</span>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.badge}>2</span>
                  <div className={styles.timelineText}>
                    <span className={styles.timelineTitle}>Tokens synced to iOS</span>
                    <span className={styles.timelineMeta}>18m ago • Mobile</span>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.badge}>3</span>
                  <div className={styles.timelineText}>
                    <span className={styles.timelineTitle}>Chart variants added</span>
                    <span className={styles.timelineMeta}>1h ago • Charts</span>
                  </div>
                </div>
              </div>
            </div>

            <aside className={styles.aside}>
              <div className={styles.asideHeader}>
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
        chrome: false,
        inline: true,
        ariaLabel: "Workspace Menu",
      },
      position: { left: 0 },
      width: 340,
      height: "100%",
      zIndex: 1200,
    },
  ];

  return (
    <div className={styles.container}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
};
