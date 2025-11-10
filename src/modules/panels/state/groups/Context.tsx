/**
 * @file GroupsContext provides group/tab management actions for PanelSystem.
 * This context delegates to the root PanelSystemContext dispatch.
 */
import * as React from "react";
import type { GroupId, PanelId } from "../types";

export type GroupsActions = {
  setActiveTab: (groupId: GroupId, tabId: PanelId) => void;
  tabDrop: (payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; targetIndex: number }) => void;
};

const GroupsContext = React.createContext<GroupsActions | null>(null);

export const useGroups = (): GroupsActions => {
  const ctx = React.useContext(GroupsContext);
  if (!ctx) {
    throw new Error("useGroups must be used within GroupsProvider");
  }
  return ctx;
};

export const GroupsProvider: React.FC<React.PropsWithChildren<{ value: GroupsActions }>> = ({ value, children }) => {
  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
};
