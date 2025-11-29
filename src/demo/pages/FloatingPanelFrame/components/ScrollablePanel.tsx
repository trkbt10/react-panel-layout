/**
 * @file Scrollable FloatingPanelFrame sample
 */
import * as React from "react";
import {
  FloatingPanelCloseButton,
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelControls,
  FloatingPanelContent,
} from "../../../../components/paneling/FloatingPanelFrame";
import styles from "./ScrollablePanel.module.css";

export const ScrollablePanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <FloatingPanelFrame
    style={{
      width: "400px",
      maxWidth: "100%",
      maxHeight: "400px",
      boxShadow: "var(--rpl-demo-shadow-lg)",
      borderRadius: "var(--rpl-demo-radius-lg)",
      border: "1px solid var(--rpl-demo-sidebar-border)",
      background: "#fff",
    }}
  >
    <FloatingPanelHeader>
      <FloatingPanelTitle>Long Article</FloatingPanelTitle>
      <FloatingPanelControls>
        <FloatingPanelCloseButton onClick={onClose} />
      </FloatingPanelControls>
    </FloatingPanelHeader>
    <FloatingPanelContent style={{ overflow: "auto" }}>
      <div className={styles.articleContent}>
        <h3>Lorem Ipsum</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>
        <p>Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.</p>
      </div>
    </FloatingPanelContent>
  </FloatingPanelFrame >
);
