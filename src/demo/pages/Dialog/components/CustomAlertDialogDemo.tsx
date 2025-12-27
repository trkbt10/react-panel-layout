/**
 * @file Custom AlertDialog demo - shows how to replace the default dialog component
 */
import * as React from "react";
import { useDialog } from "../../../../modules/dialog/useDialog";
import type { AlertDialogProps } from "../../../../modules/dialog/types";
import { DialogContainer } from "../../../../modules/dialog/DialogContainer";
import { DemoButton } from "../../../components/ui/DemoButton";
import styles from "./DialogDemos.module.css";

/**
 * Custom AlertDialog with a different visual style
 */
const CustomAlertDialog: React.FC<AlertDialogProps> = ({
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

  React.useEffect(() => {
    if (visible) {
      setInputValue(defaultValue);
    }
  }, [visible, defaultValue]);

  const handleConfirm = () => {
    if (type === "prompt") {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  const containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    padding: "24px",
    minWidth: "320px",
    maxWidth: "90vw",
    color: "#fff",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "12px",
  };

  const messageStyle: React.CSSProperties = {
    fontSize: "15px",
    lineHeight: 1.6,
    opacity: 0.9,
    marginBottom: "20px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    fontSize: "15px",
    background: "rgba(255, 255, 255, 0.15)",
    color: "#fff",
    marginBottom: "20px",
    boxSizing: "border-box",
  };

  const buttonRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "transform 0.15s ease, opacity 0.15s ease",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: "#fff",
    color: "#667eea",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  return (
    <DialogContainer
      visible={visible}
      onClose={onCancel}
      position="center"
      dismissible={type !== "alert"}
      closeOnEscape={true}
      ariaLabel={title ?? (type === "prompt" ? "Prompt" : type === "confirm" ? "Confirm" : "Alert")}
    >
      <div style={containerStyle}>
        {title ? <div style={titleStyle}>{title}</div> : null}
        <div style={messageStyle}>{message}</div>
        <React.Activity mode={type === "prompt" ? "visible" : "hidden"}>
          <input
            type={inputType}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
            placeholder={placeholder}
            style={inputStyle}
            autoFocus
          />
        </React.Activity>
        <div style={buttonRowStyle}>
          <React.Activity mode={type !== "alert" ? "visible" : "hidden"}>
            <button type="button" style={secondaryButtonStyle} onClick={onCancel}>
              {cancelLabel}
            </button>
          </React.Activity>
          <button type="button" style={primaryButtonStyle} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </DialogContainer>
  );
};

export const CustomAlertDialogDemo: React.FC = () => {
  const { alert, confirm, prompt, Outlet } = useDialog({
    alertDialogComponent: CustomAlertDialog,
  });
  const [lastResult, setLastResult] = React.useState<string>("");

  const handleAlert = async () => {
    await alert({
      title: "Custom Alert",
      message: "This is a custom-styled alert dialog with gradient background!",
      okLabel: "Awesome!",
    });
    setLastResult("alert: acknowledged");
  };

  const handleConfirm = async () => {
    const result = await confirm({
      title: "Custom Confirm",
      message: "Do you like this custom dialog style?",
      confirmLabel: "Love it!",
      cancelLabel: "Not really",
    });
    setLastResult(`confirm: ${result ? "loved it" : "not really"}`);
  };

  const handlePrompt = async () => {
    const result = await prompt({
      title: "Custom Prompt",
      message: "What's your favorite color?",
      placeholder: "Enter a color...",
      defaultValue: "",
    });
    setLastResult(`prompt: ${result === null ? "cancelled" : `"${result}"`}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3>Custom Alert Dialog Component</h3>
        <p>
          Replace the default AlertDialog with your own component by passing
          <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", margin: "0 4px" }}>
            alertDialogComponent
          </code>
          to useDialog.
        </p>
      </div>

      <div className={styles.section}>
        <h3>Gradient Style Dialogs</h3>
        <p>These dialogs use a custom component with gradient background.</p>
        <div className={styles.buttonGroup}>
          <DemoButton variant="primary" size="md" onClick={handleAlert}>
            Show Custom Alert
          </DemoButton>
          <DemoButton variant="primary" size="md" onClick={handleConfirm}>
            Show Custom Confirm
          </DemoButton>
          <DemoButton variant="primary" size="md" onClick={handlePrompt}>
            Show Custom Prompt
          </DemoButton>
        </div>
      </div>

      {lastResult ? <div className={styles.resultBox}>Last result: {lastResult}</div> : null}

      <Outlet />
    </div>
  );
};
