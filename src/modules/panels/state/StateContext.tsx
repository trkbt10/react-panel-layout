/**
 * @file State context for VSCode-like panel system (backward compatibility layer).
 * This file re-exports PanelSystemContext for compatibility with existing code.
 */
export {
  PanelSystemProvider as PanelStateProvider,
  usePanelSystem as usePanelState,
  type PanelSystemProviderProps as PanelStateProviderProps,
  type PanelSystemContextValue as PanelStateContextValue,
  type PanelStateAction,
  type PanelStateActions,
} from "./PanelSystemContext";
