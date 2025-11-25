/**
 * @file Main layout component using GridLayout
 */
import * as React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { GridLayout } from "../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../types";
import styles from "./Layout.module.css";
import { demoCategories } from "./routes";
import { useMedia } from "./hooks/useMedia";

import { FiHome, FiLayout, FiChevronRight, FiMenu } from "react-icons/fi";

const SidebarNav: React.FC = () => {
  const location = useLocation();
  const topLinks = [
    { path: "/", label: "Home", icon: <FiHome /> },
    { path: "/panel-demo", label: "Panel Layout Demo", icon: <FiLayout /> },
  ] as const;

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Panel Layout</h2>
        <p className={styles.sidebarSubtitle}>Component Library</p>
      </div>
      <nav className={styles.nav}>
        {topLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`${styles.navLink} ${isActive ? styles.active : ""}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {demoCategories.map((category) => {
          const isOpen = location.pathname.startsWith(category.base);
          return (
            <details key={category.id} className={styles.navCategory} open={isOpen}>
              <summary className={styles.navCategorySummary}>
                <span className={styles.navIcon}>{category.icon}</span>
                <span style={{ flex: 1 }}>{category.label}</span>
                <FiChevronRight className={styles.navArrow} />
              </summary>
              <div className={styles.navGroupChildren}>
                {/* Category index link (optional) could be added here */}
                {category.pages.map((page) => {
                  const fullPath = `${category.base}/${page.path}`;
                  const isActive = location.pathname === fullPath;
                  return (
                    <Link key={page.id} to={fullPath} className={`${styles.navChildLink} ${isActive ? styles.active : ""}`}>
                      {page.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </nav>
      <div className={styles.sidebarFooter}>v{__APP_VERSION__}</div>
    </div>
  );
};

const MainContent: React.FC<{ isStacked: boolean; onOpenNav: () => void }> = ({ isStacked, onOpenNav }) => {
  const mobileHeader = React.useMemo(() => {
    if (!isStacked) {
      return null;
    }

    return (
      <div className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileNavButton}
          onClick={onOpenNav}
          aria-label="Open navigation drawer"
        >
          <FiMenu aria-hidden />
          <span className={styles.mobileNavLabel}>Menu</span>
        </button>
        <h2 className={styles.mobileTitle}>Panel Layout</h2>
      </div>
    );
  }, [isStacked, onOpenNav]);

  return (
    <div className={styles.mainContent}>
      {mobileHeader}
      <Outlet />
    </div>
  );
};

export const Layout: React.FC = () => {
  const isStackedLayout = useMedia("(max-width: 960px)");
  const [navOpen, setNavOpen] = React.useState(false);
  const handleOpenNav = React.useCallback(() => setNavOpen(true), []);

  React.useEffect(() => {
    if (!isStackedLayout && navOpen) {
      setNavOpen(false);
    }
  }, [isStackedLayout, navOpen]);

  const config = React.useMemo<PanelLayoutConfig>(() => {
    if (isStackedLayout) {
      return {
        areas: [["main"]],
        columns: [{ size: "1fr" }],
        rows: [{ size: "100vh" }],
      };
    }

    return {
      areas: [["sidebar", "main"]],
      columns: [
        { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
        { size: "1fr" },
      ],
      rows: [{ size: "100vh" }],
    };
  }, [isStackedLayout]);

  const layers = React.useMemo<LayerDefinition[]>(() => {
    if (isStackedLayout) {
      return [
        {
          id: "main",
          gridArea: "main",
          component: <MainContent isStacked onOpenNav={handleOpenNav} />,
        },
        {
          id: "sidebar-drawer",
          component: <SidebarNav />,
          drawer: {
            open: navOpen,
            onStateChange: setNavOpen,
            dismissible: true,
            ariaLabel: "Navigation",
            header: { title: "Navigation", showCloseButton: true },
            transitionMode: "view-transition",
          },
          width: 320,
          position: { left: 0 },
          zIndex: 10000,
        },
      ];
    }

    return [
      {
        id: "sidebar",
        gridArea: "sidebar",
        component: <SidebarNav />,
      },
      {
        id: "main",
        gridArea: "main",
        component: <MainContent isStacked={false} onOpenNav={handleOpenNav} />,
      },
    ];
  }, [handleOpenNav, isStackedLayout, navOpen]);

  return <GridLayout config={config} layers={layers} />;
};
