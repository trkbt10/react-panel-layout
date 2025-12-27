/**
 * @file Resizer entry point - Resize handle components and hooks
 * @packageDocumentation
 *
 * This is a subpath export entry point for `react-panel-layout/resizer`.
 *
 * ## Overview
 * Resizer provides draggable resize handles for creating resizable layouts.
 * Includes both ready-to-use components and a low-level hook for custom implementations.
 *
 * ## Installation
 * ```ts
 * import { ResizeHandle, useResizeDrag } from "react-panel-layout/resizer";
 * ```
 *
 * ## Basic Usage with ResizeHandle
 * ```tsx
 * function ResizableLayout() {
 *   const [width, setWidth] = useState(300);
 *
 *   return (
 *     <div style={{ display: 'flex' }}>
 *       <div style={{ width }}>Left Panel</div>
 *       <ResizeHandle
 *         direction="vertical"
 *         onResize={(delta) => setWidth((w) => w + delta)}
 *       />
 *       <div style={{ flex: 1 }}>Right Panel</div>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Custom Handle with useResizeDrag
 * ```tsx
 * function CustomHandle({ onResize }) {
 *   const { ref, isDragging, onPointerDown } = useResizeDrag({
 *     axis: 'x',
 *     onResize,
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       onPointerDown={onPointerDown}
 *       style={{ cursor: 'col-resize', background: isDragging ? 'blue' : 'gray' }}
 *     />
 *   );
 * }
 * ```
 */

// Hooks
export { useResizeDrag } from "../modules/resizer/useResizeDrag.js";

// Components
export { ResizeHandle } from "../components/resizer/ResizeHandle.js";
export { HorizontalDivider } from "../components/resizer/HorizontalDivider.js";

// Types
export type {
  ResizeDragAxis,
  UseResizeDragOptions,
  UseResizeDragResult,
} from "../modules/resizer/useResizeDrag.js";

export type { ResizeHandleProps } from "../components/resizer/ResizeHandle.js";
export type { HorizontalDividerProps } from "../components/resizer/HorizontalDivider.js";
