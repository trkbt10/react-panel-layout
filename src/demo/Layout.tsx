/**
 * @file Main layout component using GridLayout
 */
import * as React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { GridLayout } from "../components/grid/GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../panel-system/types";
import styles from "./Layout.module.css";

type NavGroupChild = {
  path: string;
  label: string;
};

type NavLinkItem = {
  path: string;
  label: string;
  icon: string;
};

type NavGroupItem = {
  label: string;
  icon: string;
  children: NavGroupChild[];
};

type NavItem = NavLinkItem | NavGroupItem;

const isNavGroupItem = (item: NavItem): item is NavGroupItem => {
  return "children" in item;
};

const SidebarNav: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/panel-demo", label: "Panel Layout Demo", icon: "📐" },
    {
      label: "Component Previews",
      icon: "🧩",
      children: [
        { path: "/components/panel-layout", label: "Panel Layout" },
        { path: "/components/floating-panel-frame", label: "FloatingPanelFrame" },
        { path: "/components/resizable-floating-panels", label: "Resizable Floating Panels" },
        { path: "/components/horizontal-divider", label: "HorizontalDivider" },
        { path: "/components/resize-handle", label: "ResizeHandle" },
      ],
    },
    { path: "/about", label: "About", icon: "ℹ️" },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Panel Layout</h2>
        <p className={styles.sidebarSubtitle}>Component Library</p>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item, index) => {
          if (isNavGroupItem(item)) {
            return (
              <div key={index} className={styles.navGroup}>
                <div className={styles.navGroupLabel}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div className={styles.navGroupChildren}>
                  {item.children.map((child) => {
                    const isActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`${styles.navChildLink} ${isActive ? styles.active : ""}`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`${styles.navLink} ${isActive ? styles.active : ""}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.sidebarFooter}>v1.0.0</div>
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
