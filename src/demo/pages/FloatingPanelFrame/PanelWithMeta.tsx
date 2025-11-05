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
} from "../../../modules/paneling/FloatingPanelFrame";
import styles from "./samples.module.css";

export const PanelWithMeta = () => (
  <FloatingPanelFrame style={{ width: "400px", maxWidth: "100%" }}>
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

export const code = `import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelMeta,
  FloatingPanelContent,
} from "./components/panels/FloatingPanelFrame";

export const PanelWithMeta = () => (
  <FloatingPanelFrame style={{ width: "400px" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Settings</FloatingPanelTitle>
      <FloatingPanelMeta>Last updated: 2 minutes ago</FloatingPanelMeta>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <label><input type="checkbox" /> Enable notifications</label>
      <label><input type="checkbox" defaultChecked /> Auto-save</label>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);`;
