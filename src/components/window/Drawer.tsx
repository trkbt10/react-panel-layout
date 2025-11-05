/**
 * @file Drawer component
 *
 * Mobile-friendly slide-in panel with backdrop support.
 */
import * as React from "react";
import styles from "./Drawer.module.css";
import type { DrawerBehavior } from "../../modules/window/types";

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

type DrawerBackdropProps = {
  backdropOpacity: number;
  dismissible: boolean;
  onClose: () => void;
};

const DrawerBackdrop: React.FC<DrawerBackdropProps> = React.memo(({ backdropOpacity, dismissible, onClose }) => {
  const handleClick = dismissible ? onClose : undefined;
  return (
    <div
      className={styles.drawerBackdrop}
      style={{ backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }}
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
  const { placement, showBackdrop = true, backdropOpacity = 0.5, size, dismissible = true, header } = config;

  const drawerStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {
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

    if (size !== undefined) {
      if (placement === "top" || placement === "bottom") {
        style.height = typeof size === "number" ? `${size}px` : size;
      } else {
        style.width = typeof size === "number" ? `${size}px` : size;
      }
    }

    return style;
  }, [styleProp, zIndex, width, height, size, placement]);

  const finalClassName = className ? `${styles.drawer} ${className}` : styles.drawer;
  const contentClassName = header ? styles.drawerContent : undefined;

  const renderHeader = () => {
    if (!header) {
      return null;
    }
    return <DrawerHeader header={header} dismissible={dismissible} onClose={onClose} />;
  };

  const renderBackdrop = () => {
    if (!showBackdrop) {
      return null;
    }
    return (
      <React.Activity mode={isOpen ? "visible" : "hidden"}>
        <DrawerBackdrop backdropOpacity={backdropOpacity} dismissible={dismissible} onClose={onClose} />
      </React.Activity>
    );
  };

  return (
    <>
      {renderBackdrop()}
      <React.Activity mode={isOpen ? "visible" : "hidden"}>
        <div className={finalClassName} data-layer-id={id} data-placement={placement} style={drawerStyle}>
          {renderHeader()}
          <div className={contentClassName}>{children}</div>
        </div>
      </React.Activity>
    </>
  );
};
