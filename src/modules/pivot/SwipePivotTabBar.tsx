/**
 * @file SwipePivotTabBar - Swipeable tab bar for pivot navigation with proper looping.
 *
 * Infinite loop model:
 * - Uses continuous scroll offset (not discrete positions)
 * - Renders tab slots at fixed positions, content determined by scroll offset
 * - Clones tabs at boundaries for seamless looping
 * - Each slot has stable key (by position), preventing remount jumps
 */
import * as React from "react";
import type { SwipeInputState, GestureAxis } from "../../hooks/gesture/types.js";

/**
 * Props passed to the indicator render function.
 * Use these to position a sliding indicator (iOS-style).
 */
export type IndicatorRenderProps = {
  /** Current offset in pixels (includes swipe displacement and animation) */
  offsetPx: number;
  /** Width of each tab */
  tabWidth: number;
  /** Center X position where active tab is located */
  centerX: number;
  /** Whether currently swiping */
  isSwiping: boolean;
  /** Whether animation is in progress */
  isAnimating: boolean;
};

export type SwipePivotTabBarProps<TId extends string = string> = {
  /** Tab items to render */
  items: ReadonlyArray<{ id: TId; label?: string }>;
  /** Currently active tab ID */
  activeId: TId;
  /** Index of active tab */
  activeIndex: number;
  /** Total number of items */
  itemCount: number;
  /** Current swipe input state */
  inputState: SwipeInputState;
  /** Width of each tab */
  tabWidth: number;
  /** Width of the visible viewport */
  viewportWidth: number;
  /** Navigation mode */
  navigationMode?: "linear" | "loop";
  /** Axis for swipe (horizontal or vertical) */
  axis?: GestureAxis;
  /** Render function for each tab */
  renderTab: (item: { id: TId; label?: string }, isActive: boolean, index: number) => React.ReactNode;
  /** Animation duration in ms */
  animationDuration?: number;
  /**
   * When true, tabs stay at fixed positions and only the indicator moves.
   * Use this for iOS segmented control style where the "window" slides over fixed tabs.
   * @default false
   */
  fixedTabs?: boolean;
  /**
   * Optional render function for a sliding indicator (iOS-style).
   * The indicator follows the active tab position during swipe and animation.
   * Rendered behind the tabs.
   *
   * When used with fixedTabs=true, only the indicator moves while tabs stay fixed.
   *
   * @example
   * ```tsx
   * renderIndicator={({ offsetPx, tabWidth, centerX }) => (
   *   <div
   *     style={{
   *       position: 'absolute',
   *       left: centerX,
   *       bottom: 0,
   *       width: tabWidth,
   *       height: 3,
   *       backgroundColor: '#007AFF',
   *       transform: `translateX(${offsetPx}px)`,
   *     }}
   *   />
   * )}
   * ```
   */
  renderIndicator?: (props: IndicatorRenderProps) => React.ReactNode;
};

const DEFAULT_ANIMATION_DURATION = 300;

/** Get displacement value for the given axis from input state */
const getAxisDisplacement = (inputState: SwipeInputState, axis: GestureAxis): number => {
  if (inputState.phase === "idle") {
    return 0;
  }
  return axis === "horizontal" ? inputState.displacement.x : inputState.displacement.y;
};

/**
 * Normalize index to valid range [0, count)
 */
const normalizeIndex = (index: number, count: number): number => {
  return ((index % count) + count) % count;
};

/**
 * Calculate which item should appear at a given slot position.
 * For loop mode, wraps around using modulo.
 * For linear mode, returns null if out of range.
 */
const getItemAtPosition = (
  slotPosition: number,
  activeIndex: number,
  itemCount: number,
  navigationMode: "linear" | "loop",
): number | null => {
  const targetIndex = activeIndex + slotPosition;

  if (navigationMode === "linear") {
    if (targetIndex < 0 || targetIndex >= itemCount) {
      return null;
    }
    return targetIndex;
  }

  // Loop mode: wrap around
  return normalizeIndex(targetIndex, itemCount);
};

type TabSlotProps<TId extends string> = {
  slotPosition: number;
  item: { id: TId; label?: string };
  itemIndex: number;
  isActive: boolean;
  centerX: number;
  tabWidth: number;
  viewportWidth: number;
  offsetPx: number;
  axis: GestureAxis;
  renderTab: (item: { id: TId; label?: string }, isActive: boolean, index: number) => React.ReactNode;
};

/**
 * Tab slot component - renders a tab at a fixed slot position.
 * The slot position is stable; only the content changes based on scroll offset.
 */
const TabSlot = React.memo(<TId extends string>({
  slotPosition,
  item,
  itemIndex,
  isActive,
  centerX,
  tabWidth,
  viewportWidth,
  offsetPx,
  axis,
  renderTab,
}: TabSlotProps<TId>) => {
  // Calculate visual position: centerX + slotPosition * tabWidth + offsetPx
  const basePx = slotPosition * tabWidth;
  const visualPx = centerX + basePx + offsetPx;

  // Check if visible in viewport
  const visible = visualPx + tabWidth > 0 && visualPx < viewportWidth;

  const transformFn = axis === "horizontal" ? "translateX" : "translateY";

  return (
    <div
      data-pivot-tab={item.id}
      data-slot={slotPosition}
      data-active={isActive ? "true" : "false"}
      style={{
        position: "absolute",
        left: centerX,
        top: 0,
        width: tabWidth,
        height: "100%",
        visibility: visible ? "visible" : "hidden",
        willChange: "transform",
        transform: `${transformFn}(${basePx + offsetPx}px)`,
      }}
    >
      {renderTab(item, isActive, itemIndex)}
    </div>
  );
}) as <TId extends string>(props: TabSlotProps<TId>) => React.ReactElement;

/**
 * Easing function for smooth animation
 */
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function SwipePivotTabBar<TId extends string = string>({
  items,
  activeId,
  activeIndex,
  itemCount,
  inputState,
  tabWidth,
  viewportWidth,
  navigationMode = "linear",
  axis = "horizontal",
  renderTab,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  fixedTabs = false,
  renderIndicator,
}: SwipePivotTabBarProps<TId>): React.ReactElement {
  const displacement = getAxisDisplacement(inputState, axis);
  const isSwiping = inputState.phase === "swiping" || inputState.phase === "tracking";

  // ============================================================
  // Animation state for SLOT-BASED mode (scrolling tabs)
  // ============================================================
  const [animatedOffset, setAnimatedOffset] = React.useState(0);
  const animationRef = React.useRef<{
    startTime: number;
    startOffset: number;
    targetOffset: number;
    rafId: number;
  } | null>(null);

  // ============================================================
  // Animation state for FIXED TABS mode (iOS-style indicator)
  // Tracks the actual indicator position in pixels
  // ============================================================
  const [indicatorPosition, setIndicatorPosition] = React.useState(activeIndex * tabWidth);
  const indicatorPositionRef = React.useRef(activeIndex * tabWidth); // Track current position for animation start
  const fixedAnimationRef = React.useRef<{
    rafId: number;
  } | null>(null);
  const lastSwipePositionRef = React.useRef<number | null>(null);

  // Keep ref in sync with state
  React.useEffect(() => {
    indicatorPositionRef.current = indicatorPosition;
  }, [indicatorPosition]);

  const prevActiveIndexRef = React.useRef(activeIndex);

  // Calculate the range of slot positions to render
  const halfRange = Math.ceil(viewportWidth / tabWidth / 2) + 1;

  // Center position for active tab (for slot-based mode)
  const centerX = (viewportWidth - tabWidth) / 2;

  // ============================================================
  // Fixed tabs mode: track swipe position
  // ============================================================
  React.useEffect(() => {
    if (!fixedTabs || !isSwiping) return;

    // During swipe, track the visual position
    // Swipe direction is OPPOSITE to indicator movement
    const visualPosition = activeIndex * tabWidth - displacement;
    lastSwipePositionRef.current = visualPosition;
    setIndicatorPosition(visualPosition);
  }, [fixedTabs, isSwiping, activeIndex, tabWidth, displacement]);

  // ============================================================
  // Fixed tabs mode: animate when swipe ends or tab clicked
  // ============================================================
  React.useEffect(() => {
    if (!fixedTabs || isSwiping) return;

    // When swipe ends or tab changes via click
    const targetPosition = activeIndex * tabWidth;
    const startPosition = lastSwipePositionRef.current ?? indicatorPositionRef.current;
    lastSwipePositionRef.current = null;

    // Already at target
    if (Math.abs(startPosition - targetPosition) < 1) {
      setIndicatorPosition(targetPosition);
      return;
    }

    // Cancel existing animation
    if (fixedAnimationRef.current) {
      cancelAnimationFrame(fixedAnimationRef.current.rafId);
    }

    // Animate from current position to target
    const startTime = performance.now();
    const animationStartPosition = startPosition; // Capture for closure

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentPosition = animationStartPosition + (targetPosition - animationStartPosition) * easedProgress;
      setIndicatorPosition(currentPosition);

      if (progress < 1) {
        fixedAnimationRef.current = {
          rafId: requestAnimationFrame(animate),
        };
      } else {
        fixedAnimationRef.current = null;
        setIndicatorPosition(targetPosition);
      }
    };

    fixedAnimationRef.current = {
      rafId: requestAnimationFrame(animate),
    };
  }, [fixedTabs, isSwiping, activeIndex, tabWidth, animationDuration]);

  // ============================================================
  // Slot-based mode animation: handle activeIndex changes
  // ============================================================
  React.useEffect(() => {
    if (fixedTabs) return; // Skip for fixed tabs mode

    if (prevActiveIndexRef.current === activeIndex) {
      return;
    }

    const prevIndex = prevActiveIndexRef.current;
    prevActiveIndexRef.current = activeIndex;

    // Calculate direction of movement
    let delta: number;
    if (navigationMode === "loop") {
      // Use shortest path in loop mode
      const forwardDist = normalizeIndex(activeIndex - prevIndex, itemCount);
      const backwardDist = itemCount - forwardDist;
      delta = forwardDist <= backwardDist ? forwardDist : -backwardDist;
    } else {
      delta = activeIndex - prevIndex;
    }

    // Target offset to animate to (then snap to 0)
    const targetOffsetPx = -delta * tabWidth;

    // Start from current visual position
    const startOffset = isSwiping ? displacement : animatedOffset;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current.rafId);
    }

    // If already at target (within threshold), snap immediately
    if (Math.abs(startOffset - targetOffsetPx) < 1) {
      setAnimatedOffset(0);
      return;
    }

    // Start animation
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easeOutExpo(progress);

      // Interpolate from startOffset toward targetOffset, but we want to end at 0
      // So we animate: startOffset → targetOffset, but since we're rendering with
      // the NEW activeIndex, we need to compensate
      //
      // When activeIndex changes, slots now show different content.
      // We animate the offset from (startOffset - targetOffset) back to 0.
      const compensatedStart = startOffset - targetOffsetPx;
      const currentOffset = compensatedStart * (1 - easedProgress);

      setAnimatedOffset(currentOffset);

      if (progress < 1) {
        animationRef.current = {
          startTime,
          startOffset: compensatedStart,
          targetOffset: 0,
          rafId: requestAnimationFrame(animate),
        };
      } else {
        animationRef.current = null;
        setAnimatedOffset(0);
      }
    };

    animationRef.current = {
      startTime,
      startOffset: startOffset - targetOffsetPx,
      targetOffset: 0,
      rafId: requestAnimationFrame(animate),
    };
  }, [fixedTabs, activeIndex, itemCount, tabWidth, animationDuration, navigationMode, displacement, isSwiping, animatedOffset]);

  // Update prevActiveIndexRef for fixed tabs mode too
  React.useEffect(() => {
    if (fixedTabs) {
      prevActiveIndexRef.current = activeIndex;
    }
  }, [fixedTabs, activeIndex]);

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current.rafId);
      }
      if (fixedAnimationRef.current) {
        cancelAnimationFrame(fixedAnimationRef.current.rafId);
      }
    };
  }, []);

  // Current offset for slot-based mode
  const currentOffset = isSwiping ? displacement : animatedOffset;
  const isAnimating = animationRef.current !== null || fixedAnimationRef.current !== null;

  // Cancel slot animation when swiping starts
  React.useEffect(() => {
    if (isSwiping && animationRef.current) {
      cancelAnimationFrame(animationRef.current.rafId);
      animationRef.current = null;
      setAnimatedOffset(0);
    }
  }, [isSwiping]);

  // ============================================================
  // Fixed tabs mode: render fixed tabs with sliding indicator
  // ============================================================
  if (fixedTabs) {
    // Calculate total width and centering offset
    const totalTabsWidth = items.length * tabWidth;
    const centeringOffset = (viewportWidth - totalTabsWidth) / 2;

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Sliding indicator (rendered behind tabs) */}
        {renderIndicator?.({
          offsetPx: indicatorPosition,
          tabWidth,
          centerX: centeringOffset,
          isSwiping,
          isAnimating,
        })}

        {/* Fixed tabs - each tab at its natural position */}
        {items.map((item, index) => (
          <div
            key={item.id}
            data-pivot-tab={item.id}
            data-active={index === activeIndex ? "true" : "false"}
            style={{
              position: "relative",
              width: tabWidth,
              height: "100%",
              flexShrink: 0,
            }}
          >
            {renderTab(item, index === activeIndex, index)}
          </div>
        ))}
      </div>
    );
  }

  // Slot-based rendering for scrolling tabs (infinite loop support)
  const slots: Array<{
    slotPosition: number;
    itemIndex: number;
    item: { id: TId; label?: string };
  }> = [];

  for (let pos = -halfRange; pos <= halfRange; pos++) {
    const itemIndex = getItemAtPosition(pos, activeIndex, itemCount, navigationMode);
    if (itemIndex !== null) {
      slots.push({
        slotPosition: pos,
        itemIndex,
        item: items[itemIndex],
      });
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Sliding indicator (rendered behind tabs) */}
      {renderIndicator?.({
        offsetPx: currentOffset,
        tabWidth,
        centerX,
        isSwiping,
        isAnimating,
      })}

      {/* Tab slots */}
      {slots.map(({ slotPosition, itemIndex, item }) => (
        <TabSlot
          key={slotPosition}
          slotPosition={slotPosition}
          item={item}
          itemIndex={itemIndex}
          isActive={itemIndex === activeIndex}
          centerX={centerX}
          tabWidth={tabWidth}
          viewportWidth={viewportWidth}
          offsetPx={currentOffset}
          axis={axis}
          renderTab={renderTab}
        />
      ))}
    </div>
  );
}
