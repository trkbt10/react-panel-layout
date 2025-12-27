/**
 * @file Alert, Confirm, Prompt dialog demo
 */
import * as React from "react";
import { useDialog } from "../../../../modules/dialog/useDialog";
import { DemoButton } from "../../../components/ui/DemoButton";
import styles from "./DialogDemos.module.css";

export const AlertDialogDemo: React.FC = () => {
  const { alert, confirm, prompt, Outlet } = useDialog();
  const [lastResult, setLastResult] = React.useState<string>("");

  const handleAlert = async () => {
    await alert({
      title: "Information",
      message: "This is an alert dialog. It displays information and waits for acknowledgment.",
      okLabel: "Got it",
    });
    setLastResult("alert: acknowledged");
  };

  const handleConfirm = async () => {
    const result = await confirm({
      title: "Confirm Action",
      message: "Are you sure you want to proceed? This action cannot be undone.",
      confirmLabel: "Proceed",
      cancelLabel: "Cancel",
    });
    setLastResult(`confirm: ${result ? "confirmed" : "cancelled"}`);
  };

  const handlePrompt = async () => {
    const result = await prompt({
      title: "Enter Name",
      message: "Please enter your name:",
      placeholder: "John Doe",
      defaultValue: "",
    });
    setLastResult(`prompt: ${result === null ? "cancelled" : `"${result}"`}`);
  };

  const handlePasswordPrompt = async () => {
    const result = await prompt({
      title: "Enter Password",
      message: "Please enter your password:",
      inputType: "password",
      confirmLabel: "Submit",
    });
    setLastResult(`password prompt: ${result === null ? "cancelled" : "(password entered)"}`);
  };

  const handleSequence = async () => {
    await alert("First, let me explain...");

    const proceed = await confirm({
      message: "Would you like to continue with the setup?",
      confirmLabel: "Yes",
      cancelLabel: "No",
    });

    if (!proceed) {
      setLastResult("sequence: cancelled at step 2");
      return;
    }

    const name = await prompt({
      message: "What is your name?",
      defaultValue: "Anonymous",
    });

    if (name === null) {
      setLastResult("sequence: cancelled at step 3");
      return;
    }

    await alert(`Hello, ${name}! Setup complete.`);
    setLastResult(`sequence: completed with name "${name}"`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3>Alert Dialog</h3>
        <p>Simple information dialog that waits for acknowledgment.</p>
        <DemoButton variant="primary" size="md" onClick={handleAlert}>
          Show Alert
        </DemoButton>
      </div>

      <div className={styles.section}>
        <h3>Confirm Dialog</h3>
        <p>Yes/No dialog that returns a boolean result.</p>
        <DemoButton variant="primary" size="md" onClick={handleConfirm}>
          Show Confirm
        </DemoButton>
      </div>

      <div className={styles.section}>
        <h3>Prompt Dialog</h3>
        <p>Input dialog that returns the entered value or null if cancelled.</p>
        <div className={styles.buttonGroup}>
          <DemoButton variant="primary" size="md" onClick={handlePrompt}>
            Show Prompt
          </DemoButton>
          <DemoButton variant="secondary" size="md" onClick={handlePasswordPrompt}>
            Password Prompt
          </DemoButton>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Dialog Sequence</h3>
        <p>Chain multiple dialogs together using async/await.</p>
        <DemoButton variant="primary" size="md" onClick={handleSequence}>
          Start Sequence
        </DemoButton>
      </div>

      {lastResult ? <div className={styles.resultBox}>Last result: {lastResult}</div> : null}

      <Outlet />
    </div>
  );
};
