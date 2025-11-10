/**
 * @file Cleanup utilities for PanelSystem state.
 * - Removes groups with no tabs and collapses the tree accordingly.
 */
import type { GroupId, PanelSystemState } from "./types";
import { closeLeaf, collectGroupsInOrder } from "./tree/logic";

/**
 * Remove empty groups (tabs.length === 0) by collapsing corresponding leaves.
 * Keeps at least one group in the system.
 * Returns the same reference if no changes are necessary to help callers short-circuit updates.
 */
export const cleanupEmptyGroups = (state: PanelSystemState): PanelSystemState => {
  const allGroupIds = Object.keys(state.groups);
  const emptyIds = allGroupIds.filter((gid) => state.groups[gid]!.tabIds.length === 0);
  if (emptyIds.length === 0) {
    return state;
  }

  const removeIfEmpty = (acc: PanelSystemState, gid: GroupId): PanelSystemState => {
    const group = acc.groups[gid];
    if (!group || group.tabs.length > 0) {
      return acc;
    }
    const groupCount = Object.keys(acc.groups).length;
    if (groupCount <= 1) {
      return acc;
    }
    const { tree, survivorGroupId } = closeLeaf(acc.tree, gid);
    const { [gid]: _removed, ...restGroups } = acc.groups; void _removed;
    const groupOrder = collectGroupsInOrder(tree);
    const focusedGroupId = acc.focusedGroupId === gid ? (survivorGroupId ?? groupOrder[0] ?? null) : acc.focusedGroupId;
    return { ...acc, tree, groups: restGroups, groupOrder, focusedGroupId };
  };

  return state.groupOrder.reduce<PanelSystemState>((acc, gid) => removeIfEmpty(acc, gid as GroupId), state);
};
