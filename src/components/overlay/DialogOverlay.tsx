/**
 * @file Dialog-based overlay component with automatic positioning
 *
 * Provides a positioned overlay container using the native <dialog> element.
 * Features:
 * - Automatic viewport-aware positioning
 * - Click-outside to close
 * - ESC key handling
 * - Smooth enter/exit animations via React 19 <Activity>
 * - SSR-safe with polyfill support
 */
import * as React from "react";
import type { Position } from "../../types/core";
import { calculateContextMenuPosition, getViewportInfo } from "../../utils/dialogUtils";
import { ensureDialogPolyfill } from "../../utils/polyfills/createDialogPolyfill";
import { useEffectEvent } from "../../hooks/useEffectEvent";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import styles from "./DialogOverlay.module.css";

type DataAttributes = Record<string, string | number | boolean>;

export type DialogOverlayProps = {
  /** Anchor point for positioning the overlay */
  anchor: Position;
  /** Controls visibility and animations */
  visible: boolean;
  /** Callback when overlay should close (click outside or ESC) */
  onClose: () => void;
  /** Content to render inside the overlay */
  children: React.ReactNode;
  /** Additional CSS class for content container */
  contentClassName?: string;
  /** Additional inline styles for content container */
  contentStyle?: React.CSSProperties;
  /** Custom data attributes to attach to content element */
  dataAttributes?: Record<string, string | number | boolean | null | undefined>;
  /** Keyboard event handler for content container */
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  /** Callback when computed position changes */
  onPositionChange?: (position: Position) => void;
};

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

// Ensure dialog polyfill is loaded for older browsers
ensureDialogPolyfill();

/**
 * Content container with positioning and click-outside handling
 */
const DialogOverlayContent: React.FC<Omit<DialogOverlayProps, "visible">> = ({
  anchor,
  onClose,
  children,
  contentClassName,
  contentStyle,
  dataAttributes,
  onKeyDown,
  onPositionChange,
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { rect } = useResizeObserver(contentRef, { box: "border-box" });

  // Calculate optimal position based on anchor point and content dimensions
  const computedPosition = React.useMemo(() => {
    const viewport = getViewportInfo();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
    return calculateContextMenuPosition(anchor.x, anchor.y, width, height, viewport);
  }, [anchor.x, anchor.y, rect?.width, rect?.height]);

  // useEffectEvent: Stable callback reference that doesn't trigger effect re-runs
  // This allows onPositionChange to access latest props without causing re-renders
  const handlePositionChange = useEffectEvent(onPositionChange);

  // Notify parent of position changes
  React.useEffect(() => {
    handlePositionChange?.(computedPosition);
  }, [computedPosition]);

  // useEffectEvent: Stable callback reference for close handler
  // Prevents effect from re-running when onClose changes
  const handleClose = useEffectEvent(onClose);

  // Close overlay when clicking outside content area
  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Combine user-provided styles with computed position
  const mergedStyle: React.CSSProperties = React.useMemo(
    () => ({
      ...contentStyle,
      left: computedPosition.x,
      top: computedPosition.y,
    }),
    [contentStyle, computedPosition.x, computedPosition.y],
  );

  // Transform dataAttributes into valid HTML data-* attributes
  const dataProps = React.useMemo<DataAttributes>(() => {
    if (!dataAttributes) {
      return {};
    }
    return Object.entries(dataAttributes).reduce<DataAttributes>((acc, [key, value]) => {
      if (value === null || value === undefined) {
        return acc;
      }
      acc[`data-${key}`] = value;
      return acc;
    }, {});
  }, [dataAttributes]);

  return (
    <div
      ref={contentRef}
      className={`${styles.contextContent}${contentClassName ? ` ${contentClassName}` : ""}`}
      style={mergedStyle}
      onKeyDown={onKeyDown}
      {...dataProps}
    >
      {children}
    </div>
  );
};

/**
 * Internal implementation of DialogOverlay (browser-only)
 *
 * Manages the <dialog> element lifecycle and wraps content with React 19's <Activity>
 * for smooth enter/exit animations.
 */
const DialogOverlayImpl: React.FC<DialogOverlayProps> = ({
  visible,
  onClose,
  anchor,
  children,
  contentClassName,
  contentStyle,
  dataAttributes,
  onKeyDown,
  onPositionChange,
}) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Synchronize dialog open/close state with visible prop
  useIsomorphicLayoutEffect(() => {
    if (!dialogRef.current) {
      return;
    }

    const dialog = dialogRef.current;
    if (visible) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [visible]);

  // Handle cancel event (ESC key press)
  const handleCancel = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  return (
    <dialog ref={dialogRef} className={styles.contextDialog} onCancel={handleCancel}>
      <React.Activity mode={visible ? "visible" : "hidden"}>
        <DialogOverlayContent
          anchor={anchor}
          onClose={onClose}
          contentClassName={contentClassName}
          contentStyle={contentStyle}
          dataAttributes={dataAttributes}
          onKeyDown={onKeyDown}
          onPositionChange={onPositionChange}
        >
          {children}
        </DialogOverlayContent>
      </React.Activity>
    </dialog>
  );
};

/**
 * DialogOverlay - Positioned dialog overlay with automatic viewport adjustment
 *
 * A browser-only component that renders a modal dialog with smart positioning.
 * Returns null during SSR to prevent hydration mismatches.
 *
 * @example
 * ```tsx
 * <DialogOverlay
 *   visible={isOpen}
 *   anchor={{ x: 100, y: 200 }}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <Menu items={menuItems} />
 * </DialogOverlay>
 * ```
 */
export const DialogOverlay: React.FC<DialogOverlayProps> = (props) => {
  if (!isBrowser) {
    return null;
  }
  return <DialogOverlayImpl {...props} />;
};

DialogOverlay.displayName = "DialogOverlay";
