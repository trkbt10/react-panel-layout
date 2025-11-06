/**
 * @file Overlay draggable handles to adjust split ratios directly on the panel tree.
 */
import * as React from "react";
import type { PanelTree } from "../../modules/panels/core/types";
import type { PathSegment, NodePath } from "../../modules/panels/core/tree";
import { setSplitRatio, getAtPath, isGroup } from "../../modules/panels/core/tree";
import { usePanelState } from "../../modules/panels/context/StateContext";
import { ResizeHandle } from "../resizer/ResizeHandle";

type Rect = { x: number; y: number; w: number; h: number }; // percentages in [0..100]

type Handle = {
  path: NodePath;
  direction: "vertical" | "horizontal";
  parentRect: Rect; // percent rect of split parent
  linePos: number; // percent coordinate from left/top within parent (x for vertical, y for horizontal)
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

export const PanelSplitHandles: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
  const { state, setState } = usePanelState();

  const handles = React.useMemo(() => {
    return collectHandles(state.tree, [], { x: 0, y: 0, w: 100, h: 100 }, []);
  }, [state.tree]);

  const renderHandle = (h: Handle, i: number): React.ReactNode => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      return null;
    }
    const parentPx = {
      left: containerRect.left + (containerRect.width * h.parentRect.x) / 100,
      top: containerRect.top + (containerRect.height * h.parentRect.y) / 100,
      width: (containerRect.width * h.parentRect.w) / 100,
      height: (containerRect.height * h.parentRect.h) / 100,
    };
    const thickness = 6;

    if (h.direction === "vertical") {
      const x = parentPx.left + (parentPx.width * (h.linePos - h.parentRect.x)) / h.parentRect.w;
      const style: React.CSSProperties = {
        position: "fixed",
        left: Math.round(x - thickness / 2),
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
        setState((prev) => {
          const parentWidth = (containerRectNow.width * h.parentRect.w) / 100;
          const dRatio = parentWidth === 0 ? 0 : delta / parentWidth;
          const node = getAtPath(prev.tree, h.path);
          if (isGroup(node)) {
            return prev;
          }
          const nextTree = setSplitRatio(prev.tree, h.path, node.ratio + dRatio);
          return { ...prev, tree: nextTree };
        });
      };
      return (
        <div key={`h-${i}`} style={style}>
          <ResizeHandle direction="vertical" onResize={onResize} />
        </div>
      );
    }

    const y = parentPx.top + (parentPx.height * (h.linePos - h.parentRect.y)) / h.parentRect.h;
    const style: React.CSSProperties = {
      position: "fixed",
      left: Math.round(parentPx.left),
      top: Math.round(y - thickness / 2),
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
      setState((prev) => {
        const parentHeight = (containerRectNow.height * h.parentRect.h) / 100;
        const dRatio = parentHeight === 0 ? 0 : delta / parentHeight;
        const node = getAtPath(prev.tree, h.path);
        if (isGroup(node)) {
          return prev;
        }
        const nextTree = setSplitRatio(prev.tree, h.path, node.ratio + dRatio);
        return { ...prev, tree: nextTree };
      });
    };
    return (
      <div key={`h-${i}`} style={style}>
        <ResizeHandle direction="horizontal" onResize={onResize} />
      </div>
    );
  };

  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>{handles.map((h, i) => renderHandle(h, i))}</div>;
};
