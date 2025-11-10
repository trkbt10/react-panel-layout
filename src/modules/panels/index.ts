/**
 * @file Public state operations aggregator (flattened under src/modules/panels).
 */
export type {
  PanelId,
  GroupId,
  SplitDirection,
  TabDefinition,
  GroupModel,
  PanelTree,
  PanelSystemState,
  DropZone,
  DraggingTab,
  PanelCommands,
  PanelSystemProps,
} from "./core/types";

export { collectGroupsInOrder, splitLeaf, closeLeaf, isGroup, setSplitRatio } from "./core/tree";
export { createEmptyGroup, addTabToGroup, removeTabFromGroup, moveTab, setActiveTab, reorderTabWithinGroup, addTabToGroupAtIndex } from "./core/groups";
export { setFocusedGroup, focusGroupIndex, nextGroup, prevGroup, refreshGroupOrder } from "./core/focus";

import type { GroupId as Gid, PanelSystemState as PState, SplitDirection as Dir, TabDefinition } from "./core/types";
import { splitLeaf, collectGroupsInOrder } from "./core/tree";
import { createEmptyGroup } from "./core/groups";

export type IdFactory = () => Gid;

export const splitGroup = (state: PState, groupId: Gid, direction: Dir, createGroupId: IdFactory): PState => {
  const { tree, newGroupId } = splitLeaf(state.tree, groupId, direction, createGroupId);
  const groups = { ...state.groups, [newGroupId]: createEmptyGroup(newGroupId) };
  const groupOrder = collectGroupsInOrder(tree);
  const focusedGroupId = newGroupId;
  return { ...state, tree, groups, groupOrder, focusedGroupId };
};

export const buildInitialState = (tabs: TabDefinition[]): PState => {
  const groupId: Gid = "g_1";
  const tree = { type: "group", groupId } as const;
  const panels = Object.fromEntries(tabs.map((t) => [t.id, t]));
  const group = { id: groupId, tabIds: tabs.map((t) => t.id), tabs, activeTabId: tabs[0]?.id ?? null } as const;
  const groups = { [groupId]: group } as PState["groups"];
  const groupOrder: Gid[] = [groupId];
  return { tree, panels, groups, groupOrder, focusedGroupId: groupId } as PState;
};
