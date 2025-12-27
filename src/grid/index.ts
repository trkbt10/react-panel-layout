/**
 * @file Grid entry point - Grid layout components and hooks
 * @packageDocumentation
 *
 * This is a subpath export entry point for `react-panel-layout/grid`.
 *
 * ## Overview
 * Grid provides CSS Grid-based layout components for arranging panels in rows
 * and columns. Supports resizable tracks, draggable layers, and floating windows.
 *
 * ## Installation
 * ```ts
 * import { GridLayout } from "react-panel-layout/grid";
 * ```
 *
 * ## Basic Usage
 * ```tsx
 * const config = {
 *   areas: [
 *     ['sidebar', 'main', 'main'],
 *     ['sidebar', 'main', 'main'],
 *   ],
 *   columns: [{ size: '200px' }, { size: '1fr' }, { size: '1fr' }],
 *   rows: [{ size: '1fr' }, { size: '1fr' }],
 *   gap: '8px',
 * };
 *
 * const layers = [
 *   { id: 'sidebar', component: <Sidebar /> },
 *   { id: 'main', component: <MainContent /> },
 * ];
 *
 * function App() {
 *   return <GridLayout config={config} layers={layers} />;
 * }
 * ```
 *
 * ## Resizable Tracks
 * ```tsx
 * const config = {
 *   columns: [
 *     { size: '200px', resizable: true, minSize: 100, maxSize: 400 },
 *     { size: '1fr' },
 *   ],
 *   // ...
 * };
 * ```
 */

// Components
export { GridLayout } from "../components/grid/GridLayout.js";
export { GridLayerList } from "../components/grid/GridLayerList.js";
export { GridLayerResizeHandles } from "../components/grid/GridLayerResizeHandles.js";
export { GridTrackResizeHandle } from "../components/grid/GridTrackResizeHandle.js";

// Context
export {
  GridLayoutProvider,
  useGridLayoutContext,
} from "../modules/grid/GridLayoutContext.js";

// Hooks
export { useGridPlacements } from "../modules/grid/useGridPlacements.js";
export { useGridTracks } from "../modules/grid/useGridTracks.js";

// Types
export type {
  GridLayerHandleProps,
  ResizeHandleConfig,
  GridLayerRenderState,
  GridLayoutContextValue,
} from "../modules/grid/GridLayoutContext.js";

export type { GridLayoutProps } from "../components/grid/GridLayout.js";
export type { TrackHandleConfig, TrackDirection } from "../modules/grid/useGridTracks.js";
