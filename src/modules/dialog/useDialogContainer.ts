/**
 * @file Hook for managing dialog element lifecycle
 */
import * as React from "react";
import { useEffectEvent } from "../../hooks/useEffectEvent";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

export type UseDialogContainerOptions = {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Whether clicking backdrop closes the dialog (default: true) */
  dismissible?: boolean;
  /** Whether pressing Escape closes the dialog (default: true) */
  closeOnEscape?: boolean;
  /** Whether to return focus to previous element on close (default: true) */
  returnFocus?: boolean;
  /** Whether to prevent body scroll when open (default: true) */
  preventBodyScroll?: boolean;
};

export type UseDialogContainerReturn = {
  /** Ref to attach to the dialog element */
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  /** Props to spread onto the dialog element */
  dialogProps: {
    onCancel: (event: React.SyntheticEvent) => void;
    onClick: (event: React.MouseEvent<HTMLDialogElement>) => void;
  };
};

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

/**
 * Hook for managing native dialog element lifecycle
 *
 * @example
 * ```tsx
 * function MyDialog({ visible, onClose }) {
 *   const { dialogRef, dialogProps } = useDialogContainer({
 *     visible,
 *     onClose,
 *   });
 *
 *   return (
 *     <dialog ref={dialogRef} {...dialogProps}>
 *       <div>Dialog content</div>
 *     </dialog>
 *   );
 * }
 * ```
 */
export const useDialogContainer = (options: UseDialogContainerOptions): UseDialogContainerReturn => {
  const {
    visible,
    onClose,
    dismissible = true,
    closeOnEscape = true,
    returnFocus = true,
    preventBodyScroll = true,
  } = options;

  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const previousActiveElementRef = React.useRef<Element | null>(null);

  const handleClose = useEffectEvent(onClose);

  // Open/close dialog based on visibility
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isBrowser) {
      return;
    }

    if (visible) {
      // Store currently focused element before opening
      if (returnFocus) {
        previousActiveElementRef.current = document.activeElement;
      }

      // Open as modal (this puts it in the top layer, above all other content)
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();

      // Return focus to previously focused element
      if (returnFocus && previousActiveElementRef.current instanceof HTMLElement) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    }
  }, [visible, returnFocus]);

  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (!isBrowser || !preventBodyScroll || !visible) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [visible, preventBodyScroll]);

  // Handle cancel event (Escape key)
  const handleCancel = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      if (closeOnEscape) {
        handleClose();
      }
    },
    [closeOnEscape, handleClose],
  );

  // Handle click on dialog (for backdrop click detection)
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      // Check if click was on the dialog backdrop (::backdrop pseudo-element area)
      // The dialog element itself is the backdrop; clicking on it directly means backdrop click
      if (dismissible && event.target === event.currentTarget) {
        handleClose();
      }
    },
    [dismissible, handleClose],
  );

  return {
    dialogRef,
    dialogProps: {
      onCancel: handleCancel,
      onClick: handleClick,
    },
  };
};
