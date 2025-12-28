/**
 * @file Swipe gestures drawer demo
 *
 * Demonstrates edge swipe to open and drag to close functionality.
 */
import * as React from "react";
import { GridLayout } from "../../../../components/grid/GridLayout";
import { SwipeSafeZone } from "../../../../components/gesture/SwipeSafeZone";
import type { LayerDefinition, PanelLayoutConfig, DrawerBehavior } from "../../../../types";
import { DemoButton } from "../../../components/ui/DemoButton";
import styles from "./DrawerSwipe.module.css";

type AnchorPosition = "left" | "right";

export const DrawerSwipe: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState<AnchorPosition>("left");
  const [edgeSwipeOpen, setEdgeSwipeOpen] = React.useState(true);
  const [swipeClose, setSwipeClose] = React.useState(true);

  const config = React.useMemo<PanelLayoutConfig>(
    () => ({
      areas: [["content"]],
      rows: [{ size: "1fr" }],
      columns: [{ size: "1fr" }],
      gap: "0",
    }),
    [],
  );

  const drawerConfig = React.useMemo<DrawerBehavior>(
    () => ({
      open,
      onStateChange: setOpen,
      dismissible: true,
      header: { title: "Navigation" },
      anchor,
      swipeGestures: {
        edgeSwipeOpen,
        swipeClose,
        edgeWidth: 24,
        dismissThreshold: 0.3,
      },
    }),
    [open, anchor, edgeSwipeOpen, swipeClose],
  );

  const layers: LayerDefinition[] = [
    {
      id: "content",
      gridArea: "content",
      component: (
        <div className={styles.container}>
          {/* Edge indicator */}
          <div
            className={`${styles.edgeIndicator} ${anchor === "left" ? styles.edgeIndicatorLeft : styles.edgeIndicatorRight}`}
          />

          <div className={styles.hero}>
            <DemoButton variant="primary" size="lg" onClick={() => setOpen(true)}>
              Open drawer
            </DemoButton>
            <p className={styles.lead}>
              This demo shows swipe gesture support for drawers. Swipe from the {anchor} edge to open, or drag the
              drawer toward the edge to close.
            </p>
          </div>

          <div className={styles.instructions}>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>1</span>
              <span>Swipe from the {anchor} edge to open the drawer</span>
            </div>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>2</span>
              <span>Drag the drawer content {anchor === "left" ? "left" : "right"} to close</span>
            </div>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>3</span>
              <span>Release before 30% threshold to snap back</span>
            </div>
          </div>

          <div className={styles.configPanel}>
            <h4 className={styles.configTitle}>Configuration</h4>
            <div className={styles.configOptions}>
              <label className={styles.configOption}>
                <input type="checkbox" checked={edgeSwipeOpen} onChange={(e) => setEdgeSwipeOpen(e.target.checked)} />
                Edge swipe to open
              </label>
              <label className={styles.configOption}>
                <input type="checkbox" checked={swipeClose} onChange={(e) => setSwipeClose(e.target.checked)} />
                Swipe to close
              </label>
            </div>
            <div className={styles.anchorSelect}>
              <button
                type="button"
                className={styles.anchorButton}
                data-active={anchor === "left"}
                onClick={() => setAnchor("left")}
              >
                Left
              </button>
              <button
                type="button"
                className={styles.anchorButton}
                data-active={anchor === "right"}
                onClick={() => setAnchor("right")}
              >
                Right
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "drawer-swipe",
      component: (
        <div className={styles.drawerContent}>
          {/* Search input */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>

          {/* Scrollable list */}
          <div className={styles.scrollableSection}>
            <h4 className={styles.sectionTitle}>Navigation</h4>
            <ul className={styles.drawerList}>
              {Array.from({ length: 20 }, (_, i) => (
                <li key={i} className={styles.drawerItem}>
                  <span>Item {i + 1}</span>
                  <small>Description for item {i + 1}</small>
                </li>
              ))}
            </ul>
          </div>

          {/* Form section - wrapped in SwipeSafeZone */}
          <SwipeSafeZone className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Quick Note (Safe Zone)</h4>
            <input
              type="text"
              placeholder="Title"
              className={styles.textInput}
            />
            <textarea
              placeholder="Write your note here..."
              className={styles.textArea}
              rows={3}
            />
            <DemoButton variant="secondary" size="sm" onClick={() => {}}>
              Save Note
            </DemoButton>
          </SwipeSafeZone>

          {/* Swipe hint */}
          <div className={styles.swipeHint}>
            <span className={styles.swipeArrow}>{anchor === "left" ? "\u2190" : "\u2192"}</span>
            Swipe to close
          </div>
        </div>
      ),
      drawer: drawerConfig,
      position: anchor === "left" ? { left: 0 } : { right: 0 },
      width: 300,
      height: "100%",
      zIndex: 1200,
    },
  ];

  return <GridLayout config={config} layers={layers} />;
};
