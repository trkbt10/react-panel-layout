/**
 * @file Swipe Pivot demo - horizontal swipe to switch content
 */
import * as React from "react";
import { usePivot } from "../../../../pivot/index.js";
import { usePivotSwipeInput } from "../../../../modules/pivot/usePivotSwipeInput.js";
import { SwipePivotContent } from "../../../../modules/pivot/SwipePivotContent.js";
import type { PivotItem, UsePivotResult } from "../../../../pivot/index.js";
import type { SwipeInputState } from "../../../../hooks/gesture/types.js";
import styles from "./SwipePivot.module.css";

type PivotItemsProps = {
  items: PivotItem[];
  pivot: UsePivotResult;
  inputState: SwipeInputState;
  containerWidth: number;
};

/** Renders pivot items within the swipe container */
const PivotItems: React.FC<PivotItemsProps> = ({ items, pivot, inputState, containerWidth }) => {
  if (containerWidth <= 0) {
    return null;
  }

  return (
    <>
      {items.map((item) => {
        // Use getVirtualPosition for loop mode support
        const position = pivot.getVirtualPosition(item.id);
        if (position === null) {
          return null;
        }

        const canNavigate = position === 0 ? true : pivot.canGo(position);

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
    </>
  );
};

/** Get hint text based on swipe state */
const getSwipeHintText = (inputState: SwipeInputState): string => {
  if (inputState.phase === "swiping") {
    return `Swiping: ${Math.round(inputState.displacement.x)}px`;
  }
  return "Swipe to navigate";
};

const pageColors = ["#ffe0e0", "#e0ffe0", "#e0e0ff"];

const items: PivotItem[] = [
  {
    id: "page1",
    label: "Page 1",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[0] }}>
        <h2>Page 1</h2>
        <p>Swipe left to see Page 2, or right to loop to Page 3</p>
        <p>This demo shows infinite loop swipe navigation.</p>
      </div>
    ),
  },
  {
    id: "page2",
    label: "Page 2",
    content: (
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[1] }}>
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
      <div className={styles.pageContent} style={{ backgroundColor: pageColors[2] }}>
        <h2>Page 3</h2>
        <p>Swipe left to loop back to Page 1</p>
        <p>Infinite loop navigation - keep swiping to cycle through all pages.</p>
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
    navigationMode: "loop", // Enable infinite loop navigation
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
        style={containerProps.style}
      >
        <PivotItems
          items={items}
          pivot={pivot}
          inputState={inputState}
          containerWidth={containerWidth}
        />
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
