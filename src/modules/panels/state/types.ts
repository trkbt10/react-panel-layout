/**
 * @file Types for VSCode-like panel system (tabs, groups, splits).
 */
import * as React from "react";

export type PanelId = string;
export type GroupId = string;

export type SplitDirection = "vertical" | "horizontal";

type RowsColsSplitLimits = {
  /**
   * Maximum number of rows (horizontal panes stacked vertically). Mirrors the HTML `rows` attribute.
   * Value of 1 disables horizontal splits.
   */
  rows?: number;
  /**
   * Maximum number of columns (vertical panes stacked horizontally). Mirrors the HTML `cols` attribute.
   * Value of 1 disables vertical splits.
   */
  cols?: number;
};

type LegacySplitLimits = {
  /**
   * @deprecated Use `rows` instead.
   */
  maxHorizontal?: number;
  /**
   * @deprecated Use `cols` instead.
   */
  maxVertical?: number;
};

/**
 * Controls how many times panes may be split. Accepts a single number (applied to both rows/cols)
 * or an object that mirrors HTML's `rows`/`cols` attributes for clarity.
 */
export type PanelSplitLimits = number | RowsColsSplitLimits | LegacySplitLimits;

export type TabDefinition = {
  id: PanelId;
  title: string;
  /** Render function receives panel id to enable proper keying */
  render: (id: PanelId) => React.ReactNode;
};

export type GroupModel = {
  id: GroupId;
  /** Ordered panel ids belonging to this group */
  tabIds: PanelId[];
  /** Deprecated: view adapter may synthesize from registry; kept for backward-compat */
  tabs: TabDefinition[];
  activeTabId: PanelId | null;
};

export type SplitNode =
  | { type: "group"; groupId: GroupId }
  | { type: "split"; direction: SplitDirection; ratio: number; a: SplitNode; b: SplitNode };

export type PanelTree = SplitNode;

export type PanelSystemState = {
  tree: PanelTree;
  /** Single source registry of panels (id -> definition) */
  panels: Record<PanelId, TabDefinition>;
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

// Public render props for pluggable UI components
export type TabBarRenderProps = {
  group: GroupModel;
  onClickTab: (tabId: string) => void;
  onStartDrag?: (tabId: string, groupId: string, e: React.PointerEvent) => void;
  rootRef?: React.Ref<HTMLDivElement>;
  /** Optional: request to add a tab to this group (UI triggers only; state lives in context) */
  onAddTab?: (groupId: GroupId) => void;
  /** Optional: request to close a tab (UI triggers only; state lives in context) */
  onCloseTab?: (groupId: GroupId, tabId: PanelId) => void;
  /** Enable double-click on empty tabbar area to add a new tab (default: false) */
  doubleClickToAdd?: boolean;
};

export type PanelGroupRenderProps = {
  group: GroupModel;
  tabbar: React.ReactNode;
  content: React.ReactNode;
  onContentPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  groupRef?: React.Ref<HTMLDivElement>;
  contentRef?: React.Ref<HTMLDivElement>;
};

export type PanelSystemProps = {
  /** Initial tree and groups. Component is uncontrolled by default. */
  initialState: PanelSystemState;
  /** Explicit group id factory. Required by no-magic policy. */
  createGroupId: () => GroupId;
  /** Explicit panel id factory for newly-created tabs. Required by no-magic policy when adding tabs via UI. */
  createPanelId?: () => PanelId;
  /** Adapter layout mode: explicit selection required by no-magic policy. */
  layoutMode: "absolute" | "grid";
  /** When layoutMode==='grid', whether grid track resize is interactive (single source if false). */
  gridTracksInteractive?: boolean;
  /** Drag activation threshold in px (explicit, no-magic). */
  dragThresholdPx: number;
  /** View component for a group (no operation injection at PanelSystem layer). */
  view?: React.ComponentType<{ groupId: GroupId }>;
  /** Optional component for empty content in a group (when no active tab). */
  emptyContentComponent?: React.ComponentType;
  /** Optional controlled state */
  state?: PanelSystemState;
  onStateChange?: (next: PanelSystemState) => void;
  /** ClassName/style passthrough */
  className?: string;
  style?: React.CSSProperties;
  /** Pluggable UI components */
  tabBarComponent?: React.ComponentType<TabBarRenderProps>;
  panelGroupComponent?: React.ComponentType<PanelGroupRenderProps>;
  /** Optional limits controlling split directions. */
  splitLimits?: PanelSplitLimits;
  /** Enable double-click on empty tabbar area to add a new tab (default: false) */
  doubleClickToAdd?: boolean;
};
