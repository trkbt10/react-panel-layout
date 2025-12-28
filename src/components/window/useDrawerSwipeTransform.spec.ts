/**
 * @file Tests for useDrawerSwipeTransform hook.
 */
import { renderHook } from "@testing-library/react";
import * as React from "react";
import { useDrawerSwipeTransform } from "./useDrawerSwipeTransform.js";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";

describe("useDrawerSwipeTransform", () => {
  const createDivRef = (width = 300, height = 500): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: width });
    Object.defineProperty(element, "clientHeight", { value: height });
    return { current: element };
  };

  const idleState: ContinuousOperationState = {
    phase: "idle",
    displacement: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  };

  const operatingState: ContinuousOperationState = {
    phase: "operating",
    displacement: { x: 50, y: 0 },
    velocity: { x: 1, y: 0 },
  };

  const endedState: ContinuousOperationState = {
    phase: "ended",
    displacement: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  };

  describe("when disabled", () => {
    it("does not apply transforms", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: operatingState,
          displacement: 50,
          isOpening: true,
          isClosing: false,
          enabled: false,
        }),
      );

      expect(drawerRef.current?.style.transform).toBe("");
    });
  });

  describe("when closing", () => {
    it("applies translateX for left drawer", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: operatingState,
          displacement: 50,
          isOpening: false,
          isClosing: true,
          enabled: true,
        }),
      );

      // Left drawer closes with negative translateX
      expect(drawerRef.current?.style.transform).toBe("translateX(-50px)");
    });

    it("applies translateX for right drawer", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "right",
          swipeState: operatingState,
          displacement: 50,
          isOpening: false,
          isClosing: true,
          enabled: true,
        }),
      );

      // Right drawer closes with positive translateX
      expect(drawerRef.current?.style.transform).toBe("translateX(50px)");
    });

    it("applies translateY for bottom drawer", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "bottom",
          swipeState: operatingState,
          displacement: 50,
          isOpening: false,
          isClosing: true,
          enabled: true,
        }),
      );

      // Bottom drawer closes with positive translateY
      expect(drawerRef.current?.style.transform).toBe("translateY(50px)");
    });

    it("updates backdrop opacity based on progress", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: operatingState,
          displacement: 150, // 50% of 300px width
          isOpening: false,
          isClosing: true,
          enabled: true,
        }),
      );

      // 150px / 300px = 50% progress, so opacity = 1 - 0.5 = 0.5
      expect(backdropRef.current?.style.opacity).toBe("0.5");
    });
  });

  describe("when opening", () => {
    it("applies opening transform for left drawer", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: operatingState,
          displacement: 100,
          isOpening: true,
          isClosing: false,
          enabled: true,
        }),
      );

      // Left drawer starts at -300px (width), opening 100px means -200px
      expect(drawerRef.current?.style.transform).toBe("translateX(-200px)");
    });

    it("updates backdrop opacity during opening", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: operatingState,
          displacement: 150,
          isOpening: true,
          isClosing: false,
          enabled: true,
        }),
      );

      expect(backdropRef.current?.style.opacity).toBe("0.5");
    });
  });

  describe("reset on swipe end", () => {
    it("clears transform when swipe ends", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      // First apply a transform
      drawerRef.current!.style.transform = "translateX(-50px)";
      backdropRef.current!.style.opacity = "0.5";

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: endedState,
          displacement: 0,
          isOpening: false,
          isClosing: false,
          enabled: true,
        }),
      );

      expect(drawerRef.current?.style.transform).toBe("");
      expect(backdropRef.current?.style.opacity).toBe("");
    });
  });

  describe("idle state", () => {
    it("does not apply transforms in idle state", () => {
      const drawerRef = createDivRef();
      const backdropRef = createDivRef();

      renderHook(() =>
        useDrawerSwipeTransform({
          drawerRef,
          backdropRef,
          placement: "left",
          swipeState: idleState,
          displacement: 0,
          isOpening: false,
          isClosing: false,
          enabled: true,
        }),
      );

      expect(drawerRef.current?.style.transform).toBe("");
    });
  });
});
