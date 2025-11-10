/**
 * @file Floating drag preview and insertion guide for tab dragging.
 */
import * as React from "react";
import styles from "./TabDragOverlay.module.css";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";
import { usePanelState } from "../../modules/panels/context/StateContext";

export const TabDragOverlay: React.FC = () => {
  const { isTabDragging, draggingTabId, dragPointer, tabbarHover } = usePanelInteractions();
  const { state } = usePanelState();

  // Do not early-return before hooks; compute values unconditionally
  const title = React.useMemo((): string | null => {
    if (!draggingTabId) {
      return null;
    }
    for (const gid of Object.keys(state.groups)) {
      const g = state.groups[gid]!;
      const t = g.tabs.find((tt) => tt.id === draggingTabId);
      if (t) {
        return t.title;
      }
    }
    return null;
  }, [draggingTabId, state.groups]);

  const hasPreview = dragPointer !== null && title !== null;

  const previewStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!hasPreview) {
      return undefined;
    }
    return { left: dragPointer!.x, top: dragPointer!.y };
  }, [hasPreview, dragPointer]);

  const guideStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!tabbarHover) {
      return undefined;
    }
    return { left: tabbarHover.insertX, top: tabbarHover.rect.top + 4, height: Math.max(0, tabbarHover.rect.height - 8) };
  }, [tabbarHover]);

  const renderPreview = (): React.ReactNode => {
    if (!hasPreview) {
      return null;
    }
    return (
      <div className={styles.preview} style={previewStyle}>
        {title}
      </div>
    );
  };

  const renderGuide = (): React.ReactNode => {
    if (!tabbarHover) {
      return null;
    }
    return <div className={styles.insertGuide} style={guideStyle} />;
  };

  if (!isTabDragging) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      {renderPreview()}
      {renderGuide()}
    </div>
  );
};
