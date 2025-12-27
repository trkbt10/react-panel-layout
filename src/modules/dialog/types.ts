/**
 * @file Dialog module type definitions
 */
import type * as React from "react";
import type { Position } from "../../types";

/**
 * Transition mode for dialog animations
 */
export type DialogTransitionMode = "none" | "css";

/**
 * Base props for DialogContainer component
 */
export type DialogContainerProps = {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Dialog content */
  children: React.ReactNode;
  /** Position: 'center' for screen center, or Position for absolute coordinates */
  position?: "center" | Position;
  /** Whether clicking backdrop closes the dialog */
  dismissible?: boolean;
  /** Whether pressing Escape closes the dialog */
  closeOnEscape?: boolean;
  /** Whether to prevent body scroll when open */
  preventBodyScroll?: boolean;
  /** Whether to return focus to previous element on close */
  returnFocus?: boolean;
  /** Aria label for the dialog */
  ariaLabel?: string;
  /** ID of element that labels the dialog */
  ariaLabelledBy?: string;
  /** ID of element that describes the dialog */
  ariaDescribedBy?: string;
  /** Transition mode */
  transitionMode?: DialogTransitionMode;
  /** Transition duration (CSS value, e.g. '200ms') */
  transitionDuration?: string;
  /** Transition easing (CSS value, e.g. 'ease-out') */
  transitionEasing?: string;
};

/**
 * Header configuration for Modal
 */
export type ModalHeader = {
  /** Title displayed in the header */
  title: string;
  /** Whether to show close button (default: true) */
  showCloseButton?: boolean;
};

/**
 * Props for Modal component
 */
export type ModalProps = Omit<DialogContainerProps, "position"> & {
  /** Header configuration */
  header?: ModalHeader;
  /** Modal width */
  width?: string | number;
  /** Modal height */
  height?: string | number;
  /** Max width (default: 90vw) */
  maxWidth?: string | number;
  /** Max height (default: 85vh) */
  maxHeight?: string | number;
  /** Whether to use FloatingPanelFrame chrome (default: true) */
  chrome?: boolean;
  /** Custom content style */
  contentStyle?: React.CSSProperties;
};

/**
 * Options for alert dialog
 */
export type AlertOptions = {
  /** Optional title */
  title?: string;
  /** Message to display */
  message: string;
  /** OK button label (default: 'OK') */
  okLabel?: string;
};

/**
 * Options for confirm dialog
 */
export type ConfirmOptions = AlertOptions & {
  /** Confirm button label (default: 'OK') */
  confirmLabel?: string;
  /** Cancel button label (default: 'Cancel') */
  cancelLabel?: string;
};

/**
 * Options for prompt dialog
 */
export type PromptOptions = ConfirmOptions & {
  /** Default input value */
  defaultValue?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Input type (default: 'text') */
  inputType?: "text" | "password" | "email" | "number";
};

/**
 * Internal state for dialog queue
 */
export type DialogQueueItem =
  | { type: "alert"; options: AlertOptions; resolve: (value: void) => void }
  | { type: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { type: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };

/**
 * Return type of useDialog hook
 */
export type UseDialogReturn = {
  /** Show an alert dialog */
  alert: (options: AlertOptions | string) => Promise<void>;
  /** Show a confirm dialog */
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  /** Show a prompt dialog */
  prompt: (options: PromptOptions | string) => Promise<string | null>;
  /** Outlet component to render dialogs */
  Outlet: React.FC;
};

/**
 * Props for AlertDialog component (internal)
 */
export type AlertDialogProps = {
  /** Dialog type */
  type: "alert" | "confirm" | "prompt";
  /** Whether the dialog is visible */
  visible: boolean;
  /** Title */
  title?: string;
  /** Message */
  message: string;
  /** OK/Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Placeholder for prompt input */
  placeholder?: string;
  /** Default value for prompt input */
  defaultValue?: string;
  /** Input type for prompt */
  inputType?: "text" | "password" | "email" | "number";
  /** Callback for confirm/OK action */
  onConfirm: (value?: string) => void;
  /** Callback for cancel action */
  onCancel: () => void;
};
