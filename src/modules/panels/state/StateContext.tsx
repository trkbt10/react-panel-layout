/**
 * @file State context for VSCode-like panel system (modules layer)
 * Provides single source of truth state and helpers to update it.
 */
import * as React from "react";
import type { GroupId, PanelSystemState } from "./types";
import { cleanupEmptyGroups } from "./cleanup";

export type PanelStateContextValue = {
  state: PanelSystemState;
  setState: (updater: (prev: PanelSystemState) => PanelSystemState) => void;
  createGroupId: () => GroupId;
};

const PanelStateContext = React.createContext<PanelStateContextValue | null>(null);

export const usePanelState = (): PanelStateContextValue => {
  const ctx = React.useContext(PanelStateContext);
  if (!ctx) {
    throw new Error("usePanelState must be used within PanelStateProvider");
  }
  return ctx;
};

export type PanelStateProviderProps = React.PropsWithChildren<{
  initialState: PanelSystemState;
  createGroupId: () => GroupId;
  state?: PanelSystemState;
  onStateChange?: (next: PanelSystemState) => void;
}>;

export const PanelStateProvider: React.FC<PanelStateProviderProps> = ({ initialState, createGroupId, state: controlled, onStateChange, children }) => {
  // Sanitize initial state to avoid rendering stale empty groups
  const initialSanitized = React.useMemo(() => cleanupEmptyGroups(initialState), [initialState]);
  const [uncontrolled, setUncontrolled] = React.useState<PanelSystemState>(initialSanitized);
  const rawState = controlled ?? uncontrolled;
  // Derive a sanitized view of state for rendering/consumers without mutating external state
  const state = React.useMemo(() => cleanupEmptyGroups(rawState), [rawState]);

  const setState = React.useCallback(
    (updater: (prev: PanelSystemState) => PanelSystemState) => {
      const nextRaw = updater(state);
      const next = cleanupEmptyGroups(nextRaw);
      if (onStateChange) {
        onStateChange(next);
      }
      if (!controlled) {
        setUncontrolled(next);
      }
    },
    [state, controlled, onStateChange],
  );

  const value = React.useMemo<PanelStateContextValue>(() => ({ state, setState, createGroupId }), [state, setState, createGroupId]);

  return <PanelStateContext.Provider value={value}>{children}</PanelStateContext.Provider>;
};
