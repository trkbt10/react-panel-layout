/**
 * @file Router-like builder for GridLayout
 *
 * Provides a React Router–style configuration API to declare panel layers.
 * Converts route objects to the existing GridLayout props without magic.
 */
import * as React from "react";
import type {
  DrawerBehavior,
  FloatingWindowConfig,
  LayerDefinition,
  LayerPositionMode,
  PanelLayoutConfig,
  PanelLayoutProps,
  WindowPosition,
} from "../types";
import { GridLayout } from "../components/grid/GridLayout";

export type PanelRoute = {
  /** Unique id for the layer. Required. */
  id: string;
  /** React node to render for this layer. Required. */
  element: React.ReactNode;
  /** Visibility flag. Defaults to visible. */
  visible?: boolean;

  /**
   * Grid placement key. When using `positionMode: 'grid'` (default), this must be provided.
   * Using `area` mirrors React Router's route path intent but for grid cells.
   */
  area?: string;

  /** Explicit positioning mode; defaults to 'grid' unless floating/drawer implies otherwise. */
  positionMode?: LayerPositionMode;
  /** Offsets when using non-grid modes. */
  position?: WindowPosition;
  /** Optional stacking order. */
  zIndex?: number;
  /** Optional dimensions; required for resizable/draggable floating layers. */
  width?: number | string;
  height?: number | string;
  /** Pointer events control. */
  pointerEvents?: boolean | "auto" | "none";
  /** Optional style overrides. */
  style?: React.CSSProperties;
  /** Optional backdrop style (drawer). */
  backdropStyle?: React.CSSProperties;

  /** Drawer behavior for mobile-friendly panels. */
  drawer?: DrawerBehavior;
  /** Floating window configuration. */
  floating?: FloatingWindowConfig;

  /**
   * Optional child declarations; purely a grouping convenience.
   * Children are flattened; no implicit inheritance.
   */
  children?: PanelRoute[];
};

const toLayer = (route: PanelRoute): LayerDefinition => {
  const inferredMode: LayerPositionMode = resolveRoutePositionMode(route);

  if (inferredMode === "grid") {
    if (!route.area) {
      throw new Error(`PanelRoute ${route.id} must specify 'area' for grid placement.`);
    }
  }

  return {
    id: route.id,
    component: route.element,
    visible: route.visible,
    gridArea: route.area,
    positionMode: inferredMode,
    position: route.position,
    zIndex: route.zIndex,
    width: route.width,
    height: route.height,
    pointerEvents: route.pointerEvents,
    style: route.style,
    drawer: route.drawer,
    floating: route.floating,
    backdropStyle: route.backdropStyle,
  } satisfies LayerDefinition;
};

const resolveRoutePositionMode = (route: PanelRoute): LayerPositionMode => {
  if (route.positionMode) {
    return route.positionMode;
  }
  if (route.floating) {
    // Embedded => absolute, Popup => relative (handled by renderer); keep explicitness here.
    return "absolute";
  }
  if (route.drawer) {
    return "grid";
  }
  return "grid";
};

const flattenRoutes = (routes: PanelRoute[]): PanelRoute[] => {
  const result: PanelRoute[] = [];
  const walk = (node: PanelRoute): void => {
    result.push(node);
    if (node.children) {
      node.children.forEach((child) => walk(child));
    }
  };
  routes.forEach((r) => walk(r));
  return result;
};

const validateUniqueIds = (routes: PanelRoute[]): void => {
  const seen = new Set<string>();
  routes.forEach((r) => {
    if (seen.has(r.id)) {
      throw new Error(`Duplicate PanelRoute id detected: ${r.id}`);
    }
    seen.add(r.id);
  });
};

export const buildLayersFromRoutes = (routes: PanelRoute[]): LayerDefinition[] => {
  const flat = flattenRoutes(routes);
  validateUniqueIds(flat);
  return flat.map((r) => toLayer(r));
};

export const createPanelLayoutFromRoutes = (input: {
  config: PanelLayoutConfig;
  routes: PanelRoute[];
  style?: React.CSSProperties;
}): PanelLayoutProps => {
  const layers = buildLayersFromRoutes(input.routes);
  return {
    config: input.config,
    layers,
  };
};

export type PanelLayoutRouterProps = {
  config: PanelLayoutConfig;
  routes: PanelRoute[];
  style?: React.CSSProperties;
};

export const PanelLayoutRouter: React.FC<PanelLayoutRouterProps> = ({ config, routes, style }) => {
  const layers = React.useMemo(() => buildLayersFromRoutes(routes), [routes]);
  return <GridLayout config={config} layers={layers} style={style} />;
};
