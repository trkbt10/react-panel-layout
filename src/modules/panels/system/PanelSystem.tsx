/**
 * @file VSCode-like PanelSystem composed via module contexts and presentational components.
 */
import * as React from "react";
import type { DropZone, GroupId, PanelSystemProps, PanelSystemState } from "../state/types";
import { KeybindingsProvider } from "../../keybindings/KeybindingsProvider";
import { buildGridForAbsolutePanels, buildGridFromRects } from "../layout/adapter";
import { GridLayout } from "../../../components/grid/GridLayout";
import { GroupContainer } from "../rendering/GroupContainer";
import { InteractionsProvider, usePanelInteractions } from "../interactions/InteractionsContext";
import { DropSuggestOverlay } from "../../../components/panels/DropSuggestOverlay";
import { TabDragOverlay } from "../../../components/tabs/TabDragOverlay";
import { PanelStateProvider, usePanelState } from "../state/StateContext";
import { DefaultKeybindingsInstaller } from "../keybindings/KeybindingsInstaller";
import { useCommitHandlers } from "../state/commands";
import { RenderBridge } from "../rendering/RenderBridge";
import { DomRegistryProvider } from "../dom/DomRegistry";
import { PanelSplitHandles } from "../state/PanelSplitHandles";
import { canSplitDirection, normalizeSplitLimits, type NormalizedSplitLimits } from "../state/splitLimits";

const rootStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  width: "100%",
  height: "100%",
};

type PanelSystemContentProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  layoutMode: PanelSystemProps["layoutMode"];
  gridTracksInteractive?: boolean;
  dragThresholdPx: number;
  view?: PanelSystemProps["view"];
  style?: React.CSSProperties;
  className?: string;
  tabBarComponent?: PanelSystemProps["tabBarComponent"];
  panelGroupComponent?: PanelSystemProps["panelGroupComponent"];
  splitLimits: NormalizedSplitLimits;
  emptyContentComponent?: PanelSystemProps["emptyContentComponent"];
  doubleClickToAdd?: boolean;
};

const GridLayoutRenderer = ({
  state,
  layoutMode,
  gridTracksInteractive,
  view,
  tabBarComponent,
  panelGroupComponent,
}: {
  state: PanelSystemState;
  layoutMode: PanelSystemProps["layoutMode"];
  gridTracksInteractive: PanelSystemProps["gridTracksInteractive"];
  view: PanelSystemProps["view"];
  tabBarComponent: PanelSystemProps["tabBarComponent"];
  panelGroupComponent: PanelSystemProps["panelGroupComponent"];
}): React.ReactNode => {
  const renderGroup = (gid: GroupId): React.ReactNode => {
    if (view) {
      const ViewComponent = view;
      return <ViewComponent groupId={gid} />;
    }
    return <GroupContainer id={gid} TabBarComponent={tabBarComponent} PanelGroupComponent={panelGroupComponent} />;
  };
  if (layoutMode === "grid") {
    const grid = buildGridFromRects(state, renderGroup, Boolean(gridTracksInteractive));
    return <GridLayout config={grid.config} layers={grid.layers} />;
  }
  const grid = buildGridForAbsolutePanels(state, renderGroup);
  return <GridLayout config={grid.config} layers={grid.layers} />;
};

const PanelSystemContent: React.FC<PanelSystemContentProps> = ({
  containerRef,
  layoutMode,
  gridTracksInteractive,
  dragThresholdPx,
  view,
  style,
  className,
  tabBarComponent,
  panelGroupComponent,
  splitLimits,
  emptyContentComponent,
  doubleClickToAdd,
}) => {
  const { state } = usePanelState();
  const { onCommitContentDrop, onCommitTabDrop } = useCommitHandlers();

  const containerStyle = React.useMemo(() => ({ ...rootStyle, ...style }), [style]);

  const isZoneAllowed = React.useCallback(
    ({ targetGroupId, zone }: { targetGroupId: GroupId; zone: DropZone }): boolean => {
      if (zone === "center") {
        return true;
      }
      const direction = zone === "left" || zone === "right" ? "vertical" : "horizontal";
      return canSplitDirection(state.tree, targetGroupId, direction, splitLimits);
    },
    [state.tree, splitLimits],
  );

  return (
    <DomRegistryProvider>
      <InteractionsProvider
        containerRef={containerRef}
        dragThresholdPx={dragThresholdPx}
        onCommitContentDrop={onCommitContentDrop}
        onCommitTabDrop={onCommitTabDrop}
        isContentZoneAllowed={isZoneAllowed}
      >
        <RenderBridge emptyContentComponent={emptyContentComponent} doubleClickToAdd={doubleClickToAdd}>
          <div ref={containerRef} className={className} style={containerStyle}>
            <GridLayoutRenderer
              state={state}
              layoutMode={layoutMode}
              gridTracksInteractive={gridTracksInteractive}
              view={view}
              tabBarComponent={tabBarComponent}
              panelGroupComponent={panelGroupComponent}
            />
          </div>
        </RenderBridge>
        <PanelSplitHandles containerRef={containerRef} />
        <OverlayWithinProvider />
      </InteractionsProvider>
    </DomRegistryProvider>
  );
};

const OverlayWithinProvider: React.FC = () => {
  const interactions = usePanelInteractions();
  return (
    <>
      <DropSuggestOverlay suggest={interactions.suggest} />
      <TabDragOverlay />
    </>
  );
};

export const PanelSystem: React.FC<PanelSystemProps> = ({
  initialState,
  createGroupId,
  createPanelId,
  layoutMode,
  gridTracksInteractive,
  dragThresholdPx,
  view,
  emptyContentComponent,
  state: controlled,
  onStateChange,
  className,
  style,
  tabBarComponent,
  panelGroupComponent,
  splitLimits,
  doubleClickToAdd,
}) => {
  if (!initialState) {
    throw new Error("PanelSystem requires initialState.");
  }
  if (!createGroupId) {
    throw new Error("PanelSystem requires explicit createGroupId function.");
  }
  if (!layoutMode) {
    throw new Error("PanelSystem requires explicit layoutMode ('absolute' | 'grid').");
  }
  if (layoutMode === "grid" && gridTracksInteractive === undefined) {
    throw new Error("PanelSystem(layoutMode='grid') requires explicit 'gridTracksInteractive' flag.");
  }
  if (dragThresholdPx === undefined) {
    throw new Error("PanelSystem requires explicit 'dragThresholdPx' value.");
  }

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const normalizedSplitLimits = React.useMemo(() => normalizeSplitLimits(splitLimits), [splitLimits]);

  return (
    <PanelStateProvider
      initialState={initialState}
      createGroupId={createGroupId}
      createPanelId={createPanelId}
      state={controlled}
      onStateChange={onStateChange}
      splitLimits={splitLimits}
    >
      <KeybindingsProvider>
        <DefaultKeybindingsInstaller />
        <PanelSystemContent
          containerRef={containerRef}
          layoutMode={layoutMode}
          gridTracksInteractive={gridTracksInteractive}
          dragThresholdPx={dragThresholdPx}
          view={view}
          style={style}
          className={className}
          tabBarComponent={tabBarComponent}
          panelGroupComponent={panelGroupComponent}
          splitLimits={normalizedSplitLimits}
          emptyContentComponent={emptyContentComponent}
          doubleClickToAdd={doubleClickToAdd}
        />
      </KeybindingsProvider>
    </PanelStateProvider>
  );
};
