/**
 * @file State context for VSCode-like panel system (modules layer)
 * Provides single source of truth state and helpers to update it.
 */
import * as React from "react";
import type { GroupId, PanelSystemState } from "../core/types";

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
  const [uncontrolled, setUncontrolled] = React.useState<PanelSystemState>(initialState);
  const state = controlled ?? uncontrolled;

  const setState = React.useCallback(
    (updater: (prev: PanelSystemState) => PanelSystemState) => {
      const next = updater(state);
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

