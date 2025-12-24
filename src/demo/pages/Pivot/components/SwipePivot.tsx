/**
 * @file Swipe Pivot demo - horizontal swipe to switch content
 */
import * as React from "react";
import { usePivot } from "../../../../pivot/index.js";
import { usePivotSwipeInput } from "../../../../modules/pivot/usePivotSwipeInput.js";
import { SwipePivotContent } from "../../../../modules/pivot/SwipePivotContent.js";
import type { PivotItem } from "../../../../pivot/index.js";
import type { SwipeInputState } from "../../../../hooks/gesture/types.js";
import styles from "./SwipePivot.module.css";

/** Get hint text based on swipe state */
const getSwipeHintText = (inputState: SwipeInputState): string => {
  if (inputState.phase === "swiping") {
    return `Swiping: ${Math.round(inputState.displacement.x)}px`;
  }
  return "Swipe to navigate";
};

const items: PivotItem[] = [
  {
    id: "page1",
    label: "Page 1",
    content: (
      <div className={styles.pageContent}>
        <h2>Page 1</h2>
        <p>Swipe left to see Page 2</p>
        <p>This demo shows horizontal swipe navigation between content pages.</p>
      </div>
    ),
  },
  {
    id: "page2",
    label: "Page 2",
    content: (
      <div className={styles.pageContent}>
        <h2>Page 2</h2>
        <p>Swipe left or right</p>
        <p>The content follows your finger during the swipe gesture.</p>
      </div>
    ),
  },
  {
    id: "page3",
    label: "Page 3",
    content: (
      <div className={styles.pageContent}>
        <h2>Page 3</h2>
        <p>Swipe right to go back</p>
        <p>This is the last page. Swipe right to return to previous pages.</p>
      </div>
    ),
  },
];

export const SwipePivot: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const pivot = usePivot({
    items,
    defaultActiveId: "page1",
    transitionMode: "none", // We handle our own animations
  });

  const { inputState, containerProps } = usePivotSwipeInput({
    containerRef,
    pivot,
    axis: "horizontal",
    thresholds: {
      distanceThreshold: 150,
      velocityThreshold: 0.6,
      lockThreshold: 25,
    },
  });

  // Measure container width for translation calculations
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate position offset for each item relative to active
  const getPositionOffset = (itemId: string): number => {
    const itemIndex = items.findIndex((item) => item.id === itemId);
    return itemIndex - pivot.activeIndex;
  };

  // Convert offset to display position (-1, 0, 1)
  const toDisplayPosition = (offset: number): -1 | 0 | 1 => {
    if (offset < 0) {
      return -1;
    }
    if (offset > 0) {
      return 1;
    }
    return 0;
  };

  // Only render items within ±1 of active
  const shouldRenderItem = (offset: number): boolean => {
    return Math.abs(offset) <= 1;
  };

  return (
    <div className={styles.container}>
      {/* Page indicators */}
      <div className={styles.indicators}>
        {items.map((item) => (
          <button
            key={item.id}
            className={styles.indicator}
            data-active={pivot.isActive(item.id)}
            onClick={() => pivot.setActiveId(item.id)}
            aria-label={`Go to ${item.label}`}
          />
        ))}
      </div>

      {/* Swipe area */}
      <div
        ref={containerRef}
        className={styles.swipeContainer}
        {...containerProps}
      >
        {items.map((item) => {
          const offset = getPositionOffset(item.id);
          // Only render items within ±1 of active (fixes Page 2,3 overlap issue)
          if (!shouldRenderItem(offset)) {
            return null;
          }

          const position = toDisplayPosition(offset);
          // Determine if navigation to this position is possible
          const canNavigateToPosition = position === 0;
          const canNavigate = canNavigateToPosition ? true : pivot.canGo(position);

          return (
            <SwipePivotContent
              key={item.id}
              id={item.id}
              isActive={pivot.isActive(item.id)}
              position={position}
              inputState={inputState}
              axis="horizontal"
              containerSize={containerWidth}
              canNavigate={canNavigate}
            >
              {item.content}
            </SwipePivotContent>
          );
        })}
      </div>

      {/* Navigation info */}
      <div className={styles.info}>
        <span>Page {pivot.activeIndex + 1} of {pivot.itemCount}</span>
        <span className={styles.hint}>
          {getSwipeHintText(inputState)}
        </span>
      </div>

      {/* Manual navigation buttons */}
      <div className={styles.buttons}>
        <button
          className={styles.navButton}
          onClick={() => pivot.go(-1)}
          disabled={!pivot.canGo(-1)}
        >
          Previous
        </button>
        <button
          className={styles.navButton}
          onClick={() => pivot.go(1)}
          disabled={!pivot.canGo(1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
