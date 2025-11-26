/**
 * @file PanelContentDeclaration (JSX DSL for content configuration ONLY)
 *
 * IMPORTANT: This file declares a JSX DSL to configure panel "content" and layout
 * tracks. It does NOT implement grid rendering, resizing, dragging, or drawers.
 * Those behaviors live in the existing layout/rendering modules. Keep this file
 * limited to declaration and conversion into GridLayout props.
 *
 * Usage (content declaration):
 * <PanelLayout>
 *   <Config>
 *     <Rows>...</Rows>
 *     <Columns>...</Columns>
 *     <Areas matrix={...}/>
 *   </Config>
 *   <Panel type="grid" id="main" area="main">...</Panel>
 *   <Panel type="floating" id="preview" position={{ left: 0, top: 0 }} width={300} height={200} />
 *   <Panel type="drawer" id="nav" drawer={{ defaultOpen: true }} position={{ left: 0 }} />
 * </PanelLayout>
 */
import * as React from "react";
import { GridLayout } from "../components/grid/GridLayout";
import type { DrawerBehavior, GridTrack, PanelLayoutConfig, WindowPosition } from "../types";
import type { PanelRoute } from "./panelRouter";
import { buildLayersFromRoutes } from "./panelRouter";

export type PanelRootProps = {
  config?: PanelLayoutConfig;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

// Unified child declaration: <Panel type="grid" .../> or <Panel type="floating" .../>...
type PanelCommonProps = {
  id: string;
  visible?: boolean;
  zIndex?: number;
  width?: number | string;
  height?: number | string;
  pointerEvents?: boolean | "auto" | "none";
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type PanelProps =
  | (PanelCommonProps & { type: "grid"; area: string })
  | (PanelCommonProps & {
      type: "floating";
      position: WindowPosition;
      width: number | string;
      height: number | string;
      draggable?: boolean;
      resizable?: boolean;
    })
  | (PanelCommonProps & {
      type: "drawer";
      drawer: DrawerBehavior;
      position?: WindowPosition;
      backdropStyle?: React.CSSProperties;
    })
  | (Omit<PanelCommonProps, "children"> & {
      type: "pivot";
      area: string;
      /** Currently active item ID (controlled mode) */
      activeId?: string;
      /** Default active item ID (uncontrolled mode) */
      defaultActiveId?: string;
      /** Callback when active item changes */
      onActiveChange?: (id: string) => void;
      children?: React.ReactNode;
    });

export const Panel: React.FC<PanelProps> = () => null;

/**
 * PivotItem declaration for use inside <Panel type="pivot">
 */
export type PivotItemDeclProps = {
  id: string;
  label?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export const PivotItem: React.FC<PivotItemDeclProps> = () => null;

const isElementOf = <P,>(element: unknown, component: React.FC<P>): element is React.ReactElement<P> => {
  if (!React.isValidElement<P>(element)) {
    return false;
  }
  return element.type === component;
};

export const buildRoutesFromChildren = (children: React.ReactNode): PanelRoute[] => {
  const routes: PanelRoute[] = [];

  const visit = (node: React.ReactNode): void => {
    if (node === null || node === undefined || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    // Unified <Panel type="..." />
    if (isElementOf(node, Panel)) {
      const props = node.props as PanelProps;
      if (!props.id) {
        throw new Error("<Panel> requires an 'id' prop.");
      }
      if (props.type === "grid") {
        if (!props.area) {
          throw new Error(`<Panel id="${props.id}"> requires an explicit 'area' prop when type="grid".`);
        }
        routes.push({
          id: props.id,
          area: props.area,
          element: props.children ?? null,
          visible: props.visible,
          zIndex: props.zIndex,
          width: props.width,
          height: props.height,
          pointerEvents: props.pointerEvents,
          style: props.style,
        });
        return;
      }
      if (props.type === "floating") {
        if (!props.position) {
          throw new Error(`<Panel id="${props.id}"> requires a 'position' prop when type="floating".`);
        }
        if (props.width === undefined || props.height === undefined) {
          throw new Error(`<Panel id="${props.id}"> requires 'width' and 'height' when type="floating".`);
        }
        routes.push({
          id: props.id,
          element: props.children ?? null,
          visible: props.visible ?? true,
          positionMode: "absolute",
          position: props.position,
          zIndex: props.zIndex,
          width: props.width,
          height: props.height,
          pointerEvents: props.pointerEvents,
          style: props.style,
          floating: { mode: "embedded", draggable: props.draggable, resizable: props.resizable },
        });
        return;
      }
      if (props.type === "drawer") {
        routes.push({
          id: props.id,
          element: props.children ?? null,
          visible: props.visible ?? true,
          positionMode: "relative",
          position: props.position,
          zIndex: props.zIndex,
          width: props.width,
          height: props.height,
          pointerEvents: props.pointerEvents,
          style: props.style,
          drawer: props.drawer,
          backdropStyle: props.backdropStyle,
        });
        return;
      }
      if (props.type === "pivot") {
        if (!props.area) {
          throw new Error(`<Panel id="${props.id}"> requires an explicit 'area' prop when type="pivot".`);
        }
        const pivotItems = collectPivotItems(props.children);
        if (pivotItems.length === 0) {
          throw new Error(`<Panel id="${props.id}"> requires at least one <PivotItem> child when type="pivot".`);
        }
        routes.push({
          id: props.id,
          area: props.area,
          element: null,
          visible: props.visible,
          zIndex: props.zIndex,
          width: props.width,
          height: props.height,
          pointerEvents: props.pointerEvents,
          style: props.style,
          pivot: {
            items: pivotItems,
            activeId: props.activeId,
            defaultActiveId: props.defaultActiveId,
            onActiveChange: props.onActiveChange,
          },
        });
        return;
      }
      // unknown type -> error for explicitness
      throw new Error("<Panel> has unsupported type.");
    }

    if (React.isValidElement(node)) {
      if (node.type === React.Fragment) {
        const el = node as React.ReactElement<{ children?: React.ReactNode }>;
        visit(el.props.children);
        return;
      }
      // Unknown element: ignore quietly to allow comments/wrappers.
      return;
    }
    // Primitive nodes (string/number) are ignored.
  };

  visit(children);
  return routes;
};

// Root container renamed to PanelLayout to avoid name collision with child <Panel/>
export const PanelLayout: React.FC<PanelRootProps> = ({ config, style, children }) => {
  const routes = React.useMemo(() => buildRoutesFromChildren(children), [children]);
  const layers = React.useMemo(() => buildLayersFromRoutes(routes), [routes]);
  const derivedConfig = React.useMemo(() => {
    if (config) {
      return config;
    }
    const built = buildConfigFromChildren(children);
    if (!built) {
      throw new Error("Panel requires either 'config' prop or a JSX config (<Config><Rows/><Columns/><Areas/></Config>). ");
    }
    return built;
  }, [children, config]);
  return <GridLayout config={derivedConfig} layers={layers} style={style} />;
};

// =============================
// JSX Config Declarations
// =============================

export type ConfigProps = {
  gap?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const Config: React.FC<ConfigProps> = () => {
  return null;
};

export const Rows: React.FC<{ children?: React.ReactNode }> = () => {
  return null;
};

export const Columns: React.FC<{ children?: React.ReactNode }> = () => {
  return null;
};

export type RowProps = GridTrack;
export const Row: React.FC<RowProps> = () => {
  return null;
};

export type ColumnProps = GridTrack;
export const Col: React.FC<ColumnProps> = () => {
  return null;
};

export type AreasProps = {
  matrix: string[][];
};
export const Areas: React.FC<AreasProps> = () => {
  return null;
};

type CollectedConfig = {
  gap?: string;
  style?: React.CSSProperties;
  rows?: GridTrack[];
  columns?: GridTrack[];
  areas?: string[][];
};

const collectTracks = <P extends GridTrack>(children: React.ReactNode, marker: React.FC<P>): GridTrack[] => {
  const result: GridTrack[] = [];
  const visit = (node: React.ReactNode): void => {
    if (node === null || node === undefined || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (isElementOf(node, marker)) {
      const props = node.props as P;
      if (!props.size) {
        throw new Error("Row/Col requires 'size' property.");
      }
      result.push({
        size: props.size,
        resizable: props.resizable,
        minSize: props.minSize,
        maxSize: props.maxSize,
      });
      return;
    }
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      visit(el.props.children);
    }
  };
  visit(children);
  return result;
};

const collectConfigBlock = (children: React.ReactNode): CollectedConfig | null => {
  const node = findFirst(children, Config);
  if (!node) {
    return null;
  }
  const props = node.props as ConfigProps;
  const rows = collectTracks(node.props.children, Row);
  const columns = collectTracks(node.props.children, Col);
  const areasNode = findFirst(node.props.children, Areas);
  const areas = areasNode ? (areasNode.props as AreasProps).matrix : undefined;
  return {
    gap: props.gap,
    style: props.style,
    rows,
    columns,
    areas,
  };
};

const findFirst = <P,>(children: React.ReactNode, marker: React.FC<P>): React.ReactElement<P> | null => {
  const visit = (node: React.ReactNode): React.ReactElement<P> | null => {
    if (node === null || node === undefined || typeof node === "boolean") {
      return null;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = visit(item);
        if (found) {
          return found;
        }
      }
      return null;
    }
    if (isElementOf(node, marker)) {
      return node as React.ReactElement<P>;
    }
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      return visit(el.props.children);
    }
    return null;
  };
  return visit(children);
};

type CollectedPivotItem = {
  id: string;
  label?: string;
  content: React.ReactNode;
  disabled?: boolean;
};

const collectPivotItems = (children: React.ReactNode): CollectedPivotItem[] => {
  const items: CollectedPivotItem[] = [];
  const visit = (node: React.ReactNode): void => {
    if (node === null || node === undefined || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (isElementOf(node, PivotItem)) {
      const props = node.props as PivotItemDeclProps;
      if (!props.id) {
        throw new Error("<PivotItem> requires an 'id' prop.");
      }
      items.push({
        id: props.id,
        label: props.label,
        content: props.children ?? null,
        disabled: props.disabled,
      });
      return;
    }
    if (React.isValidElement(node)) {
      if (node.type === React.Fragment) {
        const el = node as React.ReactElement<{ children?: React.ReactNode }>;
        visit(el.props.children);
      }
    }
  };
  visit(children);
  return items;
};

export const buildConfigFromChildren = (children: React.ReactNode): PanelLayoutConfig | null => {
  const collected = collectConfigBlock(children);
  if (!collected) {
    return null;
  }
  if (!collected.rows || collected.rows.length === 0) {
    throw new Error("Config must include at least one <Row size=...> inside <Config>.");
  }
  if (!collected.columns || collected.columns.length === 0) {
    throw new Error("Config must include at least one <Col size=...> inside <Config>.");
  }
  if (!collected.areas || collected.areas.length === 0) {
    throw new Error("Config must include <Areas matrix={...}> inside <Config>.");
  }

  const rowCount = collected.areas.length;
  const colCount = collected.areas[0]?.length ?? 0;
  if (rowCount !== collected.rows.length) {
    throw new Error(`Areas row count (${rowCount}) must match Rows count (${collected.rows.length}).`);
  }
  if (colCount !== collected.columns.length) {
    throw new Error(`Areas column count (${colCount}) must match Columns count (${collected.columns.length}).`);
  }

  return {
    areas: collected.areas,
    rows: collected.rows,
    columns: collected.columns,
    gap: collected.gap,
    style: collected.style,
  } satisfies PanelLayoutConfig;
};
