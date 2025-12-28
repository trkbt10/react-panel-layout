/**
 * @file Hook for applying real-time transform during drawer swipe gestures.
 *
 * Handles DOM manipulation for smooth swipe animations.
 */
import * as React from "react";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";
import { getDrawerAnimationAxis, getDrawerCloseSwipeSign } from "../../modules/drawer/types.js";
import type { DrawerSwipeDirection } from "../../modules/drawer/types.js";

type UseDrawerSwipeTransformOptions = {
  drawerRef: React.RefObject<HTMLDivElement | null>;
  backdropRef: React.RefObject<HTMLDivElement | null>;
  placement: DrawerSwipeDirection;
  swipeState: ContinuousOperationState;
  displacement: number;
  isOpening: boolean;
  isClosing: boolean;
  enabled: boolean;
};

/**
 * Apply real-time transform to drawer and backdrop during swipe.
 */
export function useDrawerSwipeTransform(options: UseDrawerSwipeTransformOptions): void {
  const {
    drawerRef,
    backdropRef,
    placement,
    swipeState,
    displacement,
    isOpening,
    isClosing,
    enabled,
  } = options;

  const isOperating = swipeState.phase === "operating";

  // Apply real-time transform during swipe
  React.useLayoutEffect(() => {
    if (!enabled || !isOperating) {
      return;
    }

    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;

    if (!drawer) {
      return;
    }

    const axis = getDrawerAnimationAxis(placement);
    const closeSign = getDrawerCloseSwipeSign(placement);
    const drawerSize = axis === "x" ? drawer.clientWidth : drawer.clientHeight;

    if (drawerSize <= 0) {
      return;
    }

    const translateFn = axis === "x" ? "translateX" : "translateY";

    if (isClosing) {
      applyClosingTransform(drawer, backdrop, translateFn, closeSign, displacement, drawerSize);
    } else if (isOpening) {
      applyOpeningTransform(drawer, backdrop, translateFn, closeSign, displacement, drawerSize);
    }
  }, [enabled, isOperating, isClosing, isOpening, displacement, placement, drawerRef, backdropRef]);

  // Reset transform after swipe ends
  React.useLayoutEffect(() => {
    if (!enabled || swipeState.phase !== "ended") {
      return;
    }

    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;

    if (drawer) {
      drawer.style.transform = "";
    }
    if (backdrop) {
      backdrop.style.opacity = "";
    }
  }, [enabled, swipeState.phase, drawerRef, backdropRef]);
}

function applyClosingTransform(
  drawer: HTMLDivElement,
  backdrop: HTMLDivElement | null,
  translateFn: "translateX" | "translateY",
  closeSign: 1 | -1,
  displacement: number,
  drawerSize: number,
): void {
  const translate = closeSign * displacement;
  drawer.style.transform = `${translateFn}(${translate}px)`;

  const progress = Math.min(displacement / drawerSize, 1);
  if (backdrop) {
    backdrop.style.opacity = String(1 - progress);
  }
}

function applyOpeningTransform(
  drawer: HTMLDivElement,
  backdrop: HTMLDivElement | null,
  translateFn: "translateX" | "translateY",
  closeSign: 1 | -1,
  displacement: number,
  drawerSize: number,
): void {
  const closedPosition = closeSign * drawerSize;
  const translate = closedPosition + closeSign * -1 * displacement;
  const clampedTranslate = clampTranslate(translate, closeSign);
  drawer.style.transform = `${translateFn}(${clampedTranslate}px)`;

  const progress = Math.min(displacement / drawerSize, 1);
  if (backdrop) {
    backdrop.style.opacity = String(progress);
    backdrop.style.pointerEvents = "auto";
  }
}

function clampTranslate(translate: number, closeSign: 1 | -1): number {
  if (closeSign > 0) {
    return Math.max(0, translate);
  }
  return Math.min(0, translate);
}
