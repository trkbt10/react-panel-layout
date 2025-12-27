/**
 * @file Swipe Tabs Pivot demo - swipeable tabs with synchronized content
 *
 * Both tab and content areas respond to swipe gestures.
 * Uses SwipePivotTabBar for tabs and scaleInputState for displacement sync.
 * Demonstrates both indicator styles: standard active state and iOS-style sliding indicator.
 */
import * as React from "react";
import { usePivot, scaleInputState, SwipePivotTabBar } from "../../../../pivot/index.js";
import { usePivotSwipeInput } from "../../../../modules/pivot/usePivotSwipeInput.js";
import { SwipePivotContent } from "../../../../modules/pivot/SwipePivotContent.js";
import type { PivotItem, UsePivotResult, IndicatorRenderProps } from "../../../../pivot/index.js";
import type { SwipeInputState } from "../../../../hooks/gesture/types.js";
import styles from "./SwipeTabsPivot.module.css";

type IndicatorStyle = "standard" | "sliding";

type ContentItemsProps = {
  items: PivotItem[];
  pivot: UsePivotResult;
  inputState: SwipeInputState;
  containerWidth: number;
};

type TabBarProps = {
  contentContainerWidth: number;
  items: PivotItem[];
  pivot: UsePivotResult;
  tabInputState: SwipeInputState;
  tabWidth: number;
  indicatorStyle: IndicatorStyle;
};

/** Renders content items */
const ContentItems: React.FC<ContentItemsProps> = ({ items, pivot, inputState, containerWidth }) => {
  if (containerWidth <= 0) {
    return null;
  }

  return (
    <>
      {items.map((item) => {
        const position = pivot.getVirtualPosition(item.id);
        if (position === null) {
          return null;
        }

        return (
          <SwipePivotContent
            key={item.id}
            id={item.id}
            isActive={pivot.isActive(item.id)}
            position={position}
            inputState={inputState}
            axis="horizontal"
            containerSize={containerWidth}
            canNavigate={true}
          >
            {item.content}
          </SwipePivotContent>
        );
      })}
    </>
  );
};

const TabBar: React.FC<TabBarProps> = ({
  contentContainerWidth,
  items,
  pivot,
  tabInputState,
  tabWidth,
  indicatorStyle,
}) => {
  if (contentContainerWidth <= 0) {
    return null;
  }

  return (
    <SwipePivotTabBar
      items={items}
      activeId={pivot.activeId}
      activeIndex={pivot.activeIndex}
      itemCount={pivot.itemCount}
      inputState={tabInputState}
      tabWidth={tabWidth}
      viewportWidth={contentContainerWidth}
      navigationMode={pivot.navigationMode}
      fixedTabs={indicatorStyle === "sliding"}
      renderTab={(item, isActive) => (
        <button
          className={indicatorStyle === "sliding" ? styles.tabIos : styles.tab}
          data-active={isActive}
          onClick={() => pivot.setActiveId(item.id)}
        >
          {item.label}
        </button>
      )}
      renderIndicator={indicatorStyle === "sliding" ? SlidingIndicator : undefined}
    />
  );
};

const pageColors = ["#ffe0e0", "#e0ffe0", "#e0e0ff", "#fff0e0", "#f0e0ff"];

const items: PivotItem[] = [
  {
    id: "tab1",
    label: "Tab 1",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[0] }}>
        <h2>Tab 1 Content</h2>
        <p>Swipe on the tabs above or the content area</p>
        <p>Both areas are synchronized</p>
      </div>
    ),
  },
  {
    id: "tab2",
    label: "Tab 2",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[1] }}>
        <h2>Tab 2 Content</h2>
        <p>Infinite loop navigation enabled</p>
        <p>Swipe in any direction to continue</p>
      </div>
    ),
  },
  {
    id: "tab3",
    label: "Tab 3",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[2] }}>
        <h2>Tab 3 Content</h2>
        <p>Try swiping on the tab bar</p>
        <p>Content follows the same navigation</p>
      </div>
    ),
  },
  {
    id: "tab4",
    label: "Tab 4",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[3] }}>
        <h2>Tab 4 Content</h2>
        <p>More tabs to navigate through</p>
      </div>
    ),
  },
  {
    id: "tab5",
    label: "Tab 5",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[4] }}>
        <h2>Tab 5 Content</h2>
        <p>Last tab - swipe left to loop back to Tab 1</p>
      </div>
    ),
  },
];

/** Get hint text for current swipe state */
const getHintText = (phase: SwipeInputState["phase"], displacement: number): string => {
  if (phase === "swiping") {
    return `Swiping: ${Math.round(displacement)}px`;
  }
  return "Swipe tabs or content";
};

/** Sliding indicator component (iOS segmented control style) */
const SlidingIndicator = ({ offsetPx, tabWidth, centerX }: IndicatorRenderProps): React.ReactNode => {
  const padding = 4;
  const indicatorWidth = tabWidth - padding * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: centerX + padding,
        top: "50%",
        transform: `translateX(${offsetPx}px) translateY(-50%)`,
        width: indicatorWidth,
        height: 28,
        backgroundColor: "#fff",
        borderRadius: 7,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
        willChange: "transform",
        pointerEvents: "none",
      }}
    />
  );
};

export const SwipeTabsPivot: React.FC = () => {
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const contentContainerRef = React.useRef<HTMLDivElement>(null);
  const [contentContainerWidth, setContentContainerWidth] = React.useState(0);
  const [indicatorStyle, setIndicatorStyle] = React.useState<IndicatorStyle>("sliding");

  // Per-tab width (each tab takes equal space in viewport)
  const tabWidth = contentContainerWidth / items.length;

  const pivot = usePivot({
    items,
    defaultActiveId: "tab1",
    transitionMode: "none",
    navigationMode: "loop",
  });

  // Use swipe input on the main container (covers both tabs and content)
  const { inputState, containerProps } = usePivotSwipeInput({
    containerRef: mainContainerRef,
    pivot,
    axis: "horizontal",
    thresholds: {
      distanceThreshold: 100,
      velocityThreshold: 0.5,
      lockThreshold: 15,
    },
  });

  // Scale inputState for tabs: content swipe distance → tab swipe distance
  const tabInputState = scaleInputState(inputState, contentContainerWidth, tabWidth);

  // Measure container width
  React.useEffect(() => {
    const updateWidth = () => {
      if (contentContainerRef.current) {
        setContentContainerWidth(contentContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Swipeable Tabs Demo</h3>
      <p className={styles.subtitle}>Swipe on tabs or content - both are synchronized</p>

      {/* Indicator style toggle */}
      <div className={styles.styleToggle}>
        <span>Indicator Style:</span>
        <button
          className={styles.toggleButton}
          data-active={indicatorStyle === "standard"}
          onClick={() => setIndicatorStyle("standard")}
        >
          Standard
        </button>
        <button
          className={styles.toggleButton}
          data-active={indicatorStyle === "sliding"}
          onClick={() => setIndicatorStyle("sliding")}
        >
          Sliding (iOS)
        </button>
      </div>

      {/* Main swipe container wrapping both tabs and content */}
      <div
        ref={mainContainerRef}
        className={styles.mainContainer}
        {...containerProps}
        style={containerProps.style}
      >
        {/* Swipeable tabs using SwipePivotTabBar */}
        <div
          className={styles.tabsContainer}
          data-style={indicatorStyle === "sliding" ? "ios" : undefined}
        >
          <TabBar
            contentContainerWidth={contentContainerWidth}
            items={items}
            pivot={pivot}
            tabInputState={tabInputState}
            tabWidth={tabWidth}
            indicatorStyle={indicatorStyle}
          />
        </div>

        {/* Content area - uses original inputState */}
        <div ref={contentContainerRef} className={styles.contentContainer}>
          <ContentItems
            items={items}
            pivot={pivot}
            inputState={inputState}
            containerWidth={contentContainerWidth}
          />
        </div>
      </div>

      {/* Navigation info */}
      <div className={styles.info}>
        <span>Tab {pivot.activeIndex + 1} of {pivot.itemCount}</span>
        <span className={styles.hint}>
          {getHintText(inputState.phase, inputState.displacement.x)}
        </span>
      </div>

      {/* Manual navigation buttons */}
      <div className={styles.buttons}>
        <button
          className={styles.navButton}
          onClick={() => pivot.go(-1)}
        >
          Previous
        </button>
        <button
          className={styles.navButton}
          onClick={() => pivot.go(1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
