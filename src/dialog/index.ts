/**
 * @file Dialog entry point - Modal and alert/confirm/prompt dialogs
 * @packageDocumentation
 *
 * This is a subpath export entry point for `react-panel-layout/dialog`.
 *
 * ## Overview
 * Dialog provides modal dialogs and imperative alert/confirm/prompt APIs
 * using native HTML dialog element for proper accessibility and top-layer rendering.
 *
 * ## Installation
 * ```ts
 * import { Modal, useDialog, DialogContainer } from "react-panel-layout/dialog";
 * ```
 *
 * ## Modal Usage
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
 *
 * ## useDialog Hook Usage
 * ```tsx
 * function MyComponent() {
 *   const { alert, confirm, prompt, Outlet } = useDialog();
 *
 *   const handleClick = async () => {
 *     await alert("Hello!");
 *
 *     const confirmed = await confirm({
 *       message: "Are you sure?",
 *       confirmLabel: "Yes",
 *       cancelLabel: "No",
 *     });
 *
 *     if (confirmed) {
 *       const name = await prompt({
 *         message: "Enter your name:",
 *         defaultValue: "Anonymous",
 *       });
 *       console.log("Name:", name);
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleClick}>Show dialogs</button>
 *       <Outlet />
 *     </>
 *   );
 * }
 * ```
 */

// Components
export { Modal } from "../modules/dialog/Modal.js";
export { DialogContainer } from "../modules/dialog/DialogContainer.js";
export { AlertDialog } from "../modules/dialog/AlertDialog.js";

// Hooks
export { useDialog } from "../modules/dialog/useDialog.js";
export { useDialogContainer } from "../modules/dialog/useDialogContainer.js";

// Types
export type {
  ModalProps,
  ModalHeader,
  DialogContainerProps,
  DialogTransitionMode,
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
  AlertDialogProps,
  UseDialogReturn,
} from "../modules/dialog/types.js";
