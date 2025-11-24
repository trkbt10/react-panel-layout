/**
 * @file Main layout component using GridLayout
 */
import * as React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { GridLayout } from "../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../types";
import styles from "./Layout.module.css";
import { demoCategories } from "./routes";

import { FiHome, FiLayout, FiChevronRight } from "react-icons/fi";

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

const MainContent: React.FC = () => {
  return (
    <div className={styles.mainContent}>
      <Outlet />
    </div>
  );
};

export const Layout: React.FC = () => {
  const config: PanelLayoutConfig = {
    areas: [["sidebar", "main"]],
    columns: [
      { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
      { size: "1fr" },
    ],
    rows: [{ size: "100vh" }],
  };

  const layers: LayerDefinition[] = [
    {
      id: "sidebar",
      gridArea: "sidebar",
      component: <SidebarNav />,
    },
    {
      id: "main",
      gridArea: "main",
      component: <MainContent />,
    },
  ];

  return <GridLayout config={config} layers={layers} />;
};
