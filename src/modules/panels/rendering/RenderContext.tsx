/**
 * @file Panel render context providing per-group accessors and actions.
 */
import * as React from "react";
import type { GroupId, GroupModel, PanelId } from "../state/types";

export type PanelRenderContextValue = {
  getGroup: (id: GroupId) => GroupModel | null;
  getGroupContent: (id: GroupId) => React.ReactNode;
  onClickTab: (groupId: GroupId, tabId: PanelId) => void;
  onAddTab?: (groupId: GroupId) => void;
  onCloseTab?: (groupId: GroupId, tabId: PanelId) => void;
  onStartTabDrag: (tabId: PanelId, groupId: GroupId, e: React.PointerEvent) => void;
  onStartContentDrag: (groupId: GroupId, e: React.PointerEvent<HTMLDivElement>) => void;
  doubleClickToAdd?: boolean;
  registerContentContainer: (groupId: GroupId, element: HTMLElement | null) => void;
};

const PanelRenderContext = React.createContext<PanelRenderContextValue | null>(null);

export const usePanelRenderContext = (): PanelRenderContextValue => {
  const ctx = React.useContext(PanelRenderContext);
  if (!ctx) {
    throw new Error("usePanelRenderContext must be used within PanelRenderProvider");
  }
  return ctx;
};

export const PanelRenderProvider: React.FC<React.PropsWithChildren<{ value: PanelRenderContextValue }>> = ({ value, children }) => {
  return <PanelRenderContext.Provider value={value}>{children}</PanelRenderContext.Provider>;
};
