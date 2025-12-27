/**
 * @file Modal component - Centered modal dialog with optional chrome
 */
import * as React from "react";
import type { ModalProps } from "./types";
import { DialogContainer } from "./DialogContainer";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
  FloatingPanelCloseButton,
} from "../../components/paneling/FloatingPanelFrame";
import {
  MODAL_MIN_WIDTH,
  MODAL_MAX_WIDTH,
  MODAL_MAX_HEIGHT,
  FLOATING_PANEL_HEADER_PADDING_Y,
  FLOATING_PANEL_HEADER_PADDING_X,
  FLOATING_PANEL_GAP,
} from "../../constants/styles";

const modalContentStyle: React.CSSProperties = {
  minWidth: MODAL_MIN_WIDTH,
  maxWidth: MODAL_MAX_WIDTH,
  maxHeight: MODAL_MAX_HEIGHT,
  display: "flex",
  flexDirection: "column",
};

type ModalContentProps = {
  header?: ModalProps["header"];
  dismissible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: React.CSSProperties;
};

const ModalContentWithChrome: React.FC<ModalContentProps> = ({
  header,
  dismissible,
  onClose,
  children,
  contentStyle,
}) => {
  const showCloseButton = header?.showCloseButton ?? true;
  const shouldShowClose = dismissible ? showCloseButton : false;

  const hasHeader = header !== undefined;

  return (
    <FloatingPanelFrame>
      <React.Activity mode={hasHeader ? "visible" : "hidden"}>
        <FloatingPanelHeader
          style={{
            padding: `${FLOATING_PANEL_HEADER_PADDING_Y} ${FLOATING_PANEL_HEADER_PADDING_X}`,
            gap: FLOATING_PANEL_GAP,
          }}
        >
          <FloatingPanelTitle>{header?.title}</FloatingPanelTitle>
          <React.Activity mode={shouldShowClose ? "visible" : "hidden"}>
            <FloatingPanelCloseButton onClick={onClose} aria-label="Close modal" style={{ marginLeft: "auto" }} />
          </React.Activity>
        </FloatingPanelHeader>
      </React.Activity>
      <FloatingPanelContent style={{ flex: 1, overflow: "auto", ...contentStyle }}>{children}</FloatingPanelContent>
    </FloatingPanelFrame>
  );
};

type ModalContentRendererProps = ModalContentProps & {
  chrome: boolean;
};

const ModalContentRenderer: React.FC<ModalContentRendererProps> = ({ chrome, children, ...chromeProps }) => {
  if (chrome) {
    return <ModalContentWithChrome {...chromeProps}>{children}</ModalContentWithChrome>;
  }
  return <>{children}</>;
};

/**
 * Modal component for displaying centered dialogs.
 * Uses native <dialog> element for proper accessibility and top-layer rendering.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   header={{ title: "Settings" }}
 * >
 *   <form>
 *     <input type="text" placeholder="Name" />
 *     <button type="submit">Save</button>
 *   </form>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  header,
  width,
  height,
  maxWidth,
  maxHeight,
  chrome = true,
  dismissible = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  returnFocus = true,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  transitionMode = "css",
  transitionDuration,
  transitionEasing,
  contentStyle: propContentStyle,
  swipeDismissible,
  openDirection = "center",
  useViewTransition = false,
}) => {
  const computedStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = { ...modalContentStyle };

    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }
    if (maxWidth !== undefined) {
      style.maxWidth = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
    }
    if (maxHeight !== undefined) {
      style.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
    }

    return style;
  }, [width, height, maxWidth, maxHeight]);

  const effectiveAriaLabel = ariaLabel ?? header?.title ?? "Modal";

  return (
    <DialogContainer
      visible={visible}
      onClose={onClose}
      position="center"
      dismissible={dismissible}
      closeOnEscape={closeOnEscape}
      preventBodyScroll={preventBodyScroll}
      returnFocus={returnFocus}
      ariaLabel={effectiveAriaLabel}
      ariaLabelledBy={ariaLabelledBy}
      ariaDescribedBy={ariaDescribedBy}
      transitionMode={transitionMode}
      transitionDuration={transitionDuration}
      transitionEasing={transitionEasing}
      swipeDismissible={swipeDismissible}
      openDirection={openDirection}
      useViewTransition={useViewTransition}
    >
      <div style={computedStyle}>
        <ModalContentRenderer
          chrome={chrome}
          header={header}
          dismissible={dismissible}
          onClose={onClose}
          contentStyle={propContentStyle}
        >
          {children}
        </ModalContentRenderer>
      </div>
    </DialogContainer>
  );
};

Modal.displayName = "Modal";
