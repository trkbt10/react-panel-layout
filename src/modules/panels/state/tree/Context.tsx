/**
 * @file TreeContext provides tree/split management actions for PanelSystem.
 * This context delegates to the root PanelSystemContext dispatch.
 */
import * as React from "react";
import type { NodePath } from "./logic";

export type TreeActions = {
  adjustSplitRatio: (payload: { path: NodePath; deltaRatio: number }) => void;
};

const TreeContext = React.createContext<TreeActions | null>(null);

export const useTree = (): TreeActions => {
  const ctx = React.useContext(TreeContext);
  if (!ctx) {
    throw new Error("useTree must be used within TreeProvider");
  }
  return ctx;
};

export const TreeProvider: React.FC<React.PropsWithChildren<{ value: TreeActions }>> = ({ value, children }) => {
  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
};
