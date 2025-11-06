/**
 * @file Focus and navigation helpers for panel-system.
 */
import type { GroupId, PanelSystemState } from "./types";
import { collectGroupsInOrder } from "./tree";

export const setFocusedGroup = (state: PanelSystemState, groupId: GroupId): PanelSystemState => {
  if (!state.groups[groupId]) {
    throw new Error(`setFocusedGroup: group ${groupId} not found.`);
  }
  return { ...state, focusedGroupId: groupId };
};

export const focusGroupIndex = (state: PanelSystemState, index1Based: number): PanelSystemState => {
  const idx = index1Based - 1;
  const id = state.groupOrder[idx];
  if (!id) {
    return state;
  }
  return setFocusedGroup(state, id);
};

export const nextGroup = (state: PanelSystemState): PanelSystemState => {
  const order = state.groupOrder;
  const current = state.focusedGroupId;
  if (!current) {
    const first = order[0];
    if (!first) {
      return state;
    }
    return setFocusedGroup(state, first);
  }
  const idx = order.indexOf(current);
  const next = order[(idx + 1) % order.length];
  return setFocusedGroup(state, next);
};

export const prevGroup = (state: PanelSystemState): PanelSystemState => {
  const order = state.groupOrder;
  const current = state.focusedGroupId;
  if (!current) {
    const last = order[order.length - 1];
    if (!last) {
      return state;
    }
    return setFocusedGroup(state, last);
  }
  const idx = order.indexOf(current);
  const prev = order[(idx - 1 + order.length) % order.length];
  return setFocusedGroup(state, prev);
};

export const refreshGroupOrder = (state: PanelSystemState): PanelSystemState => {
  const groupOrder = collectGroupsInOrder(state.tree);
  return { ...state, groupOrder };
};

