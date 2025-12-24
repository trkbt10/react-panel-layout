/**
 * @file Headless hook for managing Pivot (content switching) behavior.
 *
 * Includes content caching to preserve React component state across re-renders.
 * This is essential for maintaining internal state when parent components
 * re-create the items array.
 */
import * as React from "react";
import type { UsePivotOptions, UsePivotResult, PivotItemProps, PivotItem, PivotNavigationOptions } from "./types";
import { PivotContent } from "./PivotContent";
import { useContentCache } from "../../hooks/useContentCache";

/**
 * Context for sharing pivot state with Outlet component.
 * Uses a ref-based approach to avoid re-creating the Outlet component.
 * Includes content cache to preserve component state.
 */
type PivotOutletContextValue = {
  getState: () => {
    items: ReadonlyArray<PivotItem>;
    activeId: string;
    transitionMode: "css" | "none";
  };
  subscribe: (callback: () => void) => () => void;
  /**
   * Get cached content for an item. Returns the same ReactNode reference
   * for the same item ID to prevent remounting on parent re-renders.
   */
  getCachedContent: (itemId: string) => React.ReactNode | null;
};

const PivotOutletContext = React.createContext<PivotOutletContextValue | null>(null);

/**
 * Stable Outlet component that subscribes to state changes.
 * This prevents remounting when activeId changes.
 * Uses cached content only when item.cache is true.
 */
const PivotOutletInner: React.FC = React.memo(() => {
  const ctx = React.useContext(PivotOutletContext);
  if (!ctx) {
    throw new Error("PivotOutlet must be used within usePivot");
  }

  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    return ctx.subscribe(forceUpdate);
  }, [ctx]);

  const { items, activeId, transitionMode } = ctx.getState();

  return (
    <>
      {items.map((item) => (
        <PivotContent key={item.id} id={item.id} isActive={item.id === activeId} transitionMode={transitionMode}>
          {item.cache ? ctx.getCachedContent(item.id) : item.content}
        </PivotContent>
      ))}
    </>
  );
});

/**
 * Headless hook for managing content switching within a scope.
 * Provides behavior only - UI is fully customizable.
 *
 * @example
 * ```tsx
 * const { activeId, getItemProps, Outlet } = usePivot({
 *   items: [
 *     { id: 'home', label: 'Home', content: <HomePage /> },
 *     { id: 'settings', label: 'Settings', content: <SettingsPage /> }
 *   ],
 *   defaultActiveId: 'home'
 * });
 *
 * return (
 *   <div>
 *     <nav>
 *       {items.map((item) => (
 *         <button key={item.id} {...getItemProps(item.id)}>{item.label}</button>
 *       ))}
 *     </nav>
 *     <Outlet />
 *   </div>
 * );
 * ```
 */
export function usePivot<TId extends string = string>(options: UsePivotOptions<TId>): UsePivotResult<TId> {
  const { items, activeId: controlledActiveId, defaultActiveId, onActiveChange, transitionMode = "css" } = options;

  const isControlled = controlledActiveId !== undefined;

  const [uncontrolledActiveId, setUncontrolledActiveId] = React.useState<TId>(() => {
    if (defaultActiveId !== undefined) {
      return defaultActiveId;
    }
    const firstEnabled = items.find((item) => item.disabled !== true);
    if (!firstEnabled) {
      throw new Error("usePivot: No enabled items provided");
    }
    return firstEnabled.id;
  });

  const activeId = isControlled ? controlledActiveId : uncontrolledActiveId;

  // Animation state
  const [isAnimating, setIsAnimating] = React.useState(false);

  const setActiveId = React.useCallback(
    (id: TId, options?: PivotNavigationOptions) => {
      const target = items.find((item) => item.id === id);
      if (!target) {
        return;
      }
      if (target.disabled) {
        return;
      }

      // Determine if we should animate
      const shouldAnimate = options?.animated ?? (transitionMode === "css");
      setIsAnimating(shouldAnimate);

      if (!isControlled) {
        setUncontrolledActiveId(id);
      }
      onActiveChange?.(id);
    },
    [items, isControlled, onActiveChange, transitionMode],
  );

  // End animation callback
  const endAnimation = React.useCallback(() => {
    setIsAnimating(false);
  }, []);

  const isActive = React.useCallback((id: TId): boolean => id === activeId, [activeId]);

  // Get only enabled items for navigation
  const enabledItems = React.useMemo(
    () => items.filter((item) => item.disabled !== true),
    [items],
  );

  // Current index in enabled items
  const activeIndex = React.useMemo(() => {
    const index = enabledItems.findIndex((item) => item.id === activeId);
    return index === -1 ? 0 : index;
  }, [enabledItems, activeId]);

  // Total count of enabled items
  const itemCount = enabledItems.length;

  // Check if navigation in a direction is possible
  const canGo = React.useCallback(
    (direction: number): boolean => {
      if (direction === 0) {
        return false;
      }
      const targetIndex = activeIndex + direction;
      return targetIndex >= 0 && targetIndex < itemCount;
    },
    [activeIndex, itemCount],
  );

  // Navigate in a direction
  const go = React.useCallback(
    (direction: number, options?: PivotNavigationOptions): void => {
      if (!canGo(direction)) {
        return;
      }
      const targetIndex = activeIndex + direction;
      const targetItem = enabledItems[targetIndex];
      if (targetItem) {
        setActiveId(targetItem.id, options);
      }
    },
    [canGo, activeIndex, enabledItems, setActiveId],
  );

  const getItemProps = React.useCallback(
    (id: TId): PivotItemProps => ({
      "data-pivot-item": id,
      "data-active": (id === activeId ? "true" : "false") as "true" | "false",
      "aria-selected": id === activeId,
      tabIndex: id === activeId ? 0 : -1,
      onClick: () => {
        setActiveId(id);
      },
    }),
    [activeId, setActiveId],
  );

  const containerStyle: React.CSSProperties = React.useMemo(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
    }),
    [],
  );

  // Store state in a ref for stable getState function
  const stateRef = React.useRef({
    items,
    activeId,
    transitionMode,
  });

  // Update ref when state changes
  stateRef.current = {
    items,
    activeId,
    transitionMode,
  };

  // Subscribers for state changes
  const subscribersRef = React.useRef(new Set<() => void>());

  // Notify subscribers when activeId changes
  React.useEffect(() => {
    subscribersRef.current.forEach((callback) => callback());
  }, [activeId, transitionMode]);

  // Content resolver for useContentCache
  const resolveContent = React.useCallback(
    (itemId: string): React.ReactNode | null => {
      const item = stateRef.current.items.find((i) => i.id === itemId);
      return item?.content ?? null;
    },
    [],
  );

  // Valid IDs for cache cleanup (cast to string[] for useContentCache compatibility)
  const validIds = React.useMemo((): readonly string[] => items.map((i) => i.id), [items]);

  // Use shared content cache hook
  const { getCachedContent } = useContentCache({
    resolveContent,
    validIds,
  });

  // Stable context value (never changes)
  const contextValue = React.useMemo<PivotOutletContextValue>(
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

  // Stable Outlet component (reference never changes)
  const Outlet = React.useMemo(() => {
    const OutletComponent: React.FC = () => (
      <PivotOutletContext.Provider value={contextValue}>
        <div style={containerStyle} data-pivot-container>
          <PivotOutletInner />
        </div>
      </PivotOutletContext.Provider>
    );
    OutletComponent.displayName = "PivotOutlet";
    return OutletComponent;
  }, [contextValue, containerStyle]);

  return { activeId, setActiveId, isActive, getItemProps, Outlet, go, canGo, activeIndex, itemCount, isAnimating, endAnimation };
}
