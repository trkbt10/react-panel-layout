/**
 * @file Hooks that expose commands and commit handlers for the panel system.
 */
import * as React from "react";
import type { DropZone, PanelCommands } from "../state/types";
import { usePanelState } from "../state/StateContext";

export const usePanelCommands = (): PanelCommands => {
  const { actions } = usePanelState();
  return React.useMemo<PanelCommands>(
    () => ({
      splitFocused: (direction) => {
        actions.splitFocused(direction);
      },
      focusGroupIndex: (n) => {
        actions.focusGroupIndex(n);
      },
      focusNextGroup: () => {
        actions.focusNextGroup();
      },
      focusPrevGroup: () => {
        actions.focusPrevGroup();
      },
      closeFocusedGroup: () => {
        // intentionally no-op for now
      },
    }),
    [actions],
  );
};

export const useCommitHandlers = (): {
  onCommitContentDrop: (payload: { fromGroupId: string; tabId: string; targetGroupId: string; zone: DropZone }) => void;
  onCommitTabDrop: (payload: { fromGroupId: string; tabId: string; targetGroupId: string; targetIndex: number }) => void;
} => {
  const { actions } = usePanelState();

  const onCommitContentDrop = React.useCallback(
    ({ fromGroupId, tabId, targetGroupId, zone }: { fromGroupId: string; tabId: string; targetGroupId: string; zone: DropZone }) => {
      actions.contentDrop({ fromGroupId, tabId, targetGroupId, zone });
    },
    [actions],
  );

  const onCommitTabDrop = React.useCallback(
    ({ fromGroupId, tabId, targetGroupId, targetIndex }: { fromGroupId: string; tabId: string; targetGroupId: string; targetIndex: number }) => {
      actions.tabDrop({ fromGroupId, tabId, targetGroupId, targetIndex });
    },
    [actions],
  );

  return { onCommitContentDrop, onCommitTabDrop };
};
