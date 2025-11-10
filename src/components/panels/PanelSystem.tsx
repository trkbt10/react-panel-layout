/**
 * @file VSCode-like PanelSystem component (tabs + splits + drag/drop + keybindings)
 */
import * as React from "react";
import styles from "./PanelSystem.module.css";
import type { GroupId, PanelSystemProps } from "../../modules/panels/state/types";
import { KeybindingsProvider } from "../../modules/keybindings/KeybindingsProvider";
import { buildGridForAbsolutePanels, buildGridFromRects } from "../../modules/panels/layout/adapter";
import { GridLayout } from "../grid/GridLayout";
import { GroupContainer } from "./GroupContainer";
import { InteractionsProvider, usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";
import { DropSuggestOverlay } from "./DropSuggestOverlay";
import { TabDragOverlay } from "../tabs/TabDragOverlay";
import { PanelStateProvider, usePanelState } from "../../modules/panels/state/StateContext";
import { DefaultKeybindingsInstaller } from "../../modules/panels/keybindings/KeybindingsInstaller";
import { useCommitHandlers } from "../../modules/panels/commands/commands";
import { RenderBridge } from "../../modules/panels/rendering/RenderBridge";
import { DomRegistryProvider } from "../../modules/panels/dom/DomRegistry";
import { PanelSplitHandles } from "./PanelSplitHandles";
import { PanelThemeProvider } from "../../modules/theme/tokens";

export const PanelSystem: React.FC<PanelSystemProps> = ({ initialState, createGroupId, layoutMode, gridTracksInteractive, dragThresholdPx, view, state: controlled, onStateChange, className, style, themeTokens, tabBarComponent, panelGroupComponent }) => {
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

  const onRenderGroup = React.useCallback((gid: GroupId): React.ReactNode => {
      if (view) {
        const View = view;
        return <View groupId={gid} />;
      }
      return <GroupContainer id={gid} TabBarComponent={tabBarComponent} PanelGroupComponent={panelGroupComponent} />;
    }, [view, tabBarComponent, panelGroupComponent]);
    const grid = React.useMemo(() => {
      if (layoutMode === "grid") {
        return buildGridFromRects(state, onRenderGroup, Boolean(gridTracksInteractive));
      }
      return buildGridForAbsolutePanels(state, onRenderGroup);
    }, [layoutMode, gridTracksInteractive, state, onRenderGroup]);

    return (
      <PanelThemeProvider tokens={themeTokens}>
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
      </PanelThemeProvider>
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

export { buildInitialState } from "../../modules/panels";
