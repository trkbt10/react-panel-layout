/**
 * @file Resize handle component
 */
import * as React from "react";
import { useResizeDrag } from "../../modules/resizer/useResizeDrag";
import {
  RESIZE_HANDLE_THICKNESS,
  RESIZE_HANDLE_Z_INDEX,
  COLOR_RESIZE_HANDLE_ACTIVE,
  COLOR_RESIZE_HANDLE_HOVER,
} from "../../constants/styles";
import { useElementComponentWrapper } from "../../hooks/useElementComponentWrapper";

export type ResizeHandleProps = {
  /** Direction of resize */
  direction: "horizontal" | "vertical";
  /** Callback when resize occurs */
  onResize?: (delta: number) => void;
  /** Custom component for the handle */
  component?: React.ComponentType<React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>;
  /** Custom element for the handle */
  element?: React.ReactElement<React.HTMLAttributes<HTMLDivElement>>;
  /** Optional children rendered inside the handle */
  children?: React.ReactNode;
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
export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
  component: Component,
  element,
  children,
}) => {
  const axis = direction === "vertical" ? "x" : "y";
  const { ref, isDragging, onPointerDown } = useResizeDrag<HTMLDivElement>({ axis, onResize });
  const [isHovered, setIsHovered] = React.useState(false);

  const Wrapper = useElementComponentWrapper({
    element,
    component: Component,
  });

  const baseStyle = direction === "vertical" ? verticalResizeHandleStyle : horizontalResizeHandleStyle;
  const getBackgroundColor = (): string => {
    if (isDragging) {
      return COLOR_RESIZE_HANDLE_ACTIVE;
    }
    if (isHovered) {
      return COLOR_RESIZE_HANDLE_HOVER;
    }
    return "transparent";
  };
  const backgroundColor = getBackgroundColor();
  const style: React.CSSProperties = {
    ...baseStyle,
    backgroundColor,
    touchAction: "none",
  };

  return (
    <Wrapper
      ref={ref}
      style={style}
      data-resize-handle="true"
      data-direction={direction}
      data-is-dragging={isDragging ? "true" : undefined}
      onPointerDown={onPointerDown}
      onPointerEnter={() => {
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
      }}
    >
      {children}
    </Wrapper>
  );
};
