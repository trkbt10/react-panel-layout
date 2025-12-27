/**
 * @file Swipeable dialog container component.
 *
 * This component extends the base dialog functionality with swipe-to-dismiss
 * and multi-phase animations. It uses native <dialog> element for top layer
 * positioning and custom transform animations.
 */
import * as React from "react";
import type { DialogContainerProps } from "./types.js";
import { useDialogContainer } from "./useDialogContainer.js";
import { useDialogSwipeInput } from "./useDialogSwipeInput.js";
import { useDialogTransform } from "./useDialogTransform.js";
import { COLOR_MODAL_BACKDROP } from "../../constants/styles.js";

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
  willChange: "transform, opacity",
};

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: COLOR_MODAL_BACKDROP,
  pointerEvents: "auto",
  willChange: "opacity",
};

/**
 * Swipeable dialog container with multi-phase animation.
 *
 * Uses native <dialog> for top layer positioning and custom JS animations
 * for swipe-to-dismiss functionality.
 */
export const SwipeDialogContainer: React.FC<DialogContainerProps> = ({
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
  swipeDismissible = true,
  openDirection = "center",
  useViewTransition = false,
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);

  // Base dialog lifecycle management
  const { dialogRef, dialogProps } = useDialogContainer({
    visible,
    onClose,
    dismissible,
    closeOnEscape,
    returnFocus,
    preventBodyScroll,
  });

  // Swipe input detection - free 2D movement
  const swipeEnabled = swipeDismissible ? visible : false;
  const {
    state: swipeState,
    containerProps: swipeContainerProps,
    displacement,
    displacement2D,
    isOperating,
  } = useDialogSwipeInput({
    containerRef: contentRef,
    openDirection,
    enabled: swipeEnabled,
    onSwipeDismiss: onClose,
  });

  // Transform and animation management
  const { phase, isAnimating, triggerClose } = useDialogTransform({
    elementRef: contentRef,
    backdropRef,
    visible,
    openDirection,
    swipeState,
    displacement,
    displacement2D,
    useViewTransition,
    onCloseComplete: onClose,
  });

  // Handle backdrop click
  const handleBackdropClick = React.useCallback(() => {
    if (!dismissible) {
      return;
    }
    if (isOperating) {
      return;
    }
    if (isAnimating) {
      return;
    }
    triggerClose();
  }, [dismissible, isOperating, isAnimating, triggerClose]);

  // Compute content wrapper style based on position
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

  // Merge swipe container props with content style
  // Note: We don't use React.Activity here because it uses display:none,
  // which prevents dimension measurement needed for animations.
  // Instead, we use visibility and opacity controlled by the animation.
  const mergedContentStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {
      ...contentStyle,
      ...swipeContainerProps.style,
    };

    // When closed, hide the content but keep it in layout for dimension measurement
    if (phase === "closed") {
      style.visibility = "hidden";
      style.pointerEvents = "none";
    }

    return style;
  }, [swipeContainerProps.style, phase]);

  // Stop propagation on content pointer events
  const handleContentPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    swipeContainerProps.onPointerDown?.(event);
    // Don't stop propagation - let swipe input handle it
  }, [swipeContainerProps]);

  // Hide dialog styling (we use our own backdrop)
  const hideNativeBackdrop = `
    dialog::backdrop {
      background: transparent;
    }
  `;

  return (
    <>
      <style>{hideNativeBackdrop}</style>
      <dialog
        ref={dialogRef}
        style={dialogBaseStyle}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        {...dialogProps}
      >
        {/* Custom backdrop for animated opacity */}
        <div
          ref={backdropRef}
          style={backdropStyle}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        <div style={computedContentWrapperStyle}>
          <div
            ref={contentRef}
            style={mergedContentStyle}
            onPointerDown={handleContentPointerDown}
          >
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
};

SwipeDialogContainer.displayName = "SwipeDialogContainer";
