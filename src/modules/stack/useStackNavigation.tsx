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

  // Initialize stack with initial panel
  const [stack, setStack] = React.useState<ReadonlyArray<TId>>(() => {
    const initialId = initialPanelId ?? (panels[0]?.id as TId);
    if (!initialId) {
      throw new Error("useStackNavigation: No panels provided");
    }
    return [initialId];
  });

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

  // Push a new panel onto the stack
  const push = React.useCallback((id: TId) => {
    const panel = panels.find((p) => p.id === id);
    if (!panel) {
      return;
    }
    setStack((prev) => [...prev, id]);
    onPanelChange?.(id, depth + 1);
  }, [panels, depth, onPanelChange]);

  // Navigate in a direction
  const go = React.useCallback((direction: number) => {
    if (direction >= 0) {
      return; // go is only for going back in stack navigation
    }
    const targetDepth = depth + direction;
    if (targetDepth < 0) {
      return;
    }
    setStack((prev) => prev.slice(0, targetDepth + 1));
    const targetId = stack[targetDepth] as TId;
    onPanelChange?.(targetId, targetDepth);
  }, [depth, stack, onPanelChange]);

  // Move to absolute depth
  const move = React.useCallback((targetDepth: number) => {
    if (targetDepth < 0 || targetDepth >= stack.length) {
      return;
    }
    setStack((prev) => prev.slice(0, targetDepth + 1));
    const targetId = stack[targetDepth] as TId;
    onPanelChange?.(targetId, targetDepth);
  }, [stack, onPanelChange]);

  // Replace current panel
  const replace = React.useCallback((id: TId) => {
    const panel = panels.find((p) => p.id === id);
    if (!panel) {
      return;
    }
    setStack((prev) => [...prev.slice(0, -1), id]);
    onPanelChange?.(id, depth);
  }, [panels, depth, onPanelChange]);

  // Check if navigation is possible
  const canGo = React.useCallback((direction: number): boolean => {
    if (direction >= 0) {
      return false; // canGo only checks backward navigation for stacks
    }
    const targetDepth = depth + direction;
    return targetDepth >= 0;
  }, [depth]);

  // Reveal parent panel
  const revealParent = React.useCallback((targetDepth?: number) => {
    const revealTo = targetDepth ?? depth - 1;
    if (revealTo < 0 || revealTo >= depth) {
      return;
    }
    setRevealState({ isRevealing: true, revealDepth: revealTo });
  }, [depth]);

  // Reveal root panel
  const revealRoot = React.useCallback(() => {
    if (depth === 0) {
      return;
    }
    setRevealState({ isRevealing: true, revealDepth: 0 });
  }, [depth]);

  // Dismiss reveal
  const dismissReveal = React.useCallback(() => {
    setRevealState({ isRevealing: false, revealDepth: null });
  }, []);

  // Get props for a panel element
  const getPanelProps = React.useCallback((id: TId): StackPanelProps => {
    const panelIndex = stack.indexOf(id);
    const isActive = panelIndex === depth;

    return {
      "data-stack-panel": id,
      "data-depth": panelIndex,
      "data-active": isActive ? "true" : "false",
      "aria-hidden": !isActive,
    };
  }, [stack, depth]);

  // Get props for back button
  const getBackButtonProps = React.useCallback((): StackBackButtonProps => {
    const canGoBack = depth > 0;
    const prevPanel = previousPanelId ? panels.find((p) => p.id === previousPanelId) : null;
    const label = prevPanel?.title ? `Back to ${prevPanel.title}` : "Go back";

    return {
      onClick: () => go(-1),
      disabled: !canGoBack,
      "aria-label": label,
    };
  }, [depth, previousPanelId, panels, go]);

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
