/**
 * @file Types for VSCode-like panel system (tabs, groups, splits).
 */
import * as React from "react";

export type PanelId = string;
export type GroupId = string;

export type SplitDirection = "vertical" | "horizontal";

export type TabDefinition = {
  id: PanelId;
  title: string;
  /** Render function to avoid remount on move */
  render: () => React.ReactNode;
};

export type GroupModel = {
  id: GroupId;
  tabs: TabDefinition[];
  activeTabId: PanelId | null;
};

export type SplitNode =
  | { type: "group"; groupId: GroupId }
  | { type: "split"; direction: SplitDirection; ratio: number; a: SplitNode; b: SplitNode };

export type PanelTree = SplitNode;

export type PanelSystemState = {
  tree: PanelTree;
  groups: Record<GroupId, GroupModel>;
  /** Keeps stable order for focusing groups with Cmd+1..9 */
  groupOrder: GroupId[];
  /** Currently focused group */
  focusedGroupId: GroupId | null;
};

export type DropZone = "center" | "left" | "right" | "top" | "bottom";

export type DraggingTab = {
  tabId: PanelId;
  fromGroupId: GroupId;
};

export type PanelCommands = {
  splitFocused: (direction: SplitDirection) => void;
  focusGroupIndex: (index1Based: number) => void;
  focusNextGroup: () => void;
  focusPrevGroup: () => void;
  closeFocusedGroup: () => void;
};

export type PanelSystemProps = {
  /** Initial tree and groups. Component is uncontrolled by default. */
  initialState: PanelSystemState;
  /** Explicit group id factory. Required by no-magic policy. */
  createGroupId: () => GroupId;
  /** Adapter layout mode: explicit selection required by no-magic policy. */
  layoutMode: "absolute" | "grid";
  /** When layoutMode==='grid', whether grid track resize is interactive (single source if false). */
  gridTracksInteractive?: boolean;
  /** Drag activation threshold in px (explicit, no-magic). */
  dragThresholdPx: number;
  /** Optional controlled state */
  state?: PanelSystemState;
  onStateChange?: (next: PanelSystemState) => void;
  /** ClassName/style passthrough */
  className?: string;
  style?: React.CSSProperties;
};

