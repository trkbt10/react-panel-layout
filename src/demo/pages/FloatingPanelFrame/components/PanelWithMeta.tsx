/**
 * @file FloatingPanelFrame with metadata sample
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelMeta,
  FloatingPanelContent,
} from "../../../../components/paneling/FloatingPanelFrame";
import styles from "./PanelWithMeta.module.css";

export const PanelWithMeta = () => (
  <FloatingPanelFrame
    style={{
      width: "400px",
      maxWidth: "100%",
      boxShadow: "var(--rpl-demo-shadow-lg)",
      borderRadius: "var(--rpl-demo-radius-lg)",
      border: "1px solid var(--rpl-demo-sidebar-border)",
      background: "#fff",
    }}
  >
    <FloatingPanelHeader>
      <FloatingPanelTitle>Settings</FloatingPanelTitle>
      <FloatingPanelMeta>Last updated: 2 minutes ago</FloatingPanelMeta>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <div className={styles.settingsContent}>
        <label>
          <input type="checkbox" /> Enable notifications
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Auto-save
        </label>
        <label>
          <input type="checkbox" /> Dark mode
        </label>
      </div>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);
