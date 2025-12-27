/**
 * @file Base dialog container component using native <dialog> element
 */
import * as React from "react";
import type { DialogContainerProps } from "./types.js";
import { useDialogContainer } from "./useDialogContainer.js";
import { SwipeDialogContainer } from "./SwipeDialogContainer.js";
import {
  COLOR_MODAL_BACKDROP,
  MODAL_TRANSITION_DURATION,
  MODAL_TRANSITION_EASING,
} from "../../constants/styles.js";

const dialogBaseStyle: React.CSSProperties = {
  border: "none",
  padding: 0,
  background: "transparent",
  maxWidth: "none",
  maxHeight: "none",
  overflow: "visible",
};

const contentWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
};

const contentStyle: React.CSSProperties = {
  pointerEvents: "auto",
};

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

type DialogContainerImplProps = DialogContainerProps;

const DialogContainerImpl: React.FC<DialogContainerImplProps> = ({
  visible,
  onClose,
  children,
  position = "center",
  dismissible = true,
  closeOnEscape = true,
  returnFocus = true,
  preventBodyScroll = true,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  transitionMode = "css",
  transitionDuration = MODAL_TRANSITION_DURATION,
  transitionEasing = MODAL_TRANSITION_EASING,
}) => {
  const { dialogRef, dialogProps } = useDialogContainer({
    visible,
    onClose,
    dismissible,
    closeOnEscape,
    returnFocus,
    preventBodyScroll,
  });

  const backdropStyle = React.useMemo((): string => {
    if (transitionMode === "none") {
      return `
        dialog::backdrop {
          background: ${COLOR_MODAL_BACKDROP};
        }
      `;
    }
    return `
      dialog::backdrop {
        background: ${COLOR_MODAL_BACKDROP};
        opacity: 0;
        transition: opacity ${transitionDuration} ${transitionEasing};
      }
      dialog[open]::backdrop {
        opacity: 1;
      }
    `;
  }, [transitionMode, transitionDuration, transitionEasing]);

  const computedContentWrapperStyle = React.useMemo((): React.CSSProperties => {
    if (position === "center") {
      return contentWrapperStyle;
    }
    // Absolute position
    const style: React.CSSProperties = {
      ...contentWrapperStyle,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    };
    if (position.x !== undefined) {
      style.left = position.x;
    }
    if (position.y !== undefined) {
      style.top = position.y;
    }
    return style;
  }, [position]);

  const computedContentStyle = React.useMemo((): React.CSSProperties => {
    if (transitionMode === "none") {
      return contentStyle;
    }
    return {
      ...contentStyle,
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.95)",
      transition: `opacity ${transitionDuration} ${transitionEasing}, transform ${transitionDuration} ${transitionEasing}`,
    };
  }, [visible, transitionMode, transitionDuration, transitionEasing]);

  // Stop propagation on pointer down inside content to prevent backdrop click handling
  const handleContentPointerDown = React.useCallback((event: React.PointerEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <>
      <style>{backdropStyle}</style>
      <dialog
        ref={dialogRef}
        style={dialogBaseStyle}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        {...dialogProps}
      >
        <div style={computedContentWrapperStyle}>
          <React.Activity mode={visible ? "visible" : "hidden"}>
            <div style={computedContentStyle} onPointerDown={handleContentPointerDown}>
              {children}
            </div>
          </React.Activity>
        </div>
      </dialog>
    </>
  );
};

/**
 * Base container for dialog-based overlays using native <dialog> element.
 * Opens in the browser's top layer, ensuring it appears above all other content.
 *
 * Supports three transition modes:
 * - "none": No animation
 * - "css": CSS-based fade/scale animation (default)
 * - "swipe": Swipeable with multi-phase animation
 *
 * @example
 * ```tsx
 * <DialogContainer
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <div>Dialog content</div>
 * </DialogContainer>
 * ```
 *
 * @example Swipeable dialog
 * ```tsx
 * <DialogContainer
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   transitionMode="swipe"
 *   openDirection="bottom"
 * >
 *   <div>Swipe down to close</div>
 * </DialogContainer>
 * ```
 */
export const DialogContainer: React.FC<DialogContainerProps> = (props) => {
  if (!isBrowser) {
    return null;
  }

  // Use SwipeDialogContainer for swipe mode
  if (props.transitionMode === "swipe") {
    return <SwipeDialogContainer {...props} />;
  }

  return <DialogContainerImpl {...props} />;
};

DialogContainer.displayName = "DialogContainer";
