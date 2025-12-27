/**
 * @file Tests for useDialogSwipeInput hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useDialogSwipeInput } from "./useDialogSwipeInput.js";

// Mock ResizeObserver
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
);

describe("useDialogSwipeInput", () => {
  const createMockContainer = (dimensions: { width: number; height: number }) => {
    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: dimensions.width });
    Object.defineProperty(container, "clientHeight", { value: dimensions.height });
    return container;
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should return idle state initially", () => {
      const container = createMockContainer({ width: 400, height: 300 });
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useDialogSwipeInput({
          containerRef,
          openDirection: "bottom",
          enabled: true,
          onSwipeDismiss: vi.fn(),
        }),
      );

      expect(result.current.state.phase).toBe("idle");
      expect(result.current.isOperating).toBe(false);
      expect(result.current.displacement).toBe(0);
    });

    it("should provide containerProps with touch-action style", () => {
      const container = createMockContainer({ width: 400, height: 300 });
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useDialogSwipeInput({
          containerRef,
          openDirection: "bottom",
          enabled: true,
          onSwipeDismiss: vi.fn(),
        }),
      );

      expect(result.current.containerProps.style).toBeDefined();
      expect(result.current.containerProps.style.touchAction).toBeDefined();
    });
  });

  describe("free 2D movement", () => {
    it("should use touch-action none for free movement", () => {
      const container = createMockContainer({ width: 400, height: 300 });
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useDialogSwipeInput({
          containerRef,
          openDirection: "bottom",
          enabled: true,
          onSwipeDismiss: vi.fn(),
        }),
      );

      // Free 2D movement requires touch-action: none
      expect(result.current.containerProps.style.touchAction).toBe("none");
    });

    it("should provide displacement2D for 2D transform", () => {
      const container = createMockContainer({ width: 400, height: 300 });
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useDialogSwipeInput({
          containerRef,
          openDirection: "left",
          enabled: true,
          onSwipeDismiss: vi.fn(),
        }),
      );

      // Should provide 2D displacement
      expect(result.current.displacement2D).toEqual({ x: 0, y: 0 });
    });
  });

  describe("enabled state", () => {
    it("should not respond to pointer events when disabled", () => {
      const container = createMockContainer({ width: 400, height: 300 });
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useDialogSwipeInput({
          containerRef,
          openDirection: "bottom",
          enabled: false,
          onSwipeDismiss: vi.fn(),
        }),
      );

      // Try to trigger pointer down
      const pointerEvent = new PointerEvent("pointerdown", {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });

      act(() => {
        result.current.containerProps.onPointerDown?.(
          pointerEvent as unknown as React.PointerEvent,
        );
      });

      expect(result.current.state.phase).toBe("idle");
    });
  });

  describe("progress calculation", () => {
    it("should return 0 progress when not swiping", () => {
      const container = createMockContainer({ width: 400, height: 300 });
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useDialogSwipeInput({
          containerRef,
          openDirection: "bottom",
          enabled: true,
          onSwipeDismiss: vi.fn(),
        }),
      );

      expect(result.current.progress).toBe(0);
    });
  });
});
