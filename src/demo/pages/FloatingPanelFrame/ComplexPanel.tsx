/**
 * @file Complex FloatingPanelFrame sample
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelMeta,
  FloatingPanelControls,
  FloatingPanelContent,
} from "../../../components/panels/FloatingPanelFrame";
import styles from "./samples.module.css";

export const ComplexPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <FloatingPanelFrame style={{ width: "500px", maxWidth: "100%" }}>
    <FloatingPanelHeader>
      <div style={{ flex: 1 }}>
        <FloatingPanelTitle>User Profile</FloatingPanelTitle>
        <FloatingPanelMeta>ID: 12345 • Online</FloatingPanelMeta>
      </div>
      <FloatingPanelControls>
        <button
          style={{
            background: "transparent",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "0.25rem 0.75rem",
            marginRight: "0.5rem",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: "0.25rem 0.5rem",
          }}
        >
          ×
        </button>
      </FloatingPanelControls>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar} />
          <div>
            <span className={styles.profileName}>Jane Doe</span>
            <span className={styles.profileEmail}>jane.doe@example.com</span>
          </div>
        </div>
        <div>
          <p className={styles.profileBioLabel}>Bio</p>
          <p className={styles.profileBio}>Frontend developer passionate about building great user experiences.</p>
        </div>
        <div className={styles.profileStats}>
          <div>
            <span className={styles.profileStat}>128</span>
            <span className={styles.profileStatLabel}>Posts</span>
          </div>
          <div>
            <span className={styles.profileStat}>2.4k</span>
            <span className={styles.profileStatLabel}>Followers</span>
          </div>
          <div>
            <span className={styles.profileStat}>512</span>
            <span className={styles.profileStatLabel}>Following</span>
          </div>
        </div>
      </div>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);

export const code = `// Complex panel with profile information
export const ComplexPanel = ({ onClose }) => (
  <FloatingPanelFrame style={{ width: "500px" }}>
    <FloatingPanelHeader>
      <div style={{ flex: 1 }}>
        <FloatingPanelTitle>User Profile</FloatingPanelTitle>
        <FloatingPanelMeta>ID: 12345 • Online</FloatingPanelMeta>
      </div>
      <FloatingPanelControls>
        <button>Edit</button>
        <button onClick={onClose}>×</button>
      </FloatingPanelControls>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      {/* Profile content with avatar, bio, stats */}
    </FloatingPanelContent>
  </FloatingPanelFrame>
);`;
