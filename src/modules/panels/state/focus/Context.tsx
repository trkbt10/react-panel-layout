/**
 * @file FocusContext provides focus/navigation actions for PanelSystem.
 * This context delegates to the root PanelSystemContext dispatch.
 */
import * as React from "react";

export type FocusActions = {
  focusGroupIndex: (index1Based: number) => void;
  focusNextGroup: () => void;
  focusPrevGroup: () => void;
};

const FocusContext = React.createContext<FocusActions | null>(null);

export const useFocus = (): FocusActions => {
  const ctx = React.useContext(FocusContext);
  if (!ctx) {
    throw new Error("useFocus must be used within FocusProvider");
  }
  return ctx;
};

export const FocusProvider: React.FC<React.PropsWithChildren<{ value: FocusActions }>> = ({ value, children }) => {
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};
