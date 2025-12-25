/**
 * @file Basic StickyArea demo - native app-like overscroll experience
 */
import * as React from "react";
import { StickyArea } from "../../../../sticky-header/index";
import type { StickyAreaPosition, StickyAreaState } from "../../../../sticky-header/index";
import styles from "./StickyHeader.module.css";

const HeaderCover: React.FC = () => (
  <div className={`${styles.coverPlaceholder} ${styles.coverGradient1}`}>Header Cover</div>
);

const FooterCover: React.FC = () => (
  <div className={`${styles.coverPlaceholder} ${styles.coverGradient2}`}>Footer Cover</div>
);

export const StickyHeaderBasics: React.FC = () => {
  const [headerState, setHeaderState] = React.useState<StickyAreaState>({
    isStuck: false,
    scrollOffset: 0,
  });

  const [footerState, setFooterState] = React.useState<StickyAreaState>({
    isStuck: false,
    scrollOffset: 0,
  });

  const [position, setPosition] = React.useState<StickyAreaPosition>("top");

  const state = position === "top" ? headerState : footerState;

  return (
    <div className={styles.container}>
      <div className={styles.stateIndicator}>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>position:</span>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as StickyAreaPosition)}
            className={styles.stateValue}
          >
            <option value="top">top (header)</option>
            <option value="bottom">bottom (footer)</option>
          </select>
        </div>
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
      </div>

      <div className={styles.scrollArea}>
        <StickyArea position="top" cover={<HeaderCover />} onStateChange={setHeaderState}>
          <div className={styles.header}>
            <h1>StickyArea Demo</h1>
            <p>Pull down to see the overscroll effect (works best in PWA/WebApp mode)</p>
          </div>
        </StickyArea>

        <div className={styles.content}>
          <h2>About StickyArea</h2>
          <p>
            StickyArea provides a native app-like experience for SPAs and PWAs. It supports both header (top) and
            footer (bottom) positions. When the user overscrolls, the cover content expands to fill the visible area.
          </p>

          <h2>Features</h2>
          <ul>
            <li>
              <strong>Header &amp; Footer</strong> - Use position="top" or position="bottom"
            </li>
            <li>
              <strong>Overscroll Effect</strong> - Cover expands during bounce
            </li>
            <li>
              <strong>State Tracking</strong> - Know when area is "stuck" at edge
            </li>
          </ul>

          <h2>Usage</h2>
          <p>Use position prop to control header or footer behavior:</p>

          <h2>Scroll to Bottom</h2>
          <p>Keep scrolling to see the footer with its own cover that expands on pull-up overscroll...</p>
          <p>The footer area works the same as the header, but anchored to the bottom.</p>
          <p>Try changing the position selector above to see the state for header or footer.</p>
        </div>

        <StickyArea position="bottom" cover={<FooterCover />} onStateChange={setFooterState}>
          <div className={styles.footer}>
            <p>Footer Area - Pull up to see the overscroll effect</p>
          </div>
        </StickyArea>
      </div>
    </div>
  );
};
