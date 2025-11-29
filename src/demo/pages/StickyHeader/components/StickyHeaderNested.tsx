/**
 * @file Nested scroll StickyHeader demo - works inside overflow:scroll containers
 */
import * as React from "react";
import { StickyHeader } from "../../../../sticky-header/index";
import type { StickyHeaderState } from "../../../../sticky-header/index";
import styles from "./StickyHeader.module.css";

const CoverContent1: React.FC = () => <div className={`${styles.coverPlaceholder} ${styles.coverGradient1}`} />;

const CoverContent2: React.FC = () => <div className={`${styles.coverPlaceholder} ${styles.coverGradient2}`} />;

const CoverContent3: React.FC = () => <div className={`${styles.coverPlaceholder} ${styles.coverGradient3}`} />;

type ScrollBoxProps = {
  title: string;
  cover: React.ReactNode;
  onStateChange?: (state: StickyHeaderState) => void;
};

const ScrollBox: React.FC<ScrollBoxProps> = ({ title, cover, onStateChange }) => {
  return (
    <div className={styles.nestedScrollBox}>
      <div className={styles.nestedScrollArea}>
        <StickyHeader cover={cover} onStateChange={onStateChange}>
          <div className={styles.nestedHeader}>
            <h3>{title}</h3>
          </div>
        </StickyHeader>

        <div className={styles.nestedContent}>
          <p>This StickyHeader is inside a nested scroll container with overflow: auto.</p>
          <p>
            The component automatically detects the scroll container and adjusts its behavior. Instead of using
            position: fixed (which would break inside a scroll container), it uses position: absolute and tracks the
            container's scroll position.
          </p>
          <p>Scroll down to see the header shrink...</p>
          <p>The cover area will reduce in height as you scroll past it.</p>
          <p>
            When the header reaches the top of the container, the isStuck state becomes true. This can be used to change
            header styles.
          </p>
          <p>Keep scrolling to see the effect in action.</p>
          <p>This works great for app-like interfaces with multiple scrollable regions.</p>
          <p>Each region can have its own StickyHeader with independent state.</p>
        </div>
      </div>
    </div>
  );
};

export const StickyHeaderNested: React.FC = () => {
  const [states, setStates] = React.useState<Record<string, StickyHeaderState>>({});

  const handleStateChange = (id: string) => (state: StickyHeaderState) => {
    setStates((prev) => ({ ...prev, [id]: state }));
  };

  return (
    <div className={styles.nestedContainer}>
      <div className={styles.nestedDescription}>
        <h3>Nested Scroll Containers</h3>
        <p>
          StickyHeader automatically detects when it's inside a scrollable container (overflow: scroll/auto) and adapts
          its behavior. Each container below has its own independent StickyHeader.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div>
          <div style={{ marginBottom: "8px", fontSize: "13px", color: "#666" }}>
            Box 1: {states["box1"]?.isStuck ? "Stuck" : "Not stuck"} ({states["box1"]?.containerType ?? "detecting..."})
          </div>
          <ScrollBox title="Purple Gradient" cover={<CoverContent1 />} onStateChange={handleStateChange("box1")} />
        </div>

        <div>
          <div style={{ marginBottom: "8px", fontSize: "13px", color: "#666" }}>
            Box 2: {states["box2"]?.isStuck ? "Stuck" : "Not stuck"} ({states["box2"]?.containerType ?? "detecting..."})
          </div>
          <ScrollBox title="Pink Gradient" cover={<CoverContent2 />} onStateChange={handleStateChange("box2")} />
        </div>

        <div>
          <div style={{ marginBottom: "8px", fontSize: "13px", color: "#666" }}>
            Box 3: {states["box3"]?.isStuck ? "Stuck" : "Not stuck"} ({states["box3"]?.containerType ?? "detecting..."})
          </div>
          <ScrollBox title="Blue Gradient" cover={<CoverContent3 />} onStateChange={handleStateChange("box3")} />
        </div>
      </div>

      <div style={{ marginTop: "24px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>How It Works</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#666" }}>
          <li>StickyHeader uses useScrollContainer hook to detect the nearest scrollable ancestor</li>
          <li>For document scroll: Uses position: fixed for the cover</li>
          <li>For nested containers: Uses position: absolute and tracks container scroll</li>
          <li>The containerType in state tells you which mode is active</li>
        </ul>
      </div>
    </div>
  );
};
