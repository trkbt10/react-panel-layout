/**
 * @file Tests for usePointerTracking hook.
 */
/* eslint-disable no-restricted-globals -- test requires vi for timing control */
import { act, renderHook } from "@testing-library/react";
import { usePointerTracking } from "./usePointerTracking.js";

describe("usePointerTracking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("starts with idle state", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      expect(result.current.state).toEqual({
        isDown: false,
        start: null,
        current: null,
        pointerId: null,
      });
    });
  });

  describe("pointer down handling", () => {
    it("tracks pointer down with position and timestamp", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(mockEvent);
      });

      expect(result.current.state.isDown).toBe(true);
      expect(result.current.state.start?.x).toBe(100);
      expect(result.current.state.start?.y).toBe(200);
      expect(result.current.state.pointerId).toBe(1);
    });

    it("ignores non-primary pointers when primaryOnly is true", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true, primaryOnly: true }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 2,
        isPrimary: false,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(mockEvent);
      });

      expect(result.current.state.isDown).toBe(false);
    });

    it("allows non-primary pointers when primaryOnly is false", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true, primaryOnly: false }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 2,
        isPrimary: false,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(mockEvent);
      });

      expect(result.current.state.isDown).toBe(true);
    });

    it("ignores non-left mouse button clicks", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "mouse",
        button: 2, // Right click
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(mockEvent);
      });

      expect(result.current.state.isDown).toBe(false);
    });

    it("ignores events when disabled", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: false }),
      );

      const mockEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(mockEvent);
      });

      expect(result.current.state.isDown).toBe(false);
    });
  });

  describe("pointer move handling", () => {
    it("updates current position on pointer move", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      // Pointer down first
      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(downEvent);
      });

      // Simulate pointer move via document event
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 250,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.state.current?.x).toBe(150);
      expect(result.current.state.current?.y).toBe(250);
      // Start position should remain unchanged
      expect(result.current.state.start?.x).toBe(100);
      expect(result.current.state.start?.y).toBe(200);
    });

    it("ignores move events for different pointer ID", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(downEvent);
      });

      // Move event with different pointer ID
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 250,
        pointerId: 2, // Different pointer
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Current should still be at start position
      expect(result.current.state.current?.x).toBe(100);
      expect(result.current.state.current?.y).toBe(200);
    });
  });

  describe("pointer end handling", () => {
    it("resets state on pointer up", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(downEvent);
      });

      expect(result.current.state.isDown).toBe(true);

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      expect(result.current.state.isDown).toBe(false);
      expect(result.current.state.start).toBe(null);
      expect(result.current.state.current).toBe(null);
      expect(result.current.state.pointerId).toBe(null);
    });

    it("resets state on pointer cancel", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(downEvent);
      });

      const cancelEvent = new PointerEvent("pointercancel", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(cancelEvent);
      });

      expect(result.current.state.isDown).toBe(false);
    });
  });

  describe("reset", () => {
    it("manually resets state", () => {
      const { result } = renderHook(() =>
        usePointerTracking({ enabled: true }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(downEvent);
      });

      expect(result.current.state.isDown).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.isDown).toBe(false);
    });
  });

  describe("enabled toggle", () => {
    it("resets state when disabled while tracking", () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => usePointerTracking({ enabled }),
        { initialProps: { enabled: true } },
      );

      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent;

      act(() => {
        result.current.onPointerDown(downEvent);
      });

      expect(result.current.state.isDown).toBe(true);

      // Disable tracking
      rerender({ enabled: false });

      expect(result.current.state.isDown).toBe(false);
    });
  });
});
