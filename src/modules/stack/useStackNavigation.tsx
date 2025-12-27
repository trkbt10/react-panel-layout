/**
 * @file Headless hook for managing Stack (hierarchical) navigation.
 *
 * Provides navigation operations for a stack-based UI where panels
 * are pushed and popped as the user drills down into content.
 */
import * as React from "react";
import type {
  UseStackNavigationOptions,
  UseStackNavigationResult,
  StackNavigationState,
  StackPanelProps,
  StackBackButtonProps,
  StackPanel,
} from "./types.js";
import { StackContent } from "./StackContent.js";
import { useContentCache } from "../../hooks/useContentCache.js";

/**
 * Navigation action types for centralized state management.
 * All navigation operations go through the reducer to avoid stale closure issues.
 */
type StackAction<TId extends string> =
  | { type: "push"; id: TId }
  | { type: "go"; direction: number }
  | { type: "move"; targetDepth: number }
  | { type: "replace"; id: TId };

/**
 * Reducer for stack navigation state.
 * Centralizes all state transitions to ensure consistent behavior during rapid navigation.
 */
function stackReducer<TId extends string>(
  state: ReadonlyArray<TId>,
  action: StackAction<TId>,
): ReadonlyArray<TId> {
  switch (action.type) {
    case "push":
      return [...state, action.id];

    case "go": {
      if (action.direction >= 0) {
        return state;
      }
      const currentDepth = state.length - 1;
      const targetDepth = currentDepth + action.direction;
      if (targetDepth < 0) {
        return state;
      }
      return state.slice(0, targetDepth + 1);
    }

    case "move": {
      if (action.targetDepth < 0 || action.targetDepth >= state.length) {
        return state;
      }
      return state.slice(0, action.targetDepth + 1);
    }

    case "replace": {
      if (state.length === 0) {
        return [action.id];
      }
      return [...state.slice(0, -1), action.id];
    }
  }
}

/**
 * Context for sharing stack state with Outlet component.
 */
type StackOutletContextValue = {
  getState: () => {
    panels: ReadonlyArray<StackPanel>;
    navigationState: StackNavigationState;
    displayMode: UseStackNavigationOptions["displayMode"];
    transitionMode: NonNullable<UseStackNavigationOptions["transitionMode"]>;
  };
  subscribe: (callback: () => void) => () => void;
  getCachedContent: (panelId: string) => React.ReactNode | null;
};

const StackOutletContext = React.createContext<StackOutletContextValue | null>(null);

/**
 * Outlet component that renders the stack panels.
 */
const StackOutletInner: React.FC = React.memo(() => {
  const ctx = React.useContext(StackOutletContext);
  if (!ctx) {
    throw new Error("StackOutlet must be used within useStackNavigation");
  }

  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    return ctx.subscribe(forceUpdate);
  }, [ctx]);

  const { panels, navigationState, displayMode, transitionMode } = ctx.getState();

  // Get panels that should be rendered (only those in the current stack)
  const visiblePanels = React.useMemo(() => {
    return navigationState.stack.map((id, index) => {
      const panel = panels.find((p) => p.id === id);
      return panel ? { panel, depth: index } : null;
    }).filter((p): p is { panel: StackPanel; depth: number } => p !== null);
  }, [navigationState.stack, panels]);

  return (
    <>
      {visiblePanels.map(({ panel, depth }) => (
        <StackContent
          key={panel.id}
          id={panel.id}
          depth={depth}
          isActive={depth === navigationState.depth}
          displayMode={displayMode}
          transitionMode={transitionMode}
          navigationState={navigationState}
        >
          {panel.cache ? ctx.getCachedContent(panel.id) : panel.content}
        </StackContent>
      ))}
    </>
  );
});

/**
 * Headless hook for managing hierarchical stack navigation.
 *
 * @example
 * ```tsx
 * const { state, push, go, Outlet } = useStackNavigation({
 *   panels: [
 *     { id: 'list', title: 'Items', content: <ListPage /> },
 *     { id: 'detail', title: 'Detail', content: <DetailPage /> },
 *   ],
 *   displayMode: 'overlay',
 * });
 *
 * return (
 *   <div>
 *     <button onClick={() => push('detail')}>View Detail</button>
 *     <Outlet />
 *   </div>
 * );
 * ```
 */
export function useStackNavigation<TId extends string = string>(
  options: UseStackNavigationOptions<TId>,
): UseStackNavigationResult<TId> {
  const {
    panels,
    initialPanelId,
    displayMode,
    transitionMode = "css",
    onPanelChange,
  } = options;

  // Initialize stack with reducer for centralized state management
  const initialId = initialPanelId ?? (panels[0]?.id as TId);
  if (!initialId) {
    throw new Error("useStackNavigation: No panels provided");
  }

  const [stack, dispatch] = React.useReducer(
    stackReducer<TId>,
    [initialId] as ReadonlyArray<TId>,
  );

  // Ref for accessing current stack in callbacks without stale closure
  const stackRef = React.useRef(stack);
  stackRef.current = stack;

  // Track previous stack for onPanelChange callback
  const prevStackRef = React.useRef(stack);
  React.useEffect(() => {
    const prevStack = prevStackRef.current;
    prevStackRef.current = stack;

    if (onPanelChange && stack !== prevStack) {
      const newDepth = stack.length - 1;
      const newPanelId = stack[newDepth];
      if (newPanelId !== undefined) {
        onPanelChange(newPanelId, newDepth);
      }
    }
  }, [stack, onPanelChange]);

  // Reveal state for parent peeking
  const [revealState, setRevealState] = React.useState<{
    isRevealing: boolean;
    revealDepth: number | null;
  }>({ isRevealing: false, revealDepth: null });

  // Current depth (0-indexed)
  const depth = stack.length - 1;

  // Navigation state
  const state: StackNavigationState<TId> = React.useMemo(() => ({
    stack,
    depth,
    isRevealing: revealState.isRevealing,
    revealDepth: revealState.revealDepth,
  }), [stack, depth, revealState.isRevealing, revealState.revealDepth]);

  // Current and previous panel IDs
  const currentPanelId = stack[depth] as TId;
  const previousPanelId = depth > 0 ? stack[depth - 1] as TId : null;

  // All navigation functions dispatch to reducer - no stale closure issues
  const push = React.useCallback((id: TId) => {
    const panel = panels.find((p) => p.id === id);
    if (!panel) {
      return;
    }
    dispatch({ type: "push", id });
  }, [panels]);

  const go = React.useCallback((direction: number) => {
    dispatch({ type: "go", direction });
  }, []);

  const move = React.useCallback((targetDepth: number) => {
    dispatch({ type: "move", targetDepth });
  }, []);

  const replace = React.useCallback((id: TId) => {
    const panel = panels.find((p) => p.id === id);
    if (!panel) {
      return;
    }
    dispatch({ type: "replace", id });
  }, [panels]);

  // canGo uses stackRef for current state
  const canGo = React.useCallback((direction: number): boolean => {
    if (direction >= 0) {
      return false;
    }
    const currentDepth = stackRef.current.length - 1;
    return currentDepth + direction >= 0;
  }, []);

  // Reveal functions use stackRef for current depth
  const revealParent = React.useCallback((targetDepth?: number) => {
    const currentDepth = stackRef.current.length - 1;
    const revealTo = targetDepth ?? currentDepth - 1;
    if (revealTo < 0 || revealTo >= currentDepth) {
      return;
    }
    setRevealState({ isRevealing: true, revealDepth: revealTo });
  }, []);

  const revealRoot = React.useCallback(() => {
    const currentDepth = stackRef.current.length - 1;
    if (currentDepth === 0) {
      return;
    }
    setRevealState({ isRevealing: true, revealDepth: 0 });
  }, []);

  const dismissReveal = React.useCallback(() => {
    setRevealState({ isRevealing: false, revealDepth: null });
  }, []);

  // getPanelProps uses stackRef for current state
  const getPanelProps = React.useCallback((id: TId): StackPanelProps => {
    const currentStack = stackRef.current;
    const panelIndex = currentStack.indexOf(id);
    const currentDepth = currentStack.length - 1;
    const isActive = panelIndex === currentDepth;

    return {
      "data-stack-panel": id,
      "data-depth": panelIndex,
      "data-active": isActive ? "true" : "false",
      "aria-hidden": !isActive,
    };
  }, []);

  // getBackButtonProps uses stackRef for current state
  const getBackButtonProps = React.useCallback((): StackBackButtonProps => {
    const currentStack = stackRef.current;
    const currentDepth = currentStack.length - 1;
    const canGoBack = currentDepth > 0;
    const prevPanelId = currentDepth > 0 ? currentStack[currentDepth - 1] : null;
    const prevPanel = prevPanelId ? panels.find((p) => p.id === prevPanelId) : null;
    const label = prevPanel?.title ? `Back to ${prevPanel.title}` : "Go back";

    return {
      onClick: () => go(-1),
      disabled: !canGoBack,
      "aria-label": label,
    };
  }, [panels, go]);

  // Container style
  const containerStyle: React.CSSProperties = React.useMemo(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    }),
    [],
  );

  // State ref for stable getState function
  const stateRef = React.useRef({
    panels,
    navigationState: state,
    displayMode,
    transitionMode,
  });

  stateRef.current = {
    panels,
    navigationState: state,
    displayMode,
    transitionMode,
  };

  // Subscribers for state changes
  const subscribersRef = React.useRef(new Set<() => void>());

  // Notify subscribers when state changes
  React.useEffect(() => {
    subscribersRef.current.forEach((callback) => callback());
  }, [state, displayMode, transitionMode]);

  // Content resolver for useContentCache
  const resolveContent = React.useCallback(
    (panelId: string): React.ReactNode | null => {
      const panel = stateRef.current.panels.find((p) => p.id === panelId);
      return panel?.content ?? null;
    },
    [],
  );

  // Valid IDs for cache cleanup
  const validIds = React.useMemo((): readonly string[] => panels.map((p) => p.id), [panels]);

  // Use shared content cache hook
  const { getCachedContent } = useContentCache({
    resolveContent,
    validIds,
  });

  // Stable context value
  const contextValue = React.useMemo<StackOutletContextValue>(
    () => ({
      getState: () => stateRef.current,
      subscribe: (callback) => {
        subscribersRef.current.add(callback);
        return () => subscribersRef.current.delete(callback);
      },
      getCachedContent,
    }),
    [getCachedContent],
  );

  // Stable Outlet component
  const Outlet = React.useMemo(() => {
    const OutletComponent: React.FC = () => (
      <StackOutletContext.Provider value={contextValue}>
        <div style={containerStyle} data-stack-container>
          <StackOutletInner />
        </div>
      </StackOutletContext.Provider>
    );
    OutletComponent.displayName = "StackOutlet";
    return OutletComponent;
  }, [contextValue, containerStyle]);

  return {
    state,
    push,
    go,
    move,
    replace,
    revealParent,
    revealRoot,
    dismissReveal,
    getPanelProps,
    getBackButtonProps,
    canGo,
    currentPanelId,
    previousPanelId,
    Outlet,
  };
}
