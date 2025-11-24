/**
 * @file Floating drag preview and insertion guide for tab dragging.
 */
import * as React from "react";
import { usePanelInteractions } from "../../modules/panels/interactions/InteractionsContext";
import {
  TAB_DRAG_OVERLAY_Z_INDEX,
  TAB_DRAG_PREVIEW_OFFSET_X,
  TAB_DRAG_PREVIEW_OFFSET_Y,
  TAB_DRAG_INSERT_GUIDE_WIDTH,
  TAB_DRAG_INSERT_GUIDE_BORDER_RADIUS,
  TAB_DRAG_INSERT_GUIDE_COLOR,
  TAB_DRAG_INSERT_GUIDE_SHADOW,
} from "../../constants/styles";
import { useClonedElementPreview } from "../../hooks/useClonedElementPreview";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: TAB_DRAG_OVERLAY_Z_INDEX,
};

const insertGuideBaseStyle: React.CSSProperties = {
  position: "absolute",
  width: TAB_DRAG_INSERT_GUIDE_WIDTH,
  borderRadius: TAB_DRAG_INSERT_GUIDE_BORDER_RADIUS,
  background: TAB_DRAG_INSERT_GUIDE_COLOR,
  boxShadow: TAB_DRAG_INSERT_GUIDE_SHADOW,
};

export const TabDragOverlay: React.FC = () => {
  const { isTabDragging, draggingTabId, dragPointer, tabbarHover, draggingTabElement } = usePanelInteractions();
  const { html: previewHtml, size: previewSize } = useClonedElementPreview(draggingTabElement);

  const hasPreview = dragPointer !== null && draggingTabId !== null;

  const previewBaseStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!hasPreview || !dragPointer) {
      return undefined;
    }
    return {
      position: "absolute",
      left: dragPointer.x,
      top: dragPointer.y,
      transform: `translate(${TAB_DRAG_PREVIEW_OFFSET_X}, ${TAB_DRAG_PREVIEW_OFFSET_Y})`,
      pointerEvents: "none",
    };
  }, [hasPreview, dragPointer]);

  const previewStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!previewBaseStyle || !draggingTabElement) {
      return undefined;
    }
    if (previewSize) {
      return { ...previewBaseStyle, width: previewSize.width, height: previewSize.height };
    }
    return previewBaseStyle;
  }, [previewBaseStyle, draggingTabElement, previewSize]);

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

  if (!isTabDragging) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <React.Activity mode={previewStyle ? "visible" : "hidden"}>
        <div style={previewStyle}>
          <div
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
            dangerouslySetInnerHTML={{ __html: previewHtml ?? "" }}
          />
        </div>
      </React.Activity>
      <React.Activity mode={guideStyle ? "visible" : "hidden"}>
        <div style={guideStyle} />
      </React.Activity>
    </div>
  );
};
