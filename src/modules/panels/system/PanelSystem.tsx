/**
 * @file VSCode-like PanelSystem composed via module contexts and presentational components.
 */
import * as React from "react";
import styles from "../../../components/panels/PanelSystem.module.css";
import type { GroupId, PanelSystemProps } from "../state/types";
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

export const PanelSystem: React.FC<PanelSystemProps> = ({
  initialState,
  createGroupId,
  layoutMode,
  gridTracksInteractive,
  dragThresholdPx,
  view,
  state: controlled,
  onStateChange,
  className,
  style,
  tabBarComponent,
  panelGroupComponent,
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

  const Content: React.FC = () => {
    const { state } = usePanelState();
    const { onCommitContentDrop, onCommitTabDrop } = useCommitHandlers();

    const onRenderGroup = React.useCallback(
      (gid: GroupId): React.ReactNode => {
        if (view) {
          const View = view;
          return <View groupId={gid} />;
        }
        return <GroupContainer id={gid} TabBarComponent={tabBarComponent} PanelGroupComponent={panelGroupComponent} />;
      },
      [view, tabBarComponent, panelGroupComponent],
    );

    const grid = React.useMemo(() => {
      if (layoutMode === "grid") {
        return buildGridFromRects(state, onRenderGroup, Boolean(gridTracksInteractive));
      }
      return buildGridForAbsolutePanels(state, onRenderGroup);
    }, [layoutMode, gridTracksInteractive, state, onRenderGroup]);

    return (
      <DomRegistryProvider>
        <InteractionsProvider
          containerRef={containerRef}
          dragThresholdPx={dragThresholdPx}
          onCommitContentDrop={onCommitContentDrop}
          onCommitTabDrop={onCommitTabDrop}
        >
          <RenderBridge>
            <div ref={containerRef} className={className ? `${styles.root} ${className}` : styles.root} style={style}>
              <GridLayout config={grid.config} layers={grid.layers} />
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

  return (
    <PanelStateProvider initialState={initialState} createGroupId={createGroupId} state={controlled} onStateChange={onStateChange}>
      <KeybindingsProvider>
        <DefaultKeybindingsInstaller />
        <Content />
      </KeybindingsProvider>
    </PanelStateProvider>
  );
};
