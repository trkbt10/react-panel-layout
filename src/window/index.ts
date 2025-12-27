/**
 * @file Window entry point - Floating window and drawer components
 * @packageDocumentation
 *
 * This is a subpath export entry point for `react-panel-layout/window`.
 *
 * ## Overview
 * Window provides floating panels, drawers, and dialog overlays for modal
 * and non-modal UI patterns. Supports draggable windows, slide-in drawers,
 * and popup portals.
 *
 * ## Installation
 * ```ts
 * import { Drawer, FloatingWindow, useDrawerState } from "react-panel-layout/window";
 * ```
 *
 * ## Drawer Usage
 * ```tsx
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Open Drawer</button>
 *       <Drawer
 *         id="settings"
 *         config={{ anchor: 'right', header: { title: 'Settings' } }}
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *       >
 *         <SettingsPanel />
 *       </Drawer>
 *     </>
 *   );
 * }
 * ```
 *
 * ## Floating Window Usage
 * ```tsx
 * <FloatingWindow
 *   id="inspector"
 *   config={{
 *     draggable: true,
 *     chrome: true,
 *     header: { title: 'Inspector', showCloseButton: true },
 *   }}
 *   onClose={handleClose}
 * >
 *   <InspectorContent />
 * </FloatingWindow>
 * ```
 */

// Components
export { FloatingWindow } from "../components/window/FloatingWindow.js";
export { Drawer } from "../components/window/Drawer.js";
export { DrawerLayers } from "../components/window/DrawerLayers.js";
export { DialogOverlay } from "../components/window/DialogOverlay.js";
export { PopupLayerPortal } from "../components/window/PopupLayerPortal.js";

// Hooks
export { useFloatingState } from "../modules/window/useFloatingState.js";
export { useDrawerState } from "../modules/window/useDrawerState.js";

// Types
export type { FloatingWindowProps } from "../components/window/FloatingWindow.js";
export type { DrawerProps } from "../components/window/Drawer.js";
