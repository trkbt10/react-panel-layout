/**
 * @file Drawer component
 *
 * Mobile-friendly slide-in panel with backdrop support.
 */
import * as React from "react";
import styles from "./Drawer.module.css";
import type { DrawerBehavior, WindowPosition } from "../../modules/types";

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
};

type DrawerBackdropProps = { style?: React.CSSProperties; dismissible: boolean; onClose: () => void };

const DrawerBackdrop: React.FC<DrawerBackdropProps> = React.memo(({ style, dismissible, onClose }) => {
  const handleClick = dismissible ? onClose : undefined;
  return (
    <div
      className={styles.drawerBackdrop}
      style={style}
      onClick={handleClick}
    />
  );
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
    return <div className={styles.drawerHeaderTitle}>{header.title}</div>;
  };

  const renderCloseButton = () => {
    if (!showCloseButton || !dismissible) {
      return null;
    }
    return (
      <button className={styles.drawerHeaderCloseButton} onClick={onClose} aria-label="Close drawer" type="button">
        ×
      </button>
    );
  };

  return (
    <div className={styles.drawerHeader}>
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
}) => {
  const { dismissible = true, header, zIndex: configZ, position, backdropStyle } = config;

  const drawerStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {
      ...styleProp,
    };

    if (zIndex !== undefined) {
      style.zIndex = zIndex;
    } else if (configZ !== undefined) {
      style.zIndex = configZ;
    }

    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }

    return style;
  }, [styleProp, zIndex, configZ, width, height]);

  const finalClassName = className ? `${styles.drawer} ${className}` : styles.drawer;
  const contentClassName = header ? styles.drawerContent : undefined;

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

  return (
    <>
      {renderBackdrop()}
      <React.Activity mode={isOpen ? "visible" : "hidden"}>
        <div className={finalClassName} data-layer-id={id} data-placement={resolvePlacement(position)} style={drawerStyle}>
          {renderHeader()}
          <div className={contentClassName}>{children}</div>
        </div>
      </React.Activity>
    </>
  );
};
