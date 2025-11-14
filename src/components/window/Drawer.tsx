/**
 * @file Drawer component
 *
 * Mobile-friendly slide-in panel with backdrop support.
 */
import * as React from "react";
import type { DrawerBehavior, WindowPosition } from "../../types";
import {
  DRAWER_HEADER_PADDING_Y,
  DRAWER_HEADER_PADDING_X,
  DRAWER_HEADER_GAP,
  DRAWER_CONTENT_PADDING,
  DRAWER_CLOSE_BUTTON_FONT_SIZE,
  DRAWER_SURFACE_COLOR,
  DRAWER_BORDER_COLOR,
  DRAWER_SHADOW,
} from "../../constants/styles";

const drawerBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
};

const drawerBaseStyle: React.CSSProperties = {
  position: "fixed",
  background: DRAWER_SURFACE_COLOR,
  boxShadow: DRAWER_SHADOW,
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

const drawerHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: `${DRAWER_HEADER_PADDING_Y} ${DRAWER_HEADER_PADDING_X}`,
  gap: DRAWER_HEADER_GAP,
  borderBottom: `1px solid ${DRAWER_BORDER_COLOR}`,
};

const drawerHeaderTitleStyle: React.CSSProperties = {
  fontWeight: 600,
};

const drawerHeaderCloseButtonStyle: React.CSSProperties = {
  marginLeft: "auto",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: DRAWER_CLOSE_BUTTON_FONT_SIZE,
};

const drawerContentStyle: React.CSSProperties = {
  padding: DRAWER_CONTENT_PADDING,
};

export type DrawerProps = {
  id: string;
  config: DrawerBehavior;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  width?: string | number;
  height?: string | number;
  position?: WindowPosition;
  backdropStyle?: React.CSSProperties;
};

type DrawerBackdropProps = { style?: React.CSSProperties; dismissible: boolean; onClose: () => void };

const DrawerBackdrop: React.FC<DrawerBackdropProps> = React.memo(({ style, dismissible, onClose }) => {
  const handleClick = dismissible ? onClose : undefined;
  const combinedStyle = React.useMemo(() => ({ ...drawerBackdropStyle, ...style }), [style]);
  return <div style={combinedStyle} onClick={handleClick} />;
});

type DrawerHeaderProps = {
  header: DrawerBehavior["header"];
  dismissible: boolean;
  onClose: () => void;
};

const DrawerHeader: React.FC<DrawerHeaderProps> = React.memo(({ header, dismissible, onClose }) => {
  if (!header) {
    return null;
  }

  const showCloseButton = header.showCloseButton ?? true;

  const renderTitle = () => {
    if (!header.title) {
      return null;
    }
    return <div style={drawerHeaderTitleStyle}>{header.title}</div>;
  };

  const renderCloseButton = () => {
    if (!showCloseButton || !dismissible) {
      return null;
    }
    return (
      <button style={drawerHeaderCloseButtonStyle} onClick={onClose} aria-label="Close drawer" type="button">
        ×
      </button>
    );
  };

  return (
    <div style={drawerHeaderStyle}>
      {renderTitle()}
      {renderCloseButton()}
    </div>
  );
});

export const Drawer: React.FC<DrawerProps> = ({
  id,
  config,
  isOpen,
  onClose,
  children,
  className,
  style: styleProp,
  zIndex,
  width,
  height,
  position,
  backdropStyle,
}) => {
  const { dismissible = true, header } = config;

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

  const drawerStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {
      ...drawerBaseStyle,
      ...drawerPlacementStyles[placement],
      ...styleProp,
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
  }, [styleProp, zIndex, width, height, placement]);

  const contentFinalStyle = header ? drawerContentStyle : undefined;

  const renderHeader = () => {
    if (!header) {
      return null;
    }
    return <DrawerHeader header={header} dismissible={dismissible} onClose={onClose} />;
  };

  const renderBackdrop = () => {
    if (!backdropStyle) {
      return null;
    }
    return (
      <React.Activity mode={isOpen ? "visible" : "hidden"}>
        <DrawerBackdrop style={backdropStyle} dismissible={dismissible} onClose={onClose} />
      </React.Activity>
    );
  };

  return (
    <>
      {renderBackdrop()}
      <React.Activity mode={isOpen ? "visible" : "hidden"}>
        <div
          className={className}
          data-layer-id={id}
          data-placement={placement}
          style={drawerStyle}
          role="dialog"
          aria-modal={dismissible ? true : undefined}
          aria-hidden={isOpen ? undefined : true}
          aria-label={header?.title ?? "Drawer"}
        >
          {renderHeader()}
          <div style={contentFinalStyle}>{children}</div>
        </div>
      </React.Activity>
    </>
  );
};
