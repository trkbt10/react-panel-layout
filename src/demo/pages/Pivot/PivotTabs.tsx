/**
 * @file Pivot as tab navigation demo
 */
import * as React from "react";
import { usePivot } from "../../../pivot";
import type { PivotItem } from "../../../pivot";
import styles from "./Pivot.module.css";

const items: PivotItem[] = [
  {
    id: "general",
    label: "General",
    content: (
      <div className={styles.content}>
        <h3>General Settings</h3>
        <p>Configure basic application preferences.</p>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" defaultChecked /> Enable notifications
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" /> Dark mode
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" defaultChecked /> Auto-save
          </label>
        </div>
      </div>
    ),
  },
  {
    id: "account",
    label: "Account",
    content: (
      <div className={styles.content}>
        <h3>Account Settings</h3>
        <p>Manage your account information.</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Email</label>
            <input type="email" defaultValue="user@example.com" style={{ padding: 8, width: "100%", maxWidth: 300 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Username</label>
            <input type="text" defaultValue="johndoe" style={{ padding: 8, width: "100%", maxWidth: 300 }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "privacy",
    label: "Privacy",
    content: (
      <div className={styles.content}>
        <h3>Privacy Settings</h3>
        <p>Control your privacy preferences.</p>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" /> Share usage data
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" defaultChecked /> Remember login
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" /> Allow cookies
          </label>
        </div>
      </div>
    ),
  },
  {
    id: "advanced",
    label: "Advanced",
    content: (
      <div className={styles.content}>
        <h3>Advanced Settings</h3>
        <p>Configure advanced options for power users.</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12 }}>API Endpoint</label>
            <input
              type="text"
              defaultValue="https://api.example.com"
              style={{ padding: 8, width: "100%", maxWidth: 400 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Timeout (ms)</label>
            <input type="number" defaultValue="5000" style={{ padding: 8, width: 100 }} />
          </div>
        </div>
      </div>
    ),
  },
];

export const PivotTabs: React.FC = () => {
  const { getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: "general",
  });

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabList} role="tablist">
        {items.map((item) => {
          const props = getItemProps(item.id);
          return (
            <button
              key={item.id}
              className={styles.tab}
              role="tab"
              onClick={props.onClick}
              aria-selected={props["aria-selected"]}
              tabIndex={props.tabIndex}
              data-active={props["data-active"]}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className={styles.tabPanel} role="tabpanel">
        <Outlet />
      </div>
    </div>
  );
};

export const code = `import * as React from "react";
import { usePivot } from "react-panel-layout/pivot";

const items = [
  { id: "general", label: "General", content: <GeneralSettings /> },
  { id: "account", label: "Account", content: <AccountSettings /> },
  { id: "privacy", label: "Privacy", content: <PrivacySettings /> },
  { id: "advanced", label: "Advanced", content: <AdvancedSettings /> },
];

export function TabNavigation() {
  const { getItemProps, Outlet } = usePivot({
    items,
    defaultActiveId: "general",
  });

  return (
    <div className="tabs-container">
      <div className="tab-list" role="tablist">
        {items.map((item) => {
          const props = getItemProps(item.id);
          return (
            <button
              key={item.id}
              className="tab"
              role="tab"
              onClick={props.onClick}
              aria-selected={props["aria-selected"]}
              tabIndex={props.tabIndex}
              data-active={props["data-active"]}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="tab-panel" role="tabpanel">
        <Outlet />
      </div>
    </div>
  );
}`;
