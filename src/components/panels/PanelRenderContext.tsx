/**
 * @file PanelSystem render context providing per-group accessors and actions.
 */
import * as React from "react";
import type { GroupId, GroupModel, PanelId } from "../../modules/panels/types";

export type PanelRenderContextValue = {
  getGroup: (id: GroupId) => GroupModel | null;
  onClickTab: (groupId: GroupId, tabId: PanelId) => void;
  onStartTabDrag: (tabId: PanelId, groupId: GroupId, e: React.PointerEvent) => void;
  onStartContentDrag: (groupId: GroupId, e: React.PointerEvent<HTMLDivElement>) => void;
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
