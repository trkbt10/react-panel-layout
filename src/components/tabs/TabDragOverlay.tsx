/**
 * @file Floating drag preview and insertion guide for tab dragging.
 */
import * as React from "react";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";
import { usePanelState } from "../../modules/panels/state/StateContext";
import {
  TAB_DRAG_OVERLAY_Z_INDEX,
  TAB_DRAG_PREVIEW_OFFSET_X,
  TAB_DRAG_PREVIEW_OFFSET_Y,
  TAB_DRAG_PREVIEW_BORDER_RADIUS,
  TAB_DRAG_PREVIEW_PADDING_Y,
  TAB_DRAG_PREVIEW_PADDING_X,
  TAB_DRAG_PREVIEW_FONT_SIZE,
  TAB_DRAG_INSERT_GUIDE_WIDTH,
  TAB_DRAG_INSERT_GUIDE_BORDER_RADIUS,
  TAB_DRAG_PREVIEW_BG_COLOR,
  TAB_DRAG_PREVIEW_FG_COLOR,
  TAB_DRAG_PREVIEW_BORDER_COLOR,
  TAB_DRAG_PREVIEW_SHADOW,
  TAB_DRAG_INSERT_GUIDE_COLOR,
  TAB_DRAG_INSERT_GUIDE_SHADOW,
} from "../../constants/styles";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: TAB_DRAG_OVERLAY_Z_INDEX,
};

const previewBaseStyle: React.CSSProperties = {
  position: "absolute",
  transform: `translate(${TAB_DRAG_PREVIEW_OFFSET_X}, ${TAB_DRAG_PREVIEW_OFFSET_Y})`,
  background: TAB_DRAG_PREVIEW_BG_COLOR,
  color: TAB_DRAG_PREVIEW_FG_COLOR,
  border: `1px solid ${TAB_DRAG_PREVIEW_BORDER_COLOR}`,
  borderRadius: TAB_DRAG_PREVIEW_BORDER_RADIUS,
  padding: `${TAB_DRAG_PREVIEW_PADDING_Y} ${TAB_DRAG_PREVIEW_PADDING_X}`,
  fontSize: TAB_DRAG_PREVIEW_FONT_SIZE,
  boxShadow: TAB_DRAG_PREVIEW_SHADOW,
  whiteSpace: "nowrap",
};

const insertGuideBaseStyle: React.CSSProperties = {
  position: "absolute",
  width: TAB_DRAG_INSERT_GUIDE_WIDTH,
  borderRadius: TAB_DRAG_INSERT_GUIDE_BORDER_RADIUS,
  background: TAB_DRAG_INSERT_GUIDE_COLOR,
  boxShadow: TAB_DRAG_INSERT_GUIDE_SHADOW,
};

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
    return { ...previewBaseStyle, left: dragPointer!.x, top: dragPointer!.y };
  }, [hasPreview, dragPointer]);

  const guideStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!tabbarHover) {
      return undefined;
    }
    return {
      ...insertGuideBaseStyle,
      left: tabbarHover.insertX,
      top: tabbarHover.rect.top + 4,
      height: Math.max(0, tabbarHover.rect.height - 8),
    };
  }, [tabbarHover]);

  const renderPreview = (): React.ReactNode => {
    if (!hasPreview) {
      return null;
    }
    return <div style={previewStyle}>{title}</div>;
  };

  const renderGuide = (): React.ReactNode => {
    if (!tabbarHover) {
      return null;
    }
    return <div style={guideStyle} />;
  };

  if (!isTabDragging) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      {renderPreview()}
      {renderGuide()}
    </div>
  );
};
