/**
 * @file Debug page for investigating iOS swipe issue
 */
import * as React from "react";
import { usePivot } from "../../../../pivot/index.js";
import { usePivotSwipeInput } from "../../../../modules/pivot/usePivotSwipeInput.js";
import { SwipePivotContent } from "../../../../modules/pivot/SwipePivotContent.js";
import type { PivotItem } from "../../../../pivot/index.js";
import type { SwipeInputState } from "../../../../hooks/gesture/types.js";

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "500px",
    gap: "16px",
    padding: "16px",
  },
  indicators: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
  indicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#ccc",
  },
  indicatorActive: {
    backgroundColor: "#333",
  },
  swipeContainer: {
    flex: 1,
    minHeight: "250px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
  },
  pageContent: {
    padding: "24px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  debugPanel: {
    padding: "12px",
    backgroundColor: "#1a1a1a",
    color: "#00ff00",
    fontFamily: "monospace",
    fontSize: "12px",
    borderRadius: "8px",
    maxHeight: "200px",
    overflow: "auto",
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
  },
};

const pageColors = ["#ffcccc", "#ccffcc", "#ccccff"];

const items: PivotItem[] = [
  {
    id: "page1",
    label: "Page 1",
    content: (
      <div style={{ ...styles.pageContent, backgroundColor: pageColors[0] }}>
        <h2>Page 1</h2>
        <p>Swipe left to see Page 2</p>
      </div>
    ),
  },
  {
    id: "page2",
    label: "Page 2",
    content: (
      <div style={{ ...styles.pageContent, backgroundColor: pageColors[1] }}>
        <h2>Page 2</h2>
        <p>Swipe left or right</p>
      </div>
    ),
  },
  {
    id: "page3",
    label: "Page 3",
    content: (
      <div style={{ ...styles.pageContent, backgroundColor: pageColors[2] }}>
        <h2>Page 3</h2>
        <p>Last page</p>
      </div>
    ),
  },
];

type DebugLog = {
  time: string;
  message: string;
};

const SwipeDebugPage: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [logs, setLogs] = React.useState<DebugLog[]>([]);

  const addLog = React.useCallback((message: string) => {
    const time = new Date().toISOString().split("T")[1].split(".")[0];
    setLogs((prev) => [...prev.slice(-50), { time, message }]);
  }, []);

  const pivot = usePivot({
    items,
    defaultActiveId: "page1",
    transitionMode: "none",
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

  // Log input state changes
  const prevInputStateRef = React.useRef<SwipeInputState>(inputState);
  React.useEffect(() => {
    const prev = prevInputStateRef.current;
    if (
      prev.phase !== inputState.phase ||
      prev.direction !== inputState.direction ||
      Math.abs(prev.displacement.x - inputState.displacement.x) > 10
    ) {
      addLog(
        `inputState: phase=${inputState.phase}, dir=${inputState.direction}, dx=${Math.round(inputState.displacement.x)}`
      );
      prevInputStateRef.current = inputState;
    }
  }, [inputState, addLog]);

  // Log active index changes
  const prevActiveIndexRef = React.useRef(pivot.activeIndex);
  React.useEffect(() => {
    if (prevActiveIndexRef.current !== pivot.activeIndex) {
      addLog(`activeIndex: ${prevActiveIndexRef.current} -> ${pivot.activeIndex}`);
      prevActiveIndexRef.current = pivot.activeIndex;
    }
  }, [pivot.activeIndex, addLog]);

  // Measure container width
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        if (newWidth !== containerWidth) {
          addLog(`containerWidth: ${containerWidth} -> ${newWidth}`);
          setContainerWidth(newWidth);
        }
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [containerWidth, addLog]);

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
    <div style={styles.container}>
      <h3>iOS Swipe Debug</h3>

      {/* Page indicators */}
      <div style={styles.indicators}>
        {items.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.indicator,
              ...(pivot.isActive(item.id) ? styles.indicatorActive : {}),
            }}
            onClick={() => pivot.setActiveId(item.id)}
            aria-label={`Go to ${item.label}`}
          />
        ))}
      </div>

      {/* Swipe area */}
      <div
        ref={containerRef}
        {...containerProps}
        style={{ ...styles.swipeContainer, ...containerProps.style }}
      >
        {items.map((item) => {
          const offset = getPositionOffset(item.id);
          if (!shouldRenderItem(offset)) {
            return null;
          }

          const position = toDisplayPosition(offset);
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

      {/* Info */}
      <div style={styles.info}>
        <span>Page {pivot.activeIndex + 1} of {pivot.itemCount}</span>
        <span>Width: {containerWidth}px</span>
      </div>

      {/* Debug logs */}
      <div style={styles.debugPanel}>
        {logs.map((log, i) => (
          <div key={i}>
            [{log.time}] {log.message}
          </div>
        ))}
        {logs.length === 0 ? <div>No logs yet. Start swiping...</div> : null}
      </div>

      {/* Manual navigation */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => pivot.go(-1)}
          disabled={!pivot.canGo(-1)}
        >
          Previous
        </button>
        <button
          onClick={() => pivot.go(1)}
          disabled={!pivot.canGo(1)}
        >
          Next
        </button>
        <button onClick={() => setLogs([])}>Clear Logs</button>
      </div>
    </div>
  );
};

export default SwipeDebugPage;
