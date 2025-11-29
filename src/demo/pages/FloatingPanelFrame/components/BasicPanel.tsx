/**
 * @file Basic FloatingPanelFrame sample
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "../../../../components/paneling/FloatingPanelFrame";
import styles from "./BasicPanel.module.css";

export const BasicPanel = () => (
  <div className={styles.container}>
    <FloatingPanelFrame style={{ width: "100%", height: "100%" }}>
      <FloatingPanelHeader>
        <FloatingPanelTitle>Panel Title</FloatingPanelTitle>
      </FloatingPanelHeader>
      <FloatingPanelContent>
        <p className={styles.contentText}>This is the panel content. You can put any React components here.</p>
      </FloatingPanelContent>
    </FloatingPanelFrame>
  </div>
);
