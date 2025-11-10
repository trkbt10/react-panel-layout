/**
 * @file Connected split handles overlay.
 */
import * as React from "react";
import type { PanelTree } from "../../panels/state/types";
import type { NodePath, PathSegment } from "../../panels/state/tree/logic";
import { isGroup } from "../../panels/state/tree/logic";
import { usePanelState } from "../../panels/state/StateContext";
import { useTree } from "../../panels/state/tree/Context";
import { ResizeHandle } from "../../../components/resizer/ResizeHandle";

type Rect = { x: number; y: number; w: number; h: number };

type Handle = {
  path: NodePath;
  direction: "vertical" | "horizontal";
  parentRect: Rect;
  linePos: number;
};

const collectHandles = (node: PanelTree, path: NodePath, rect: Rect, acc: Handle[]): Handle[] => {
  if (isGroup(node)) {
    return acc;
  }
  const direction = node.direction;
  const linePos = direction === "vertical" ? rect.x + rect.w * node.ratio : rect.y + rect.h * node.ratio;
  acc.push({ path, direction, parentRect: rect, linePos });
  if (direction === "vertical") {
    const wA = rect.w * node.ratio;
    const wB = rect.w - wA;
    collectHandles(node.a, [...path, "a" as PathSegment], { x: rect.x, y: rect.y, w: wA, h: rect.h }, acc);
    collectHandles(node.b, [...path, "b" as PathSegment], { x: rect.x + wA, y: rect.y, w: wB, h: rect.h }, acc);
    return acc;
  }
  const hA = rect.h * node.ratio;
  const hB = rect.h - hA;
  collectHandles(node.a, [...path, "a" as PathSegment], { x: rect.x, y: rect.y, w: rect.w, h: hA }, acc);
  collectHandles(node.b, [...path, "b" as PathSegment], { x: rect.x, y: rect.y + hA, w: rect.w, h: hB }, acc);
  return acc;
};

export type PanelSplitHandlesProps = { containerRef: React.RefObject<HTMLDivElement | null> };

export const PanelSplitHandles: React.FC<PanelSplitHandlesProps> = ({ containerRef }) => {
  const { state } = usePanelState();
  const { adjustSplitRatio } = useTree();

  const handles = React.useMemo(() => collectHandles(state.tree, [], { x: 0, y: 0, w: 100, h: 100 }, []), [state.tree]);

  const renderHandle = (handle: Handle, index: number): React.ReactNode => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      return null;
    }
    const parentPx = {
      left: containerRect.left + (containerRect.width * handle.parentRect.x) / 100,
      top: containerRect.top + (containerRect.height * handle.parentRect.y) / 100,
      width: (containerRect.width * handle.parentRect.w) / 100,
      height: (containerRect.height * handle.parentRect.h) / 100,
    };

    const thickness = "var(--rpl-size-split-handle-thickness, 6px)";

    if (handle.direction === "vertical") {
      const x = parentPx.left + (parentPx.width * (handle.linePos - handle.parentRect.x)) / handle.parentRect.w;
      const style: React.CSSProperties = {
        position: "fixed",
        left: `calc(${Math.round(x)}px - ${thickness} / 2)`,
        top: Math.round(parentPx.top),
        width: thickness,
        height: Math.round(parentPx.height),
        cursor: "col-resize",
        pointerEvents: "auto",
      };
      const onResize = (delta: number): void => {
        const containerRectNow = containerRef.current?.getBoundingClientRect();
        if (!containerRectNow) {
          return;
        }
        const parentWidth = (containerRectNow.width * handle.parentRect.w) / 100;
        const dRatio = parentWidth === 0 ? 0 : delta / parentWidth;
        adjustSplitRatio({ path: handle.path, deltaRatio: dRatio });
      };
      return (
        <div key={`split-${index}`} style={style}>
          <ResizeHandle direction="vertical" onResize={onResize} />
        </div>
      );
    }

    const y = parentPx.top + (parentPx.height * (handle.linePos - handle.parentRect.y)) / handle.parentRect.h;
    const style: React.CSSProperties = {
      position: "fixed",
      left: Math.round(parentPx.left),
      top: `calc(${Math.round(y)}px - ${thickness} / 2)`,
      width: Math.round(parentPx.width),
      height: thickness,
      cursor: "row-resize",
      pointerEvents: "auto",
    };
    const onResize = (delta: number): void => {
      const containerRectNow = containerRef.current?.getBoundingClientRect();
      if (!containerRectNow) {
        return;
      }
      const parentHeight = (containerRectNow.height * handle.parentRect.h) / 100;
      const dRatio = parentHeight === 0 ? 0 : delta / parentHeight;
      adjustSplitRatio({ path: handle.path, deltaRatio: dRatio });
    };
    return (
      <div key={`split-${index}`} style={style}>
        <ResizeHandle direction="horizontal" onResize={onResize} />
      </div>
    );
  };

  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>{handles.map((h, idx) => renderHandle(h, idx))}</div>;
};
