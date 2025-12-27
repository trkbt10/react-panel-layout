/**
 * @file AlertDialog component for alert, confirm, and prompt dialogs
 */
import * as React from "react";
import type { AlertDialogProps } from "./types";
import { DialogContainer } from "./DialogContainer";
import {
  FloatingPanelFrame,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelContent,
} from "../../components/paneling/FloatingPanelFrame";
import {
  ALERT_DIALOG_WIDTH,
  ALERT_DIALOG_BUTTON_GAP,
  ALERT_DIALOG_ACTIONS_PADDING,
  ALERT_DIALOG_MESSAGE_PADDING,
  ALERT_DIALOG_INPUT_MARGIN_TOP,
  FLOATING_PANEL_HEADER_PADDING_Y,
  FLOATING_PANEL_HEADER_PADDING_X,
  COLOR_PRIMARY,
  COLOR_NODE_EDITOR_BORDER,
} from "../../constants/styles";

const alertDialogStyle: React.CSSProperties = {
  width: ALERT_DIALOG_WIDTH,
  maxWidth: "90vw",
};

const messageStyle: React.CSSProperties = {
  padding: ALERT_DIALOG_MESSAGE_PADDING,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: ALERT_DIALOG_BUTTON_GAP,
  padding: ALERT_DIALOG_ACTIONS_PADDING,
  borderTop: `1px solid ${COLOR_NODE_EDITOR_BORDER}`,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  marginTop: ALERT_DIALOG_INPUT_MARGIN_TOP,
  border: `1px solid ${COLOR_NODE_EDITOR_BORDER}`,
  borderRadius: "4px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonBaseStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  border: "none",
  transition: "background-color 0.15s ease",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: COLOR_PRIMARY,
  color: "#fff",
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: "transparent",
  border: `1px solid ${COLOR_NODE_EDITOR_BORDER}`,
  color: "inherit",
};

/**
 * Internal component for alert, confirm, and prompt dialogs
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  type,
  visible,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  placeholder,
  defaultValue = "",
  inputType = "text",
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset input value when dialog opens
  React.useEffect(() => {
    if (visible) {
      setInputValue(defaultValue);
    }
  }, [visible, defaultValue]);

  // Focus input when prompt dialog opens
  React.useEffect(() => {
    if (!visible) {
      return;
    }
    if (type !== "prompt") {
      return;
    }
    if (!inputRef.current) {
      return;
    }
    // Small delay to ensure dialog is rendered
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [visible, type]);

  const handleConfirm = React.useCallback(() => {
    if (type === "prompt") {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  }, [type, inputValue, onConfirm]);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleConfirm();
      }
    },
    [handleConfirm],
  );

  // Prevent input events from bubbling up
  const handleInputPointerDown = React.useCallback((event: React.PointerEvent) => {
    event.stopPropagation();
  }, []);

  const computeDialogLabel = (): string => {
    if (title) {
      return title;
    }
    if (type === "prompt") {
      return "Prompt";
    }
    if (type === "confirm") {
      return "Confirm";
    }
    return "Alert";
  };
  const dialogLabel = computeDialogLabel();

  return (
    <DialogContainer
      visible={visible}
      onClose={onCancel}
      position="center"
      dismissible={type !== "alert"}
      closeOnEscape={true}
      ariaLabel={dialogLabel}
    >
      <div style={alertDialogStyle}>
        <FloatingPanelFrame>
          <React.Activity mode={title ? "visible" : "hidden"}>
            <FloatingPanelHeader
              style={{
                padding: `${FLOATING_PANEL_HEADER_PADDING_Y} ${FLOATING_PANEL_HEADER_PADDING_X}`,
              }}
            >
              <FloatingPanelTitle>{title}</FloatingPanelTitle>
            </FloatingPanelHeader>
          </React.Activity>
          <FloatingPanelContent style={{ padding: 0 }}>
            <div style={messageStyle}>
              {message}
              <React.Activity mode={type === "prompt" ? "visible" : "hidden"}>
                <input
                  ref={inputRef}
                  type={inputType}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onPointerDown={handleInputPointerDown}
                  placeholder={placeholder}
                  style={inputStyle}
                  aria-label={placeholder ?? "Input"}
                />
              </React.Activity>
            </div>
            <div style={actionsStyle}>
              <React.Activity mode={type !== "alert" ? "visible" : "hidden"}>
                <button type="button" style={secondaryButtonStyle} onClick={onCancel}>
                  {cancelLabel}
                </button>
              </React.Activity>
              <button type="button" style={primaryButtonStyle} onClick={handleConfirm}>
                {confirmLabel}
              </button>
            </div>
          </FloatingPanelContent>
        </FloatingPanelFrame>
      </div>
    </DialogContainer>
  );
};

AlertDialog.displayName = "AlertDialog";
