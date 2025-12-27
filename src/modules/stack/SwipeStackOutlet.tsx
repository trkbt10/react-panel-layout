/**
 * @file SwipeStackOutlet component for rendering stack with swipe support.
 *
 * Uses SwipeStackContent for direct DOM manipulation during swipe gestures,
 * providing iOS-style smooth swipe-to-go-back behavior.
 */
import * as React from "react";
import { SwipeStackContent } from "./SwipeStackContent.js";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";
import type { StackPanel, StackNavigationState } from "./types.js";

const DEFAULT_ANIMATION_DURATION = 300;

/**
 * Props for SwipeStackOutlet component.
 */
export type SwipeStackOutletProps = {
  /** Array of panel definitions */
  panels: ReadonlyArray<StackPanel>;
  /** Current navigation state */
  navigationState: StackNavigationState;
  /** Continuous operation state (from gesture input or animation system) */
  operationState: ContinuousOperationState;
  /** Container size in pixels (width for horizontal swipe) */
  containerSize: number;
  /** Function to get cached content for a panel */
  getCachedContent?: (panelId: string) => React.ReactNode | null;
  /** Behind panel offset ratio. @default -0.3 */
  behindOffset?: number;
  /**
   * Whether to animate new panels on mount.
   * @default false
   */
  animateOnMount?: boolean;
  /**
   * Animation duration in ms.
   * @default 300
   */
  animationDuration?: number;
  /**
   * Whether to show iOS-style edge shadow on active panels.
   * @default true
   */
  showShadow?: boolean;
  /**
   * Display mode for visual styling.
   * - "overlay": panels overlay, no scale (iOS style)
   * - "slide": panels slide with parallax
   * - "stack": panels scale down and offset (stacked cards style)
   * @default "overlay"
   */
  displayMode?: "overlay" | "slide" | "stack";
  /**
   * Whether to show dimming overlay on behind panels.
   * @default true
   */
  showDimming?: boolean;
};

/**
 * Get visible panels for rendering during swipe.
 *
 * Only renders active panel and immediate behind panel for performance.
 * Also includes exiting panel when navigating back.
 */
function getVisiblePanels(
  panels: ReadonlyArray<StackPanel>,
  navigationState: StackNavigationState,
  exitingPanelId: string | null,
): Array<{ panel: StackPanel; depth: number; isExiting: boolean }> {
  const { stack, depth } = navigationState;

  // During swipe, we only need active and behind panels
  const visibleDepths = [depth];
  if (depth > 0) {
    visibleDepths.push(depth - 1);
  }

  const result: Array<{ panel: StackPanel; depth: number; isExiting: boolean }> = [];

  // Add panels at visible depths
  for (const d of visibleDepths) {
    const id = stack[d];
    const panel = panels.find((p) => p.id === id);
    if (panel) {
      result.push({ panel, depth: d, isExiting: false });
    }
  }

  // Add exiting panel if it's not already included
  if (exitingPanelId != null) {
    const alreadyIncluded = result.some((r) => r.panel.id === exitingPanelId);
    if (!alreadyIncluded) {
      const exitingPanel = panels.find((p) => p.id === exitingPanelId);
      if (exitingPanel) {
        // Exiting panel is at depth + 1 (was previously active)
        result.push({ panel: exitingPanel, depth: depth + 1, isExiting: true });
      }
    }
  }

  // Render in order: behind first, then active, then exiting
  return result.sort((a, b) => a.depth - b.depth);
}

/**
 * SwipeStackOutlet renders stack panels with swipe gesture support.
 *
 * Unlike the default StackOutlet, this component:
 * - Uses SwipeStackContent for direct DOM manipulation
 * - Only renders active and behind panels for performance
 * - Supports iOS-style parallax reveal animation
 *
 * @example
 * ```tsx
 * const navigation = useStackNavigation({ panels, displayMode: 'overlay' });
 * const swipeInput = useStackSwipeInput({ containerRef, navigation });
 *
 * return (
 *   <div ref={containerRef} {...swipeInput.containerProps}>
 *     <SwipeStackOutlet
 *       panels={navigation.panels}
 *       navigationState={navigation.state}
 *       operationState={toContinuousOperationState(swipeInput.inputState)}
 *       containerSize={containerWidth}
 *     />
 *   </div>
 * );
 * ```
 */
export const SwipeStackOutlet: React.FC<SwipeStackOutletProps> = React.memo(
  ({
    panels,
    navigationState,
    operationState,
    containerSize,
    getCachedContent,
    behindOffset,
    animateOnMount = false,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    showShadow,
    displayMode,
    showDimming,
  }) => {
    // Track the exiting panel ID when navigating back
    const [exitingPanelId, setExitingPanelId] = React.useState<string | null>(null);
    const prevDepthRef = React.useRef(navigationState.depth);
    const prevStackRef = React.useRef<ReadonlyArray<string>>(navigationState.stack);

    // Detect when we navigate back and need to animate out
    React.useLayoutEffect(() => {
      const prevDepth = prevDepthRef.current;
      const prevStack = prevStackRef.current;
      const { depth, stack } = navigationState;

      // Update refs
      prevDepthRef.current = depth;
      prevStackRef.current = stack;

      // Check if we went back (depth decreased)
      if (depth < prevDepth) {
        // The panel at prevDepth is exiting
        const exitingId = prevStack[prevDepth];
        if (exitingId != null) {
          setExitingPanelId(exitingId);

          // Clear exiting panel after animation completes
          const timeoutId = setTimeout(() => {
            setExitingPanelId(null);
          }, animationDuration);

          return () => clearTimeout(timeoutId);
        }
      }
    }, [navigationState.depth, navigationState.stack, animationDuration]);

    const visiblePanels = React.useMemo(
      () => getVisiblePanels(panels, navigationState, exitingPanelId),
      [panels, navigationState, exitingPanelId],
    );

    const containerStyle: React.CSSProperties = React.useMemo(
      () => ({
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }),
      [],
    );

    return (
      <div style={containerStyle} data-swipe-stack-container>
        {visiblePanels.map(({ panel, depth, isExiting }) => {
          const isActive = depth === navigationState.depth && !isExiting;
          const content = getCachedContent?.(panel.id) ?? panel.content;

          return (
            <SwipeStackContent
              key={panel.id}
              id={panel.id}
              depth={depth}
              navigationDepth={navigationState.depth}
              isActive={isActive}
              operationState={operationState}
              containerSize={containerSize}
              behindOffset={behindOffset}
              animateOnMount={animateOnMount}
              animationDuration={animationDuration}
              showShadow={showShadow}
              displayMode={displayMode}
              showDimming={showDimming}
            >
              {content}
            </SwipeStackContent>
          );
        })}
      </div>
    );
  },
);
