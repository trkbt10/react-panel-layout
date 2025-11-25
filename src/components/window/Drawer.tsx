/**
 * @file Drawer component
 *
 * Mobile-friendly slide-in panel with backdrop support.
 */
import * as React from "react";
import type { DrawerBehavior, WindowPosition } from "../../types";
import {
  FloatingPanelContent,
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
} from "../paneling/FloatingPanelFrame";
import {
  DRAWER_HEADER_PADDING_Y,
  DRAWER_HEADER_PADDING_X,
  DRAWER_HEADER_GAP,
  DRAWER_CLOSE_BUTTON_FONT_SIZE,
  DRAWER_CONTENT_PADDING,
  COLOR_DRAWER_BACKDROP,
  DRAWER_TRANSITION_DURATION,
  DRAWER_TRANSITION_EASING,
} from "../../constants/styles";

const drawerBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: COLOR_DRAWER_BACKDROP,
};

const drawerBaseStyle: React.CSSProperties = {
  willChange: "transform",
};

const drawerPlacementStyles: Record<string, React.CSSProperties> = {
  left: {
    top: 0,
    bottom: 0,
    left: 0,
    transform: "translateX(-100%)",
  },
  right: {
    top: 0,
    bottom: 0,
    right: 0,
    transform: "translateX(100%)",
  },
  top: {
    top: 0,
    left: 0,
    right: 0,
    transform: "translateY(-100%)",
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    transform: "translateY(100%)",
  },
};

const computeTransitionValue = (
  mode: DrawerBehavior["transitionMode"] | undefined,
  duration: DrawerBehavior["transitionDuration"],
  easing: DrawerBehavior["transitionEasing"],
): string | undefined => {
  if (mode === "none") {
    return undefined;
  }

  const durationValue = duration ?? DRAWER_TRANSITION_DURATION;
  const easingValue = easing ?? DRAWER_TRANSITION_EASING;

  return `transform ${durationValue} ${easingValue}`;
};

export type DrawerProps = {
  id: string;
  config: DrawerBehavior;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
  width?: string | number;
  height?: string | number;
  position?: WindowPosition;
};

type DrawerViewProps = {
  header?: DrawerBehavior["header"];
  dismissible: boolean;
  onClose: () => void;
  chrome: boolean;
  children: React.ReactNode;
};

const shouldShowCloseButton = (dismissible: boolean, showClose: boolean): boolean => {
  if (!dismissible) {
    return false;
  }
  return showClose;
};

const closeButtonStyle: React.CSSProperties = {
  marginLeft: "auto",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: DRAWER_CLOSE_BUTTON_FONT_SIZE,
};

const DrawerHeaderView: React.FC<{
  header?: DrawerBehavior["header"];
  dismissible: boolean;
  onClose: () => void;
}> = ({ header, dismissible, onClose }) => {
  if (!header) {
    return null;
  }

  const showCloseButton = header.showCloseButton ?? true;
  const shouldShowClose = shouldShowCloseButton(dismissible, showCloseButton);

  return (
    <React.Activity mode={header ? "visible" : "hidden"}>
      <FloatingPanelHeader
        style={{ padding: `${DRAWER_HEADER_PADDING_Y} ${DRAWER_HEADER_PADDING_X}`, gap: DRAWER_HEADER_GAP }}
      >
        <React.Activity mode={header ? "visible" : "hidden"}>
          <FloatingPanelTitle>{header.title}</FloatingPanelTitle>
        </React.Activity>
        <React.Activity mode={shouldShowClose ? "visible" : "hidden"}>
          <button style={closeButtonStyle} onClick={onClose} aria-label="Close drawer" type="button">
            ×
          </button>
        </React.Activity>
      </FloatingPanelHeader>
    </React.Activity>
  );
};

const DrawerView: React.FC<DrawerViewProps> = ({ header, dismissible, onClose, chrome, children }) => {
  if (!chrome) {
    return <>{children}</>;
  }

  return (
    <FloatingPanelFrame style={{ height: "100%", borderRadius: 0 }}>
      <DrawerHeaderView header={header} dismissible={dismissible} onClose={onClose} />
      <FloatingPanelContent
        style={{ padding: DRAWER_CONTENT_PADDING, flex: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </FloatingPanelContent>
    </FloatingPanelFrame>
  );
};

export const Drawer: React.FC<DrawerProps> = ({
  id,
  config,
  isOpen,
  onClose,
  children,
  zIndex,
  width,
  height,
  position,
}) => {
  const {
    dismissible = true,
    header,
    chrome = true,
    inline = false,
    transitionMode = "css",
    transitionDuration,
    transitionEasing,
  } = config;

  const resolvePlacement = React.useCallback((pos?: WindowPosition): "left" | "right" | "top" | "bottom" => {
    if (!pos) {
      return "right";
    }
    if (pos.left !== undefined) {
      return "left";
    }
    if (pos.right !== undefined) {
      return "right";
    }
    if (pos.top !== undefined) {
      return "top";
    }
    if (pos.bottom !== undefined) {
      return "bottom";
    }
    return "right";
  }, []);

  const placement = resolvePlacement(position);

  const openTransforms: Record<string, string> = {
    left: "translateX(0)",
    right: "translateX(0)",
    top: "translateY(0)",
    bottom: "translateY(0)",
  };

  const drawerStyle = React.useMemo((): React.CSSProperties => {
    const transitionValue = computeTransitionValue(transitionMode, transitionDuration, transitionEasing);

    const style: React.CSSProperties = {
      ...drawerBaseStyle,
      ...(inline ? { position: "absolute" } : { position: "fixed" }),
      ...drawerPlacementStyles[placement],
      transform: isOpen ? openTransforms[placement] : drawerPlacementStyles[placement].transform,
      transition: transitionValue,
    };

    if (zIndex !== undefined) {
      style.zIndex = zIndex;
    }

    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }

    return style;
  }, [height, inline, isOpen, placement, transitionDuration, transitionEasing, transitionMode, width, zIndex]);

  const ariaLabel = header?.title ?? config.ariaLabel ?? "Drawer";

  const backdropStyle = React.useMemo((): React.CSSProperties => {
    const base = inline ? { ...drawerBackdropStyle, position: "absolute" as const } : drawerBackdropStyle;
    const transitionValue = transitionMode === "none" ? undefined : `opacity ${transitionDuration ?? "220ms"} ease`;
    return {
      ...base,
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? "auto" : "none",
      transition: transitionValue,
      zIndex: zIndex !== undefined ? zIndex - 1 : undefined,
    };
  }, [inline, isOpen, transitionDuration, transitionMode, zIndex]);

  return (
    <>
      <div style={backdropStyle} onClick={dismissible ? onClose : undefined} />
      <div
        data-layer-id={id}
        data-placement={placement}
        style={drawerStyle}
        role="dialog"
        aria-modal={dismissible ? true : undefined}
        aria-hidden={isOpen ? undefined : true}
        aria-label={ariaLabel}
      >
        <DrawerView header={header} dismissible={dismissible} onClose={onClose} chrome={chrome}>
          {children}
        </DrawerView>
      </div>
    </>
  );
};
