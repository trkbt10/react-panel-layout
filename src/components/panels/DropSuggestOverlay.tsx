/**
 * @file Overlay renderer and helpers for drop suggestion zones.
 */
import * as React from "react";
import type { DropZone } from "../../modules/panels/state/types";
import {
  DROP_SUGGEST_Z_INDEX,
  DROP_SUGGEST_BORDER_WIDTH,
  DROP_SUGGEST_BORDER_RADIUS,
  DROP_SUGGEST_BORDER_COLOR,
  DROP_SUGGEST_BG_COLOR,
  DROP_SUGGEST_PADDING,
} from "../../constants/styles";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: DROP_SUGGEST_Z_INDEX,
};

const suggestRectBaseStyle: React.CSSProperties = {
  position: "absolute",
  border: `${DROP_SUGGEST_BORDER_WIDTH} dashed ${DROP_SUGGEST_BORDER_COLOR}`,
  background: DROP_SUGGEST_BG_COLOR,
  borderRadius: DROP_SUGGEST_BORDER_RADIUS,
};

export type SuggestInfo = {
  rect: DOMRectReadOnly;
  zone: DropZone;
};

export type DropSuggestOverlayProps = {
  suggest: SuggestInfo | null;
};

export const DropSuggestOverlay: React.FC<DropSuggestOverlayProps> = ({ suggest }) => {
  if (!suggest) {
    return null;
  }

  const { rect, zone } = suggest;

  // Use CSS variables for rect dimensions and let CSS calc() handle padding
  const baseStyle: React.CSSProperties = {
    "--rect-left": `${rect.left}px`,
    "--rect-top": `${rect.top}px`,
    "--rect-width": `${rect.width}px`,
    "--rect-height": `${rect.height}px`,
  } as React.CSSProperties;

  const compute = (): React.CSSProperties => {
    const pad = DROP_SUGGEST_PADDING;

    if (zone === "center") {
      return {
        ...suggestRectBaseStyle,
        ...baseStyle,
        left: `calc(var(--rect-left) + ${pad})`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) - ${pad} * 2)`,
        height: `calc(var(--rect-height) - ${pad} * 2)`,
      };
    }
    if (zone === "left") {
      return {
        ...suggestRectBaseStyle,
        ...baseStyle,
        left: `calc(var(--rect-left) + ${pad})`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) / 2 - ${pad} * 1.5)`,
        height: `calc(var(--rect-height) - ${pad} * 2)`,
      };
    }
    if (zone === "right") {
      return {
        ...suggestRectBaseStyle,
        ...baseStyle,
        left: `calc(var(--rect-left) + var(--rect-width) / 2 + ${pad} / 2)`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) / 2 - ${pad} * 1.5)`,
        height: `calc(var(--rect-height) - ${pad} * 2)`,
      };
    }
    if (zone === "top") {
      return {
        ...suggestRectBaseStyle,
        ...baseStyle,
        left: `calc(var(--rect-left) + ${pad})`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) - ${pad} * 2)`,
        height: `calc(var(--rect-height) / 2 - ${pad} * 1.5)`,
      };
    }
    return {
      ...suggestRectBaseStyle,
      ...baseStyle,
      left: `calc(var(--rect-left) + ${pad})`,
      top: `calc(var(--rect-top) + var(--rect-height) / 2 + ${pad} / 2)`,
      width: `calc(var(--rect-width) - ${pad} * 2)`,
      height: `calc(var(--rect-height) / 2 - ${pad} * 1.5)`,
    };
  };

  const style = compute();

  return (
    <div style={overlayStyle}>
      <div style={style} />
    </div>
  );
};

// pickDropZone moved to modules/panels/runtime/dnd
