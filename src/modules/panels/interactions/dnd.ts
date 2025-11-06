/**
 * @file DnD utilities for panel interactions
 */
import type { DropZone } from "../core/types";

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
