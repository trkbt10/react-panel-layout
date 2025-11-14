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
  DROP_SUGGEST_PADDING_PX,
} from "../../constants/styles";
import { clampNumber } from "../../utils/math";
import { matrix } from "../../utils/CSSMatrix";

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
  transformOrigin: "top left",
};

export type SuggestInfo = {
  rect: DOMRectReadOnly;
  zone: DropZone;
};

export type DropSuggestOverlayProps = {
  suggest: SuggestInfo | null;
};

const safeRatio = (value: number, base: number): number => {
  if (base <= 0) {
    return 0;
  }
  return clampNumber(value / base, 0);
};

const buildZoneTransform = (rect: DOMRectReadOnly, zone: DropZone, pad: number): string => {
  const { width, height } = rect;
  const halfPad = pad / 2;
  const widthBase = width > 0 ? width : 1;
  const heightBase = height > 0 ? height : 1;

  const center = {
    translateX: pad,
    translateY: pad,
    scaleX: safeRatio(clampNumber(width - pad * 2, 0), widthBase),
    scaleY: safeRatio(clampNumber(height - pad * 2, 0), heightBase),
  };

  const left = {
    translateX: pad,
    translateY: pad,
    scaleX: safeRatio(clampNumber(width / 2 - pad * 1.5, 0), widthBase),
    scaleY: safeRatio(clampNumber(height - pad * 2, 0), heightBase),
  };

  const right = {
    translateX: width / 2 + halfPad,
    translateY: pad,
    scaleX: safeRatio(clampNumber(width / 2 - pad * 1.5, 0), widthBase),
    scaleY: safeRatio(clampNumber(height - pad * 2, 0), heightBase),
  };

  const top = {
    translateX: pad,
    translateY: pad,
    scaleX: safeRatio(clampNumber(width - pad * 2, 0), widthBase),
    scaleY: safeRatio(clampNumber(height / 2 - pad * 1.5, 0), heightBase),
  };

  const bottom = {
    translateX: pad,
    translateY: height / 2 + halfPad,
    scaleX: safeRatio(clampNumber(width - pad * 2, 0), widthBase),
    scaleY: safeRatio(clampNumber(height / 2 - pad * 1.5, 0), heightBase),
  };

  const zoneTransforms: Record<DropZone, typeof center> = {
    center,
    left,
    right,
    top,
    bottom,
  };

  const { translateX, translateY, scaleX, scaleY } = zoneTransforms[zone];
  return matrix()
    .translate(translateX, translateY, 0)
    .scale(scaleX, scaleY, 1)
    .toCSS();
};

const buildSuggestStyle = (rect: DOMRectReadOnly, zone: DropZone): React.CSSProperties => {
  const pad = DROP_SUGGEST_PADDING_PX;
  return {
    ...suggestRectBaseStyle,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    transform: buildZoneTransform(rect, zone, pad),
  };
};

export const DropSuggestOverlay: React.FC<DropSuggestOverlayProps> = ({ suggest }) => {
  if (!suggest) {
    return null;
  }

  const { rect, zone } = suggest;
  const style = buildSuggestStyle(rect, zone);

  return (
    <div style={overlayStyle}>
      <div style={style} />
    </div>
  );
};

// pickDropZone moved to modules/panels/runtime/dnd
