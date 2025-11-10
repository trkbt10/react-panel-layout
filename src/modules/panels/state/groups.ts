/**
 * @file Group and tab registry operations (pure, no tree logic).
 */
import type { GroupId, GroupModel, PanelId, PanelSystemState, TabDefinition } from "./types";

export const createEmptyGroup = (id: GroupId): GroupModel => {
  return { id, tabIds: [], tabs: [], activeTabId: null };
};

export const addTabToGroup = (state: PanelSystemState, groupId: GroupId, tab: TabDefinition, makeActive: boolean): PanelSystemState => {
  const groups = { ...state.groups };
  const group = groups[groupId];
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }
  const panels = { ...state.panels, [tab.id]: tab };
  const tabIds = [...group.tabIds, tab.id];
  const activeTabId = makeActive ? tab.id : group.activeTabId ?? tab.id;
  const tabs = tabIds.map((id) => panels[id]);
  const nextGroup: GroupModel = { ...group, tabIds, tabs, activeTabId };
  groups[groupId] = nextGroup;
  return { ...state, panels, groups };
};

export const removeTabFromGroup = (state: PanelSystemState, groupId: GroupId, tabId: PanelId): PanelSystemState => {
  const groups = { ...state.groups };
  const group = groups[groupId];
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }
  const tabIds = group.tabIds.filter((id) => id !== tabId);
  const tabs = tabIds.map((id) => state.panels[id]);
  const activeTabId = group.activeTabId === tabId ? (tabIds[0] ?? null) : group.activeTabId;
  groups[groupId] = { ...group, tabIds, tabs, activeTabId };
  return { ...state, groups };
};

export const moveTab = (state: PanelSystemState, fromGroupId: GroupId, toGroupId: GroupId, tabId: PanelId, makeActive: boolean): PanelSystemState => {
  const from = state.groups[fromGroupId];
  const to = state.groups[toGroupId];
  if (!from || !to) {
    throw new Error("moveTab: source or target group is missing.");
  }
  const groups = { ...state.groups };
  const fromIds = from.tabIds.filter((id) => id !== tabId);
  const toIds = [...to.tabIds.filter((id) => id !== tabId), tabId];
  const fromActive = from.activeTabId === tabId ? (fromIds[0] ?? null) : from.activeTabId;
  groups[fromGroupId] = { ...from, tabIds: fromIds, tabs: fromIds.map((id) => state.panels[id]), activeTabId: fromActive };
  groups[toGroupId] = { ...to, tabIds: toIds, tabs: toIds.map((id) => state.panels[id]), activeTabId: makeActive ? tabId : to.activeTabId ?? tabId };
  return { ...state, groups };
};

export const setActiveTab = (state: PanelSystemState, groupId: GroupId, tabId: PanelId): PanelSystemState => {
  const group = state.groups[groupId];
  if (!group) {
    throw new Error(`setActiveTab: group ${groupId} not found.`);
  }
  if (!group.tabIds.some((id) => id === tabId)) {
    throw new Error(`setActiveTab: tab ${tabId} not found in group ${groupId}.`);
  }
  const groups = { ...state.groups, [groupId]: { ...group, activeTabId: tabId } };
  return { ...state, groups, focusedGroupId: groupId };
};

export const reorderTabWithinGroup = (state: PanelSystemState, groupId: GroupId, tabId: PanelId, toIndex: number): PanelSystemState => {
  const group = state.groups[groupId];
  if (!group) {
    throw new Error(`reorderTabWithinGroup: group ${groupId} not found.`);
  }
  const currentIndex = group.tabIds.findIndex((id) => id === tabId);
  if (currentIndex === -1) {
    throw new Error(`reorderTabWithinGroup: tab ${tabId} not in group ${groupId}.`);
  }
  const boundedIndex = Math.max(0, Math.min(toIndex, group.tabIds.length - 1));
  if (currentIndex === boundedIndex) {
    return state;
  }
  const ids = group.tabIds.slice();
  const [id] = ids.splice(currentIndex, 1);
  ids.splice(boundedIndex, 0, id);
  const tabs = ids.map((x) => state.panels[x]);
  const groups = { ...state.groups, [groupId]: { ...group, tabIds: ids, tabs } };
  return { ...state, groups };
};

export const addTabToGroupAtIndex = (
  state: PanelSystemState,
  groupId: GroupId,
  tab: TabDefinition,
  index: number,
  makeActive: boolean,
): PanelSystemState => {
  const group = state.groups[groupId];
  if (!group) {
    throw new Error(`addTabToGroupAtIndex: group ${groupId} not found.`);
  }
  const panels = { ...state.panels, [tab.id]: tab };
  const ids = group.tabIds.slice();
  const boundedIndex = Math.max(0, Math.min(index, ids.length));
  ids.splice(boundedIndex, 0, tab.id);
  const tabs = ids.map((id) => panels[id]);
  const activeTabId = makeActive ? tab.id : group.activeTabId ?? tab.id;
  const groups = { ...state.groups, [groupId]: { ...group, tabIds: ids, tabs, activeTabId } };
  return { ...state, panels, groups };
};
