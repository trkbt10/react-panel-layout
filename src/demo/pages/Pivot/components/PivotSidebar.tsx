/**
 * @file Pivot as sidebar navigation demo
 */
import * as React from "react";
import { usePivot } from "../../../../pivot/index";
import type { PivotItem } from "../../../../pivot/index";
import styles from "./Pivot.module.css";

const items: PivotItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    content: (
      <div className={styles.content}>
        <h3>Dashboard</h3>
        <p>Welcome to your dashboard. Here you can see an overview of your activity.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div style={{ background: "#e3f2fd", padding: 16, borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>128</div>
            <div style={{ fontSize: 12, color: "#666" }}>Active Users</div>
          </div>
          <div style={{ background: "#e8f5e9", padding: 16, borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>42</div>
            <div style={{ fontSize: 12, color: "#666" }}>Projects</div>
          </div>
          <div style={{ background: "#fff3e0", padding: 16, borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>89%</div>
            <div style={{ fontSize: 12, color: "#666" }}>Completion</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    content: (
      <div className={styles.content}>
        <h3>Projects</h3>
        <p>Manage your projects and track progress.</p>
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {["Website Redesign", "Mobile App", "API Integration", "Documentation"].map((project) => (
            <li
              key={project}
              style={{
                padding: 12,
                background: "#f5f5f5",
                marginBottom: 8,
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{project}</span>
              <span style={{ color: "#666", fontSize: 12 }}>In Progress</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "team",
    label: "Team",
    content: (
      <div className={styles.content}>
        <h3>Team Members</h3>
        <p>View and manage your team.</p>
        <div style={{ marginTop: 16 }}>
          {["Alice", "Bob", "Charlie", "Diana"].map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderBottom: "1px solid #eee",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#0066cc",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>Developer</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    content: (
      <div className={styles.content}>
        <h3>Settings</h3>
        <p>Configure your workspace preferences.</p>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 12 }}>
            <input type="checkbox" defaultChecked /> Email notifications
          </label>
          <label style={{ display: "block", marginBottom: 12 }}>
            <input type="checkbox" /> Push notifications
          </label>
          <label style={{ display: "block", marginBottom: 12 }}>
            <input type="checkbox" defaultChecked /> Weekly digest
          </label>
        </div>
      </div>
    ),
  },
];

export const PivotSidebar: React.FC = () => {
  const { getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: "dashboard",
  });

  return (
    <div className={styles.sidebarContainer}>
      <aside className={styles.sidebar}>
        <nav className={styles.sidebarNav}>
          {items.map((item) => {
            const props = getItemProps(item.id);
            return (
              <button
                key={item.id}
                className={styles.sidebarItem}
                onClick={props.onClick}
                aria-selected={props["aria-selected"]}
                tabIndex={props.tabIndex}
                data-active={props["data-active"]}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
