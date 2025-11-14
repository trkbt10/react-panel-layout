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

type ResizeHandleDirection = "horizontal" | "vertical";

export type ResizeHandleProps = {
  /** Direction of resize */
  direction: ResizeHandleDirection;
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

const sizeStylesByDirection: Record<ResizeHandleDirection, React.CSSProperties> = {
  vertical: {
    width: RESIZE_HANDLE_THICKNESS,
    height: "100%",
    top: 0,
    cursor: "col-resize",
  },
  horizontal: {
    width: "100%",
    height: RESIZE_HANDLE_THICKNESS,
    left: 0,
    cursor: "row-resize",
  },
};

const resolveResizeHandleBackground = (dragging: boolean, hovered: boolean): string => {
  if (dragging) {
    return COLOR_RESIZE_HANDLE_ACTIVE;
  }
  if (hovered) {
    return COLOR_RESIZE_HANDLE_HOVER;
  }
  return "transparent";
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
  const handlePointerEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);
  const handlePointerLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const Wrapper = useElementComponentWrapper({
    element,
    component: Component,
  });

  const style = React.useMemo(() => {
    return {
      ...baseResizeHandleStyle,
      ...sizeStylesByDirection[direction],
      backgroundColor: resolveResizeHandleBackground(isDragging, isHovered),
      touchAction: "none",
    };
  }, [direction, isDragging, isHovered]);

  return (
    <Wrapper
      ref={ref}
      style={style}
      role="separator"
      aria-orientation={direction}
      aria-hidden={undefined}
      data-resize-handle="true"
      data-direction={direction}
      data-is-dragging={isDragging ? "true" : undefined}
      onPointerDown={onPointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </Wrapper>
  );
};
