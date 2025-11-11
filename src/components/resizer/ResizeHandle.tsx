/**
 * @file Resize handle component
 */
import * as React from "react";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";
import { RESIZE_HANDLE_THICKNESS, RESIZE_HANDLE_Z_INDEX } from "../../constants/styles";

export type ResizeHandleProps = {
  /** Direction of resize */
  direction: "horizontal" | "vertical";
  /** Callback when resize occurs */
  onResize?: (delta: number) => void;
  /** Custom component for the handle */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the handle */
  element?: React.ReactElement;
};

const baseResizeHandleStyle: React.CSSProperties = {
  position: "absolute",
  zIndex: RESIZE_HANDLE_Z_INDEX,
};

const verticalResizeHandleStyle: React.CSSProperties = {
  ...baseResizeHandleStyle,
  width: RESIZE_HANDLE_THICKNESS,
  height: "100%",
  top: 0,
  cursor: "col-resize",
};

const horizontalResizeHandleStyle: React.CSSProperties = {
  ...baseResizeHandleStyle,
  width: "100%",
  height: RESIZE_HANDLE_THICKNESS,
  left: 0,
  cursor: "row-resize",
};

/**
 * ResizeHandle - Draggable handle for resizing grid areas
 */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onResize, component: Component, element }) => {
  const axis = direction === "vertical" ? "x" : "y";
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({ axis, onResize });

  const handleProps = {
    ref,
    style: direction === "vertical" ? verticalResizeHandleStyle : horizontalResizeHandleStyle,
    "data-resize-handle": "true",
    "data-direction": direction,
    "data-is-dragging": isDragging ? "true" : undefined,
    onPointerDown,
  };

  if (element) {
    return React.cloneElement(element, handleProps);
  }
  if (Component) {
    return <Component {...handleProps} />;
  }
  return <div {...handleProps} />;
};
