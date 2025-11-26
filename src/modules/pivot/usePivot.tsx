/**
 * @file Headless hook for managing Pivot (content switching) behavior.
 */
import * as React from "react";
import type { UsePivotOptions, UsePivotResult, PivotItemProps, PivotItem } from "./types";
import { PivotContent } from "./PivotContent";

/**
 * Context for sharing pivot state with Outlet component.
 * Uses a ref-based approach to avoid re-creating the Outlet component.
 */
type PivotOutletContextValue = {
  getState: () => {
    items: ReadonlyArray<PivotItem>;
    activeId: string;
    transitionMode: "css" | "none";
  };
  subscribe: (callback: () => void) => () => void;
};

const PivotOutletContext = React.createContext<PivotOutletContextValue | null>(null);

/**
 * Stable Outlet component that subscribes to state changes.
 * This prevents remounting when activeId changes.
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
          {item.content}
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

  const setActiveId = React.useCallback(
    (id: TId) => {
      const target = items.find((item) => item.id === id);
      if (!target) {
        return;
      }
      if (target.disabled) {
        return;
      }
      if (!isControlled) {
        setUncontrolledActiveId(id);
      }
      onActiveChange?.(id);
    },
    [items, isControlled, onActiveChange],
  );

  const isActive = React.useCallback((id: TId): boolean => id === activeId, [activeId]);

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

  // Stable context value (never changes)
  const contextValue = React.useMemo<PivotOutletContextValue>(
    () => ({
      getState: () => stateRef.current,
      subscribe: (callback) => {
        subscribersRef.current.add(callback);
        return () => subscribersRef.current.delete(callback);
      },
    }),
    [],
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

  return { activeId, setActiveId, isActive, getItemProps, Outlet };
}
