/**
 * @file Overlay renderer and helpers for drop suggestion zones.
 */
import * as React from "react";
import styles from "./DropSuggestOverlay.module.css";
import type { DropZone } from "../../modules/panels/state/types";
import { usePanelTheme } from "../../modules/theme/tokens";

export type SuggestInfo = {
  rect: DOMRectReadOnly;
  zone: DropZone;
};

export const DropSuggestOverlay: React.FC<{ suggest: SuggestInfo | null }> = ({ suggest }) => {
  if (!suggest) {
    return null;
  }
  const theme = usePanelTheme();
  const { rect, zone } = suggest;
  const pad = theme.dropSuggestPadding;
  const left = rect.left;
  const top = rect.top;
  const width = rect.width;
  const height = rect.height;

  const compute = (): React.CSSProperties => {
    if (zone === "center") {
      return {
        left: left + pad,
        top: top + pad,
        width: width - pad * 2,
        height: height - pad * 2,
      };
    }
    if (zone === "left") {
      return { left: left + pad, top: top + pad, width: width / 2 - pad * 1.5, height: height - pad * 2 };
    }
    if (zone === "right") {
      return {
        left: left + width / 2 + pad / 2,
        top: top + pad,
        width: width / 2 - pad * 1.5,
        height: height - pad * 2,
      };
    }
    if (zone === "top") {
      return { left: left + pad, top: top + pad, width: width - pad * 2, height: height / 2 - pad * 1.5 };
    }
    return {
      left: left + pad,
      top: top + height / 2 + pad / 2,
      width: width - pad * 2,
      height: height / 2 - pad * 1.5,
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
