/**
 * @file Overlay renderer and helpers for drop suggestion zones.
 */
import * as React from "react";
import styles from "./DropSuggestOverlay.module.css";
import type { DropZone } from "../../modules/panels/state/types";

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
    const pad = "var(--rpl-space-drop-suggest-padding, 6px)";

    if (zone === "center") {
      return {
        ...baseStyle,
        left: `calc(var(--rect-left) + ${pad})`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) - ${pad} * 2)`,
        height: `calc(var(--rect-height) - ${pad} * 2)`,
      };
    }
    if (zone === "left") {
      return {
        ...baseStyle,
        left: `calc(var(--rect-left) + ${pad})`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) / 2 - ${pad} * 1.5)`,
        height: `calc(var(--rect-height) - ${pad} * 2)`,
      };
    }
    if (zone === "right") {
      return {
        ...baseStyle,
        left: `calc(var(--rect-left) + var(--rect-width) / 2 + ${pad} / 2)`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) / 2 - ${pad} * 1.5)`,
        height: `calc(var(--rect-height) - ${pad} * 2)`,
      };
    }
    if (zone === "top") {
      return {
        ...baseStyle,
        left: `calc(var(--rect-left) + ${pad})`,
        top: `calc(var(--rect-top) + ${pad})`,
        width: `calc(var(--rect-width) - ${pad} * 2)`,
        height: `calc(var(--rect-height) / 2 - ${pad} * 1.5)`,
      };
    }
    return {
      ...baseStyle,
      left: `calc(var(--rect-left) + ${pad})`,
      top: `calc(var(--rect-top) + var(--rect-height) / 2 + ${pad} / 2)`,
      width: `calc(var(--rect-width) - ${pad} * 2)`,
      height: `calc(var(--rect-height) / 2 - ${pad} * 1.5)`,
    };
  };

  const style = compute();

  return (
    <div className={styles.overlay}>
      <div className={styles.suggestRect} style={style} />
    </div>
  );
};

// pickDropZone moved to modules/panels/runtime/dnd
