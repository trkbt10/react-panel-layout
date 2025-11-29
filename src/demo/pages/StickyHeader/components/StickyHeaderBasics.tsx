/**
 * @file Basic StickyHeader demo - native app-like overscroll experience
 */
import * as React from "react";
import { StickyHeader } from "../../../../sticky-header/index";
import type { StickyHeaderState } from "../../../../sticky-header/index";
import styles from "./StickyHeader.module.css";

const CoverContent: React.FC = () => (
  <div className={`${styles.coverPlaceholder} ${styles.coverGradient1}`}>Hero Image</div>
);

export const StickyHeaderBasics: React.FC = () => {
  const [state, setState] = React.useState<StickyHeaderState>({
    isStuck: false,
    scrollOffset: 0,
    containerType: "document",
  });

  return (
    <div className={styles.container}>
      <div className={styles.stateIndicator}>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>isStuck:</span>
          <span className={`${styles.stateValue} ${state.isStuck ? styles.stuck : ""}`}>
            {state.isStuck ? "true" : "false"}
          </span>
        </div>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>scrollOffset:</span>
          <span className={styles.stateValue}>{state.scrollOffset.toFixed(0)}px</span>
        </div>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>containerType:</span>
          <span className={styles.stateValue}>{state.containerType}</span>
        </div>
      </div>

      <div className={styles.scrollArea}>
        <StickyHeader cover={<CoverContent />} onStateChange={setState}>
          <div className={styles.header}>
            <h1>StickyHeader Demo</h1>
            <p>Pull down to see the overscroll effect (works best in PWA/WebApp mode)</p>
          </div>
        </StickyHeader>

        <div className={styles.content}>
          <h2>About StickyHeader</h2>
          <p>
            StickyHeader provides a native app-like experience for SPAs and PWAs. When the user pulls down beyond the
            top of the page (overscroll/bounce), the cover content expands to fill the visible area.
          </p>

          <h2>Features</h2>
          <ul>
            <li>
              <strong>Overscroll Effect</strong> - Cover image expands during pull-down bounce
            </li>
            <li>
              <strong>State Tracking</strong> - Know when header is "stuck" at top
            </li>
            <li>
              <strong>Nested Scroll Support</strong> - Works inside overflow:scroll containers
            </li>
            <li>
              <strong>Inline Styles</strong> - No external CSS dependencies
            </li>
          </ul>

          <h2>Usage</h2>
          <p>The StickyHeader component accepts a cover prop for the background content and children for the header:</p>

          <h2>State Callback</h2>
          <p>
            Use the onStateChange callback to receive updates about the sticky state. This is useful for changing header
            styles when scrolled.
          </p>

          <h2>Render Function</h2>
          <p>
            You can also use a render function as children to access state directly and conditionally render based on
            isStuck:
          </p>

          <h2>Scroll Down</h2>
          <p>Keep scrolling to see how the cover shrinks as you scroll past it...</p>
          <p>The header area has a fixed height, and the cover image behind it will shrink as you scroll.</p>
          <p>This creates a parallax-like effect that feels natural and app-like.</p>

          <h2>Best Experience</h2>
          <p>For the best experience, try this demo:</p>
          <ul>
            <li>On iOS Safari with "Add to Home Screen"</li>
            <li>In a PWA shell</li>
            <li>In a Capacitor/Cordova hybrid app</li>
          </ul>
          <p>In these environments, the rubber-band bounce effect will show the cover image expanding naturally.</p>
        </div>
      </div>
    </div>
  );
};
