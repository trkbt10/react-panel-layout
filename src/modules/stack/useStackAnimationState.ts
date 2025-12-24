/**
 * @file Hook for managing stack animation state.
 *
 * Tracks panel lifecycle: entering → active → exiting → removed
 * Provides stable state for animations regardless of React render timing.
 */
import * as React from "react";

export type PanelAnimationPhase = "entering" | "active" | "exiting";

export type AnimatedPanel = {
  id: string;
  depth: number;
  phase: PanelAnimationPhase;
};

export type UseStackAnimationStateOptions = {
  /** Current stack from navigation */
  stack: ReadonlyArray<string>;
  /** Called when an exiting panel's animation completes */
  onExitComplete?: (id: string) => void;
};

export type UseStackAnimationStateResult = {
  /** All panels to render (active + exiting) */
  panels: ReadonlyArray<AnimatedPanel>;
  /** Mark a panel's enter animation as complete */
  markEnterComplete: (id: string) => void;
  /** Mark a panel's exit animation as complete */
  markExitComplete: (id: string) => void;
};

/**
 * Computes animated panels from current and previous stack.
 * Pure function for easy testing.
 */
export function computeAnimatedPanels(
  prevPanels: ReadonlyArray<AnimatedPanel>,
  prevStack: ReadonlyArray<string>,
  currentStack: ReadonlyArray<string>,
): ReadonlyArray<AnimatedPanel> {
  const result: AnimatedPanel[] = [];
  const currentStackSet = new Set(currentStack);

  // Add panels from current stack
  for (let i = 0; i < currentStack.length; i++) {
    const id = currentStack[i];
    const wasInPrevStack = prevStack.includes(id);
    const prevPanel = prevPanels.find((p) => p.id === id);

    let phase: PanelAnimationPhase;
    if (!wasInPrevStack && prevStack.length > 0) {
      // New panel pushed onto stack
      phase = "entering";
    } else if (prevPanel?.phase === "entering") {
      // Was entering, keep entering until animation completes
      phase = "entering";
    } else {
      phase = "active";
    }

    result.push({ id, depth: i, phase });
  }

  // Add exiting panels (were in prev stack but not in current)
  for (let i = 0; i < prevStack.length; i++) {
    const id = prevStack[i];
    if (!currentStackSet.has(id)) {
      // This panel was popped
      const prevPanel = prevPanels.find((p) => p.id === id);
      // Keep depth from previous position for animation
      const depth = prevPanel?.depth ?? i;
      result.push({ id, depth, phase: "exiting" });
    }
  }

  // Also keep any panels that were already exiting
  for (const panel of prevPanels) {
    if (panel.phase === "exiting" && !result.some((p) => p.id === panel.id)) {
      result.push(panel);
    }
  }

  return result;
}

/**
 * Hook for managing stack animation state.
 *
 * Uses a ref-based approach to compute panels synchronously during render,
 * avoiding the flash that would occur with useEffect.
 */
export function useStackAnimationState(
  options: UseStackAnimationStateOptions,
): UseStackAnimationStateResult {
  const { stack, onExitComplete } = options;

  // Use refs for synchronous computation during render
  const prevStackRef = React.useRef<ReadonlyArray<string>>(stack);
  const panelsRef = React.useRef<ReadonlyArray<AnimatedPanel>>(
    stack.map((id, i) => ({ id, depth: i, phase: "active" as const })),
  );

  // Compute panels synchronously during render
  const prevStack = prevStackRef.current;
  const stackChanged =
    prevStack.length !== stack.length || prevStack.some((id, i) => stack[i] !== id);

  if (stackChanged) {
    panelsRef.current = computeAnimatedPanels(panelsRef.current, prevStack, stack);
    prevStackRef.current = stack;
  }

  // Force re-render when panels change (for animation completion callbacks)
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const markEnterComplete = React.useCallback((id: string) => {
    panelsRef.current = panelsRef.current.map((p) =>
      p.id === id && p.phase === "entering" ? { ...p, phase: "active" } : p,
    );
    forceUpdate();
  }, []);

  const markExitComplete = React.useCallback(
    (id: string) => {
      panelsRef.current = panelsRef.current.filter((p) => p.id !== id);
      onExitComplete?.(id);
      forceUpdate();
    },
    [onExitComplete],
  );

  return {
    panels: panelsRef.current,
    markEnterComplete,
    markExitComplete,
  };
}
