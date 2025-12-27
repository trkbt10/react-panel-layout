/**
 * @file Modal basics demo
 */
import * as React from "react";
import { Modal } from "../../../../modules/dialog/Modal";
import { DemoButton } from "../../../components/ui/DemoButton";
import styles from "./DialogDemos.module.css";

export const ModalBasics: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3>Basic Modal</h3>
        <p>A simple modal dialog centered on the screen. Click outside or press Escape to close.</p>
        <DemoButton variant="primary" size="md" onClick={() => setIsOpen(true)}>
          Open Modal
        </DemoButton>
      </div>

      <Modal visible={isOpen} onClose={() => setIsOpen(false)} header={{ title: "Settings" }}>
        <div className={styles.modalContent}>
          <p>This is a modal dialog. It uses the native HTML dialog element to ensure it appears above all other content.</p>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input type="text" placeholder="Enter username" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" placeholder="Enter email" className={styles.input} />
          </div>
          <div className={styles.buttonRow}>
            <DemoButton variant="secondary" size="md" onClick={() => setIsOpen(false)}>
              Cancel
            </DemoButton>
            <DemoButton variant="primary" size="md" onClick={() => setIsOpen(false)}>
              Save
            </DemoButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
