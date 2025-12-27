/**
 * @file Panels entry point - VSCode-like panel system
 * @packageDocumentation
 *
 * This is a subpath export entry point for `react-panel-layout/panels`.
 *
 * ## Overview
 * Panels provides a VSCode-like panel system with tabbed groups, drag-and-drop
 * tab reordering, split views, and keyboard navigation. Supports both controlled
 * and uncontrolled state management.
 *
 * ## Installation
 * ```ts
 * import { PanelSystem, buildInitialState, usePanelSystem } from "react-panel-layout/panels";
 * ```
 *
 * ## Basic Usage
 * ```tsx
 * const tabs = [
 *   { id: 'file1', title: 'index.ts', render: () => <Editor file="index.ts" /> },
 *   { id: 'file2', title: 'app.tsx', render: () => <Editor file="app.tsx" /> },
 * ];
 *
 * function App() {
 *   const initialState = buildInitialState(tabs);
 *   let groupCounter = 1;
 *
 *   return (
 *     <PanelSystem
 *       initialState={initialState}
 *       createGroupId={() => `g_${++groupCounter}`}
 *       layoutMode="grid"
 *       gridTracksInteractive={true}
 *       dragThresholdPx={5}
 *     />
 *   );
 * }
 * ```
 *
 * ## Controlled State
 * ```tsx
 * const [state, setState] = useState(() => buildInitialState(tabs));
 *
 * <PanelSystem
 *   initialState={state}
 *   state={state}
 *   onStateChange={setState}
 *   // ...
 * />
 * ```
 *
 * ## Using Context
 * ```tsx
 * function TabActions() {
 *   const { actions } = usePanelSystem();
 *   return <button onClick={() => actions.splitFocused('vertical')}>Split</button>;
 * }
 * ```
 */

// Components
export { PanelSystem } from "../modules/panels/system/PanelSystem.js";
export { PanelGroupView } from "../components/panels/PanelGroupView.js";
export { DropSuggestOverlay } from "../components/panels/DropSuggestOverlay.js";

// Context
export {
  PanelSystemProvider,
  usePanelSystem,
} from "../modules/panels/state/PanelSystemContext.js";

// State operations
export {
  collectGroupsInOrder,
  splitLeaf,
  closeLeaf,
  isGroup,
  setSplitRatio,
  createEmptyGroup,
  addTabToGroup,
  removeTabFromGroup,
  moveTab,
  setActiveTab,
  reorderTabWithinGroup,
  addTabToGroupAtIndex,
  setFocusedGroup,
  focusGroupIndex,
  nextGroup,
  prevGroup,
  refreshGroupOrder,
  splitGroup,
  buildInitialState,
} from "../modules/panels/index.js";

// Types
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
  PanelSplitLimits,
  IdFactory,
} from "../modules/panels/index.js";

export type {
  PanelSystemContextValue,
  PanelSystemProviderProps,
  PanelStateAction,
  PanelStateActions,
} from "../modules/panels/state/PanelSystemContext.js";

export type { PanelGroupViewProps } from "../components/panels/PanelGroupView.js";
