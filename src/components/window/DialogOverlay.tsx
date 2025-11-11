/**
 * @file Dialog-based overlay component with automatic positioning
 */
import * as React from "react";
import type { Position } from "../../types";
import { calculateContextMenuPosition, getViewportInfo } from "../../utils/dialogUtils";
import { ensureDialogPolyfill } from "../../utils/polyfills/createDialogPolyfill";
import { useEffectEvent } from "../../hooks/useEffectEvent";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { DIALOG_OVERLAY_Z_INDEX } from "../../constants/styles";

const contextDialogStyle: React.CSSProperties = {
  border: "none",
  padding: 0,
  background: "transparent",
};

const contextContentStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: DIALOG_OVERLAY_Z_INDEX,
};

type DataAttributes = Record<string, string | number | boolean>;

export type DialogOverlayProps = {
  anchor: Position;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  dataAttributes?: Record<string, string | number | boolean | null | undefined>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onPositionChange?: (position: Position) => void;
};

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

ensureDialogPolyfill();

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

  const computedPosition = React.useMemo(() => {
    const viewport = getViewportInfo();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
    return calculateContextMenuPosition(anchor.x, anchor.y, width, height, viewport);
  }, [anchor.x, anchor.y, rect?.width, rect?.height]);

  const handlePositionChange = useEffectEvent(onPositionChange);

  React.useEffect(() => {
    handlePositionChange?.(computedPosition);
  }, [computedPosition]);

  const handleClose = useEffectEvent(onClose);

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

  const mergedStyle: React.CSSProperties = React.useMemo(
    () => ({
      ...contextContentStyle,
      ...contentStyle,
      left: computedPosition.x,
      top: computedPosition.y,
    }),
    [contentStyle, computedPosition.x, computedPosition.y],
  );

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
      className={contentClassName}
      style={mergedStyle}
      onKeyDown={onKeyDown}
      {...dataProps}
    >
      {children}
    </div>
  );
};

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

  const handleCancel = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  return (
    <dialog ref={dialogRef} style={contextDialogStyle} onCancel={handleCancel}>
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

export const DialogOverlay: React.FC<DialogOverlayProps> = (props) => {
  if (!isBrowser) {
    return null;
  }
  return <DialogOverlayImpl {...props} />;
};

DialogOverlay.displayName = "DialogOverlay";
