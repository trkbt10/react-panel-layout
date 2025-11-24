/**
 * @file FloatingPanelFrame with controls sample
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelControls,
  FloatingPanelContent,
} from "../../../components/paneling/FloatingPanelFrame";
import styles from "./PanelWithControls.module.css";

export const PanelWithControls: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
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
      <FloatingPanelTitle>Notifications</FloatingPanelTitle>
      <FloatingPanelControls>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: "0.25rem 0.5rem",
            color: "var(--rpl-demo-text-secondary)",
          }}
        >
          ×
        </button>
      </FloatingPanelControls>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div className={`${styles.notificationItem} ${styles.notificationItemBlue}`}>
          <div className={styles.notificationTitle}>New message</div>
          <p className={styles.notificationText}>You have a new message from John</p>
        </div>
        <div className={`${styles.notificationItem} ${styles.notificationItemPurple}`}>
          <div className={styles.notificationTitle}>Task completed</div>
          <p className={styles.notificationText}>Your task "Review PR" is complete</p>
        </div>
      </div>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);

export const code = `import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelControls,
  FloatingPanelContent,
} from "./components/panels/FloatingPanelFrame";

export const PanelWithControls = ({ onClose }) => (
  <FloatingPanelFrame style={{ width: "400px" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Notifications</FloatingPanelTitle>
      <FloatingPanelControls>
        <button onClick={onClose}>×</button>
      </FloatingPanelControls>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <div className="notifications">
        <div className="notification">New message from John</div>
        <div className="notification">Task completed</div>
      </div>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);`;
