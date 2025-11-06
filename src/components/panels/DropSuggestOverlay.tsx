/**
 * @file Overlay renderer and helpers for drop suggestion zones.
 */
import * as React from "react";
import styles from "./DropSuggestOverlay.module.css";
import type { DropZone } from "../../modules/panels/types";

export type SuggestInfo = {
  rect: DOMRectReadOnly;
  zone: DropZone;
};

export const DropSuggestOverlay: React.FC<{ suggest: SuggestInfo | null }> = ({ suggest }) => {
  if (!suggest) {
    return null;
  }
  const { rect, zone } = suggest;
  const pad = 6;
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

export const pickDropZone = (rect: DOMRectReadOnly, x: number, y: number): DropZone => {
  const left = rect.left;
  const top = rect.top;
  const width = rect.width;
  const height = rect.height;
  const localX = x - left;
  const localY = y - top;
  const thirdW = width / 3;
  const thirdH = height / 3;
  if (localX > thirdW && localX < width - thirdW && localY > thirdH && localY < height - thirdH) {
    return "center";
  }
  if (localX < localY && localX < width - localX && localY < height - localY) {
    return "left";
  }
  if (width - localX < localY && width - localX < localX && localY < height - localY) {
    return "right";
  }
  if (localY < localX && localY < height - localY && localX < width - localX) {
    return "top";
  }
  return "bottom";
};
