/**
 * @file Drawer component
 *
 * Mobile-friendly slide-in panel with backdrop support.
 * Features:
 * - Multiple placement options (left, right, top, bottom)
 * - Configurable backdrop with opacity
 * - Optional header with title and close button
 * - Smooth enter/exit animations via React 19 <Activity>
 * - Dismissible via backdrop click or close button
 */
import * as React from "react";
import styles from "./Drawer.module.css";
import { DrawerBehavior } from "../../panels";

export type DrawerProps = {
  /** Unique identifier for the drawer */
  id: string;
  /** Drawer behavior configuration */
  config: DrawerBehavior;
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
  /** Drawer content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Z-index override */
  zIndex?: number;
  /** Width override */
  width?: string | number;
  /** Height override */
  height?: string | number;
};

type DrawerBackdropProps = {
  backdropOpacity: number;
  dismissible: boolean;
  onClose: () => void;
};

/**
 * Backdrop overlay for drawer
 * Memoized to prevent unnecessary re-renders
 * Visibility is controlled by React.Activity in parent component
 */
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

/**
 * Drawer header with optional title and close button
 * Memoized to prevent unnecessary re-renders
 */
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

/**
 * Drawer component - slide-in panel with backdrop
 *
 * Renders a drawer panel with configurable placement, size, and behavior.
 * Uses React 19's <Activity> for smooth enter/exit animations.
 *
 * @example
 * ```tsx
 * <Drawer
 *   id="sidebar"
 *   config={{
 *     placement: "left",
 *     size: 300,
 *     dismissible: true,
 *     header: { title: "Menu" }
 *   }}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <MenuContent />
 * </Drawer>
 * ```
 */
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

  // Compute drawer styles with memoization
  const drawerStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {
      ...styleProp,
    };

    // Apply z-index override
    if (zIndex !== undefined) {
      style.zIndex = zIndex;
    }

    // Apply dimension overrides
    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }

    // Apply size based on placement
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
