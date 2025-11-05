/**
 * @file FloatingPanelFrame component preview page
 */
import * as React from "react";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelMeta,
  FloatingPanelControls,
  FloatingPanelContent,
} from "../../modules/paneling/FloatingPanelFrame";
import { Section, Story, StoryActionButton } from "../components/Story";
import { CodeBlock } from "../components/CodeBlock";
import styles from "./FloatingPanelFramePreview.module.css";

// ============================================================================
// Sample Components (Exported for Storybook-style usage)
// ============================================================================

export const BasicPanel = () => (
  <FloatingPanelFrame style={{ width: "400px", maxWidth: "100%" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Panel Title</FloatingPanelTitle>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <p>This is the panel content. You can put any React components here.</p>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);

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

export const PanelWithControls: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <FloatingPanelFrame style={{ width: "400px", maxWidth: "100%" }}>
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

export const ScrollablePanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <FloatingPanelFrame style={{ width: "400px", maxWidth: "100%", maxHeight: "400px" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Long Article</FloatingPanelTitle>
      <FloatingPanelControls>
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
  </FloatingPanelFrame>
);

// ============================================================================
// Sample Code Strings
// ============================================================================

const BASIC_PANEL_CODE = `import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "./components/panels/FloatingPanelFrame";

export const BasicPanel = () => (
  <FloatingPanelFrame style={{ width: "400px" }}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Panel Title</FloatingPanelTitle>
    </FloatingPanelHeader>
    <FloatingPanelContent>
      <p>This is the panel content.</p>
    </FloatingPanelContent>
  </FloatingPanelFrame>
);`;

const PANEL_WITH_META_CODE = `import {
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

// ============================================================================
// Preview Page Component
// ============================================================================

export const FloatingPanelFramePreview: React.FC = () => {
  const [showPanel1, setShowPanel1] = React.useState(true);
  const [showPanel2, setShowPanel2] = React.useState(true);
  const [showPanel3, setShowPanel3] = React.useState(true);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>FloatingPanelFrame Components</h1>

      <Section title="Basic Panel">
        <Story
          title="Simple Panel"
          description="Basic floating panel with header, title, and content"
        >
          <BasicPanel />
        </Story>
        <CodeBlock code={BASIC_PANEL_CODE} title="Basic Panel Code" />
      </Section>

      <Section title="Panel with Meta Information">
        <Story
          title="Panel with Meta"
          description="Panel with title and metadata"
        >
          <PanelWithMeta />
        </Story>
        <CodeBlock code={PANEL_WITH_META_CODE} title="Panel with Meta Code" />
      </Section>

      <Section title="Panel with Controls">
        <Story
          title="Panel with Action Buttons"
          description="Panel with header controls"
          actions={!showPanel1 ? <StoryActionButton onClick={() => setShowPanel1(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel1 ? <PanelWithControls onClose={() => setShowPanel1(false)} /> : <p>Panel closed</p>}
        </Story>
      </Section>

      <Section title="Complex Panel">
        <Story
          title="Full Featured Panel"
          description="Panel with all components: title, meta, controls, and rich content"
          actions={!showPanel2 ? <StoryActionButton onClick={() => setShowPanel2(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel2 ? <ComplexPanel onClose={() => setShowPanel2(false)} /> : <p>Panel closed</p>}
        </Story>
      </Section>

      <Section title="Scrollable Content">
        <Story
          title="Long Content Panel"
          description="Panel with scrollable content area"
          actions={!showPanel3 ? <StoryActionButton onClick={() => setShowPanel3(true)}>Show Panel</StoryActionButton> : null}
        >
          {showPanel3 ? <ScrollablePanel onClose={() => setShowPanel3(false)} /> : <p>Panel closed</p>}
        </Story>
      </Section>
    </div>
  );
};
