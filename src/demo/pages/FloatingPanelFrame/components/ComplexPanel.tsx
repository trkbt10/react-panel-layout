/**
 * @file Complex FloatingPanelFrame sample
 */
import * as React from "react";
import {
  FloatingPanelCloseButton,
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelMeta,
  FloatingPanelControls,
  FloatingPanelContent,
} from "../../../../components/paneling/FloatingPanelFrame";
import styles from "./ComplexPanel.module.css";

import { DemoButton } from "../../../components/ui/DemoButton";

export const ComplexPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <FloatingPanelFrame
    style={{
      width: "500px",
      maxWidth: "100%",
    }}
  >
    <FloatingPanelHeader>
      <div style={{ flex: 1 }}>
        <FloatingPanelTitle>User Profile</FloatingPanelTitle>
        <FloatingPanelMeta>ID: 12345 • Online</FloatingPanelMeta>
      </div>
      <FloatingPanelControls>
        <DemoButton variant="outline" size="sm" style={{ marginRight: "0.5rem" }}>
          Edit
        </DemoButton>
        <FloatingPanelCloseButton onClick={onClose} style={{ color: "var(--rpl-demo-text-secondary)" }} />
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
