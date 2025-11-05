/**
 * @file Panels with rich content using HorizontalDivider
 */
import * as React from "react";
import { HorizontalDivider } from "../../../components/resizer/HorizontalDivider";
import styles from "./samples.module.css";

export const PanelsWithRichContent: React.FC = () => {
  const [leftWidth, setLeftWidth] = React.useState(300);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(150, Math.min(500, prev + deltaX)));
  }, []);

  return (
    <div className={`${styles.demoContainer} ${styles.demoContainerTall}`}>
      <div className={styles.sidebarPanel} style={{ width: `${leftWidth}px` }}>
        <h4 className={styles.sidebarTitle}>Sidebar</h4>
        <p className={styles.panelInfo}>Width: {leftWidth}px</p>
        <nav className={styles.sidebarNav}>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Projects</a>
          <a href="#" className={styles.navLink}>Tasks</a>
          <a href="#" className={styles.navLink}>Settings</a>
        </nav>
        <div className={styles.recentFiles}>
          <h5>Recent Files</h5>
          <ul>
            <li>document.pdf</li>
            <li>image.png</li>
            <li>report.docx</li>
          </ul>
        </div>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div className={styles.mainPanel}>
        <h4 className={styles.mainTitle}>Main Content</h4>
        <p>This is the main content area. It contains the primary information and controls.</p>
        <div className={styles.cardList}>
          <div className={styles.card}>
            <h5>Card 1</h5>
            <p>Some content in a card</p>
          </div>
          <div className={styles.card}>
            <h5>Card 2</h5>
            <p>More content in another card</p>
          </div>
          <div className={styles.card}>
            <h5>Card 3</h5>
            <p>Even more content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const code = `import * as React from "react";
import { HorizontalDivider } from "./components/panels/HorizontalDivider";

export const PanelsWithRichContent = () => {
  const [leftWidth, setLeftWidth] = React.useState(300);

  const handleResize = React.useCallback((deltaX: number) => {
    setLeftWidth((prev) => Math.max(150, Math.min(500, prev + deltaX)));
  }, []);

  return (
    <div style={{ display: "flex", height: "400px" }}>
      <div style={{ width: \`\${leftWidth}px\`, overflow: "auto" }}>
        <h4>Sidebar</h4>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Projects</a>
        </nav>
      </div>
      <HorizontalDivider onResize={handleResize} />
      <div style={{ flex: 1, overflow: "auto" }}>
        <h4>Main Content</h4>
        <p>Primary content area...</p>
      </div>
    </div>
  );
};`;
