/**
 * @file SwipeStackContent component for Stack panels with direct DOM manipulation.
 *
 * Provides iOS-style swipe-to-go-back behavior:
 * - Active panel follows the finger directly
 * - Behind panel reveals from -30% with parallax effect
 *
 * Uses useSwipeContentTransform for immediate DOM updates.
 */
import * as React from "react";
import { useSwipeContentTransform } from "../../hooks/useSwipeContentTransform.js";
import type { ContinuousOperationState, GestureAxis } from "../../hooks/gesture/types.js";
import type { StackDisplayMode } from "./types.js";
import {
  computeActiveTargetPx,
  computeBehindTargetPx,
  computeSwipeVisibility,
  determineSwipePanelRole,
  DEFAULT_BEHIND_OFFSET,
} from "./computeSwipeStackTransform.js";

const DEFAULT_ANIMATION_DURATION = 300;

/**
 * Scale factor per depth level for "stack" display mode.
 * Each level behind reduces scale by this amount.
 */
const STACK_SCALE_FACTOR = 0.05;

/**
 * Maximum dimming opacity for behind panels in iOS-style navigation.
 */
const MAX_DIM_OPACITY = 0.1;

/**
 * Props for SwipeStackContent component.
 *
 * This component accepts ContinuousOperationState, meaning it responds uniformly
 * to any continuous operation (whether human gesture or system animation).
 */
export type SwipeStackContentProps = {
  /** Panel ID */
  id: string;
  /** Panel depth in the stack */
  depth: number;
  /** Current navigation depth (active panel) */
  navigationDepth: number;
  /** Whether this panel is currently active */
  isActive: boolean;
  /** Continuous operation state (from gesture input or animation system) */
  operationState: ContinuousOperationState;
  /** Container size in pixels (width for horizontal, height for vertical) */
  containerSize: number;
  /** Gesture axis. @default "horizontal" */
  axis?: GestureAxis;
  /** Behind panel offset ratio. @default -0.3 */
  behindOffset?: number;
  /** Animation duration in ms. @default 300 */
  animationDuration?: number;
  /**
   * Whether to animate when first mounted as active.
   * Set to true for push navigation animations.
   * @default false
   */
  animateOnMount?: boolean;
  /**
   * Whether to show iOS-style edge shadow on active panel.
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
  displayMode?: StackDisplayMode;
  /**
   * Whether to show dimming overlay on behind panels.
   * Creates iOS-style darkening effect that fades during swipe.
   * @default true
   */
  showDimming?: boolean;
  /** Content to render */
  children: React.ReactNode;
};

const BASE_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

/**
 * Get displacement from operation state for the given axis.
 */
const getAxisDisplacement = (state: ContinuousOperationState, axis: GestureAxis): number => {
  if (state.phase === "idle") {
    return 0;
  }
  return axis === "horizontal" ? state.displacement.x : state.displacement.y;
};

/**
 * SwipeStackContent renders a single stack panel with swipe gesture support.
 *
 * Key behaviors:
 * - Active panel: follows finger directly (translateX = displacement)
 * - Behind panel: reveals from -30% with parallax (slower movement)
 * - Hidden panels: not rendered during swipe
 *
 * @example
 * ```tsx
 * <SwipeStackContent
 *   id="detail"
 *   depth={1}
 *   navigationDepth={1}
 *   isActive={true}
 *   inputState={swipeInput.inputState}
 *   containerSize={containerWidth}
 * >
 *   <DetailPanel />
 * </SwipeStackContent>
 * ```
 */
// iOS-style left edge shadow for active panels
const ACTIVE_PANEL_SHADOW = "-5px 0 15px rgba(0, 0, 0, 0.1)";

export const SwipeStackContent: React.FC<SwipeStackContentProps> = React.memo(
  ({
    id,
    depth,
    navigationDepth,
    isActive,
    operationState,
    containerSize,
    axis = "horizontal",
    behindOffset = DEFAULT_BEHIND_OFFSET,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    animateOnMount = false,
    showShadow = true,
    displayMode = "overlay",
    showDimming = true,
    children,
  }) => {
    const elementRef = React.useRef<HTMLDivElement>(null);

    const displacement = getAxisDisplacement(operationState, axis);
    const isOperating = operationState.phase === "operating";

    // Determine panel role
    const role = determineSwipePanelRole(depth, navigationDepth);

    // Compute target position based on role
    const targetPx = React.useMemo(() => {
      switch (role) {
        case "active":
          // Active panel rests at 0
          return 0;
        case "behind":
          // Behind panel rests at offset position
          return behindOffset * containerSize;
        case "hidden":
          // Hidden panels are off-screen
          return containerSize;
      }
    }, [role, behindOffset, containerSize]);

    // Compute displacement for this panel
    const panelDisplacement = React.useMemo(() => {
      if (displacement <= 0) {
        return 0;
      }

      switch (role) {
        case "active":
          // Active panel follows finger directly
          return computeActiveTargetPx(displacement);
        case "behind": {
          // Behind panel uses parallax - compute offset from base position
          const currentPos = computeBehindTargetPx(displacement, containerSize, behindOffset);
          const basePos = behindOffset * containerSize;
          return currentPos - basePos;
        }
        case "hidden":
          return 0;
      }
    }, [role, displacement, containerSize, behindOffset]);

    // Compute initial position for push animation
    // When animateOnMount is true and panel is first mounted as "active",
    // it should animate in from off-screen
    // Root panel (depth=0) should not animate on mount
    // Note: useSwipeContentTransform handles first-mount tracking internally,
    // so we just declare the initial position; the hook consumes it only once.
    const initialPx = React.useMemo(() => {
      if (!animateOnMount) {
        return undefined;
      }
      if (role === "active" && depth > 0) {
        // New active panel (not root): start from off-screen right
        return containerSize;
      }
      // Root panel or other roles: start at their natural position
      return undefined;
    }, [animateOnMount, role, depth, containerSize]);

    // Use shared transform hook for DOM manipulation
    const { isAnimating } = useSwipeContentTransform({
      elementRef,
      targetPx,
      displacement: panelDisplacement,
      isOperating,
      axis,
      animationDuration,
      containerSize,
      // Animate when targetPx changes (button navigation)
      animateOnTargetChange: true,
      // For push animation: start from off-screen
      initialPx,
    });

    // Compute visibility
    const visible = computeSwipeVisibility({
      depth,
      navigationDepth,
      isActive,
      isOperating,
      isAnimating,
    });

    // Compute swipe progress for scale and dimming interpolation
    const swipeProgress = React.useMemo(() => {
      if (containerSize <= 0 || displacement <= 0) {
        return 0;
      }
      return Math.min(displacement / containerSize, 1);
    }, [displacement, containerSize]);

    // Compute scale for "stack" display mode
    // Behind panels are scaled down, and scale interpolates during swipe
    const scale = React.useMemo(() => {
      if (displayMode !== "stack") {
        return 1; // No scale for overlay/slide modes
      }

      const depthDiff = navigationDepth - depth;

      if (role === "active") {
        return 1; // Active panel is always at full scale
      }

      if (role === "behind") {
        // Base scale for behind panel
        const baseScale = 1 - depthDiff * STACK_SCALE_FACTOR;
        // During swipe, interpolate toward 1
        return baseScale + swipeProgress * (1 - baseScale);
      }

      return 1;
    }, [displayMode, role, depth, navigationDepth, swipeProgress]);

    // Compute dimming opacity for behind panels
    // Full dimming at rest, fades to 0 during swipe
    const dimmingOpacity = React.useMemo(() => {
      if (!showDimming || role !== "behind") {
        return 0;
      }
      // Fade from MAX_DIM_OPACITY to 0 as swipe progresses
      return MAX_DIM_OPACITY * (1 - swipeProgress);
    }, [showDimming, role, swipeProgress]);

    // Update visibility via direct DOM manipulation
    React.useLayoutEffect(() => {
      const element = elementRef.current;
      if (element) {
        element.style.visibility = visible ? "visible" : "hidden";
      }
    }, [visible]);

    // Update scale via direct DOM manipulation for smooth animation
    React.useLayoutEffect(() => {
      const element = elementRef.current;
      if (!element || displayMode !== "stack") {
        return;
      }

      // Get current transform (translateX) and append scale
      const currentTransform = element.style.transform;
      if (currentTransform.includes("translateX")) {
        // Extract translateX value and combine with scale
        const translateMatch = currentTransform.match(/translateX\([^)]+\)/);
        if (translateMatch) {
          element.style.transform = `${translateMatch[0]} scale(${scale})`;
        }
      } else {
        element.style.transform = `scale(${scale})`;
      }
    }, [scale, displayMode]);

    // Compute shadow for active panel
    // Shadow is shown on panels at depth > 0 when they're active or animating
    const shouldShowShadow = showShadow ? depth > 0 && role === "active" : false;

    // Static style - transform is handled entirely by useSwipeContentTransform
    // to ensure smooth animations
    const staticStyle = React.useMemo<React.CSSProperties>(
      () => ({
        ...BASE_STYLE,
        pointerEvents: isActive ? "auto" : "none",
        willChange: "transform",
        zIndex: depth,
        visibility: visible ? "visible" : "hidden",
        boxShadow: shouldShowShadow ? ACTIVE_PANEL_SHADOW : undefined,
      }),
      [isActive, depth, visible, shouldShowShadow],
    );

    // Dimming overlay style for behind panels
    const dimmingStyle = React.useMemo<React.CSSProperties | null>(() => {
      if (dimmingOpacity <= 0) {
        return null;
      }
      return {
        position: "absolute",
        inset: 0,
        backgroundColor: `rgba(0, 0, 0, ${dimmingOpacity})`,
        pointerEvents: "none",
        zIndex: 1,
      };
    }, [dimmingOpacity]);

    return (
      <div
        ref={elementRef}
        data-stack-content={id}
        data-depth={depth}
        data-active={isActive ? "true" : "false"}
        data-role={role}
        style={staticStyle}
      >
        {children}
        {dimmingStyle != null ? <div style={dimmingStyle} data-dimming-overlay /> : null}
      </div>
    );
  },
);
