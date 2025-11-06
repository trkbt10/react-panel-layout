/**
 * @file Group and tab registry operations (pure, no tree logic).
 */
import type { GroupId, GroupModel, PanelId, PanelSystemState, TabDefinition } from "./types";

export const createEmptyGroup = (id: GroupId): GroupModel => {
  return { id, tabs: [], activeTabId: null };
};

export const addTabToGroup = (state: PanelSystemState, groupId: GroupId, tab: TabDefinition, makeActive: boolean): PanelSystemState => {
  const groups = { ...state.groups };
  const group = groups[groupId];
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }
  const tabs = [...group.tabs, tab];
  const activeTabId = makeActive ? tab.id : group.activeTabId ?? tab.id;
  const nextGroup: GroupModel = { ...group, tabs, activeTabId };
  groups[groupId] = nextGroup;
  return { ...state, groups };
};

export const removeTabFromGroup = (state: PanelSystemState, groupId: GroupId, tabId: PanelId): PanelSystemState => {
  const groups = { ...state.groups };
  const group = groups[groupId];
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }
  const tabs = group.tabs.filter((t) => t.id !== tabId);
  const activeTabId = group.activeTabId === tabId ? (tabs[0]?.id ?? null) : group.activeTabId;
  groups[groupId] = { ...group, tabs, activeTabId };
  return { ...state, groups };
};

export const moveTab = (state: PanelSystemState, fromGroupId: GroupId, toGroupId: GroupId, tabId: PanelId, makeActive: boolean): PanelSystemState => {
  const from = state.groups[fromGroupId];
  const to = state.groups[toGroupId];
  if (!from || !to) {
    throw new Error("moveTab: source or target group is missing.");
  }
  const tab = from.tabs.find((t) => t.id === tabId);
  if (!tab) {
    throw new Error(`moveTab: tab ${tabId} not found in group ${fromGroupId}.`);
  }
  const groups = { ...state.groups };
  const fromTabs = from.tabs.filter((t) => t.id !== tabId);
  const toTabs = [...to.tabs, tab];
  const fromActive = from.activeTabId === tabId ? fromTabs[0]?.id ?? null : from.activeTabId;
  groups[fromGroupId] = { ...from, tabs: fromTabs, activeTabId: fromActive };
  groups[toGroupId] = { ...to, tabs: toTabs, activeTabId: makeActive ? tabId : to.activeTabId ?? tabId };
  return { ...state, groups };
};

export const setActiveTab = (state: PanelSystemState, groupId: GroupId, tabId: PanelId): PanelSystemState => {
  const group = state.groups[groupId];
  if (!group) {
    throw new Error(`setActiveTab: group ${groupId} not found.`);
  }
  if (!group.tabs.some((t) => t.id === tabId)) {
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
  const currentIndex = group.tabs.findIndex((t) => t.id === tabId);
  if (currentIndex === -1) {
    throw new Error(`reorderTabWithinGroup: tab ${tabId} not in group ${groupId}.`);
  }
  const boundedIndex = Math.max(0, Math.min(toIndex, group.tabs.length - 1));
  if (currentIndex === boundedIndex) {
    return state;
  }
  const tabs = group.tabs.slice();
  const [tab] = tabs.splice(currentIndex, 1);
  tabs.splice(boundedIndex, 0, tab);
  const groups = { ...state.groups, [groupId]: { ...group, tabs } };
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
  const tabs = group.tabs.slice();
  const boundedIndex = Math.max(0, Math.min(index, tabs.length));
  tabs.splice(boundedIndex, 0, tab);
  const activeTabId = makeActive ? tab.id : group.activeTabId ?? tab.id;
  const groups = { ...state.groups, [groupId]: { ...group, tabs, activeTabId } };
  return { ...state, groups };
};
