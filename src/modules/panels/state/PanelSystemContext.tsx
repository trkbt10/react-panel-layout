/**
 * @file Root PanelSystemContext that combines subdomain contexts (groups, tree, focus).
 * Provides unified state and dispatch while exposing domain-specific actions via subcontexts.
 */
import * as React from "react";
import type { DropZone, GroupId, PanelId, PanelSystemState, SplitDirection } from "./types";
import { cleanupEmptyGroups } from "./cleanup";
import { moveTab, setActiveTab } from "./groups/logic";
import { setFocusedGroup, focusGroupIndex as focusIdx, nextGroup, prevGroup } from "./focus/logic";
import { splitGroup } from "../index";
import { getAtPath, isGroup, setSplitRatio, type NodePath } from "./tree/logic";
import { bindActionCreators, createAction, createActionHandlerMap, type BoundActionCreators } from "../../../utils/typedActions";
import { GroupsProvider, type GroupsActions } from "./groups/Context";
import { TreeProvider, type TreeActions } from "./tree/Context";
import { FocusProvider, type FocusActions } from "./focus/Context";

type ReducerExtra = {
  createGroupId: () => GroupId;
};

const actions = {
  splitFocused: createAction("panelState/splitFocused", (direction: SplitDirection) => ({ direction })),
  focusGroupIndex: createAction("panelState/focusGroupIndex", (index1Based: number) => ({ index1Based })),
  focusNextGroup: createAction("panelState/focusNextGroup"),
  focusPrevGroup: createAction("panelState/focusPrevGroup"),
  setActiveTab: createAction("panelState/setActiveTab", (groupId: GroupId, tabId: PanelId) => ({ groupId, tabId })),
  contentDrop: createAction(
    "panelState/contentDrop",
    (payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; zone: DropZone }) => payload,
  ),
  tabDrop: createAction(
    "panelState/tabDrop",
    (payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; targetIndex: number }) => payload,
  ),
  adjustSplitRatio: createAction("panelState/adjustSplitRatio", (payload: { path: NodePath; deltaRatio: number }) => payload),
} as const;

type PanelStateAction = ReturnType<(typeof actions)[keyof typeof actions]>;
type PanelStateActions = BoundActionCreators<typeof actions>;

const handleContentDrop = (
  state: PanelSystemState,
  payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; zone: DropZone },
  extra: ReducerExtra,
): PanelSystemState => {
  const fromGroup = state.groups[payload.fromGroupId];
  const targetGroup = state.groups[payload.targetGroupId];
  if (!fromGroup || !targetGroup) {
    return state;
  }
  const tab = fromGroup.tabs.find((t) => t.id === payload.tabId);
  if (!tab) {
    return state;
  }
  if (payload.zone === "center" && payload.fromGroupId === payload.targetGroupId) {
    return setActiveTab(state, payload.fromGroupId, payload.tabId);
  }
  if (payload.zone === "center") {
    const moved = moveTab(state, payload.fromGroupId, payload.targetGroupId, payload.tabId, true);
    return setFocusedGroup(moved, payload.targetGroupId);
  }
  const direction: SplitDirection = payload.zone === "left" || payload.zone === "right" ? "vertical" : "horizontal";
  const newGroupId = extra.createGroupId();
  const afterSplit = splitGroup(state, payload.targetGroupId, direction, () => newGroupId);
  const destination = payload.zone === "left" || payload.zone === "top" ? payload.targetGroupId : newGroupId;
  const withTab = moveTab(afterSplit, payload.fromGroupId, destination, payload.tabId, true);
  return setFocusedGroup(withTab, destination);
};

const handleTabDrop = (
  state: PanelSystemState,
  payload: { fromGroupId: GroupId; tabId: PanelId; targetGroupId: GroupId; targetIndex: number },
): PanelSystemState => {
  const fromGroup = state.groups[payload.fromGroupId];
  const targetGroup = state.groups[payload.targetGroupId];
  if (!fromGroup || !targetGroup) {
    return state;
  }
  const tab = state.panels[payload.tabId];
  if (!tab) {
    return state;
  }
  if (payload.fromGroupId === payload.targetGroupId) {
    const filteredIds = fromGroup.tabIds.filter((id) => id !== payload.tabId);
    const insertIndex = Math.max(0, Math.min(payload.targetIndex, filteredIds.length));
    const nextTabIds = filteredIds.slice(0, insertIndex).concat([payload.tabId], filteredIds.slice(insertIndex));
    const nextTabs = nextTabIds.map((id) => state.panels[id]).filter(Boolean);
    const groups = { ...state.groups, [payload.fromGroupId]: { ...fromGroup, tabIds: nextTabIds, tabs: nextTabs } };
    return { ...state, groups };
  }
  const groups = { ...state.groups };
  const sourceIds = fromGroup.tabIds.filter((id) => id !== payload.tabId);
  const sourceTabs = sourceIds.map((id) => state.panels[id]);
  groups[payload.fromGroupId] = {
    ...fromGroup,
    tabIds: sourceIds,
    tabs: sourceTabs,
    activeTabId: fromGroup.activeTabId === payload.tabId ? sourceTabs[0]?.id ?? null : fromGroup.activeTabId,
  };
  const targetIdsBase = targetGroup.tabIds.filter((id) => id !== payload.tabId);
  const bounded = Math.max(0, Math.min(payload.targetIndex, targetIdsBase.length));
  const nextTargetIds = targetIdsBase.slice(0, bounded).concat([payload.tabId], targetIdsBase.slice(bounded));
  const targetTabs = nextTargetIds.map((id) => state.panels[id]).filter(Boolean);
  groups[payload.targetGroupId] = { ...targetGroup, tabIds: nextTargetIds, tabs: targetTabs, activeTabId: payload.tabId };
  return { ...state, groups, focusedGroupId: payload.targetGroupId };
};

const handlers = createActionHandlerMap<PanelSystemState, typeof actions, ReducerExtra>(actions, {
  splitFocused: (state, action, extra) => {
    const gid = state.focusedGroupId ?? state.groupOrder[0] ?? null;
    if (!gid) {
      return state;
    }
    return splitGroup(state, gid, action.payload.direction, extra.createGroupId);
  },
  focusGroupIndex: (state, action) => focusIdx(state, action.payload.index1Based),
  focusNextGroup: (state) => nextGroup(state),
  focusPrevGroup: (state) => prevGroup(state),
  setActiveTab: (state, action) => setActiveTab(state, action.payload.groupId, action.payload.tabId),
  contentDrop: (state, action, extra) => handleContentDrop(state, action.payload, extra),
  tabDrop: (state, action) => handleTabDrop(state, action.payload),
  adjustSplitRatio: (state, action) => {
    const node = getAtPath(state.tree, action.payload.path);
    if (isGroup(node)) {
      return state;
    }
    const nextTree = setSplitRatio(state.tree, action.payload.path, node.ratio + action.payload.deltaRatio);
    return { ...state, tree: nextTree };
  },
});

const reducePanelState = (state: PanelSystemState, action: PanelStateAction, extra: ReducerExtra): PanelSystemState => {
  const handler = handlers[action.type];
  if (!handler) {
    return state;
  }
  const next = handler(state, action, extra);
  return cleanupEmptyGroups(next);
};

export type PanelSystemContextValue = {
  state: PanelSystemState;
  dispatch: (action: PanelStateAction) => void;
  actions: PanelStateActions;
};

const PanelSystemContext = React.createContext<PanelSystemContextValue | null>(null);

export const usePanelSystem = (): PanelSystemContextValue => {
  const ctx = React.useContext(PanelSystemContext);
  if (!ctx) {
    throw new Error("usePanelSystem must be used within PanelSystemProvider");
  }
  return ctx;
};

export type PanelSystemProviderProps = React.PropsWithChildren<{
  initialState: PanelSystemState;
  createGroupId: () => GroupId;
  state?: PanelSystemState;
  onStateChange?: (next: PanelSystemState) => void;
}>;

export const PanelSystemProvider: React.FC<PanelSystemProviderProps> = ({ initialState, createGroupId, state: controlled, onStateChange, children }) => {
  const initialSanitized = React.useMemo(() => cleanupEmptyGroups(initialState), [initialState]);
  const extraRef = React.useRef<ReducerExtra>({ createGroupId });
  extraRef.current.createGroupId = createGroupId;
  const [uncontrolled, baseDispatch] = React.useReducer(
    (prev: PanelSystemState, action: PanelStateAction) => reducePanelState(prev, action, extraRef.current),
    initialSanitized,
  );
  const derivedState = React.useMemo(
    () => (controlled ? cleanupEmptyGroups(controlled) : uncontrolled),
    [controlled, uncontrolled],
  );
  const stateRef = React.useRef<PanelSystemState>(derivedState);
  stateRef.current = derivedState;
  const isControlled = controlled !== undefined;

  const dispatch = React.useCallback(
    (action: PanelStateAction) => {
      if (isControlled) {
        const next = reducePanelState(stateRef.current, action, extraRef.current);
        onStateChange?.(next);
        return;
      }
      baseDispatch(action);
    },
    [isControlled, onStateChange, baseDispatch],
  );

  const boundActions = React.useMemo<PanelStateActions>(() => bindActionCreators(actions, dispatch), [dispatch]);

  const groupsActions = React.useMemo<GroupsActions>(
    () => ({
      setActiveTab: boundActions.setActiveTab,
      tabDrop: boundActions.tabDrop,
    }),
    [boundActions],
  );

  const treeActions = React.useMemo<TreeActions>(
    () => ({
      adjustSplitRatio: boundActions.adjustSplitRatio,
    }),
    [boundActions],
  );

  const focusActions = React.useMemo<FocusActions>(
    () => ({
      focusGroupIndex: boundActions.focusGroupIndex,
      focusNextGroup: boundActions.focusNextGroup,
      focusPrevGroup: boundActions.focusPrevGroup,
    }),
    [boundActions],
  );

  const value = React.useMemo<PanelSystemContextValue>(
    () => ({
      state: derivedState,
      dispatch,
      actions: boundActions,
    }),
    [derivedState, dispatch, boundActions],
  );

  return (
    <PanelSystemContext.Provider value={value}>
      <GroupsProvider value={groupsActions}>
        <TreeProvider value={treeActions}>
          <FocusProvider value={focusActions}>{children}</FocusProvider>
        </TreeProvider>
      </GroupsProvider>
    </PanelSystemContext.Provider>
  );
};

export type { PanelStateAction, PanelStateActions };
