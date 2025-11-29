/**
 * @file Tests for useFloatingState hook
 */
import { renderHook, act } from "@testing-library/react";
import { useFloatingState } from "./useFloatingState";
import type { LayerDefinition, WindowPosition, WindowSize } from "../../types";

/**
 * Creates a tracked callback for testing.
 * Tracks all calls and their arguments.
 */
const createTrackedCallback = <T,>() => {
  const calls: T[] = [];
  const fn = (arg: T) => {
    calls.push(arg);
  };
  return { fn, calls };
};

describe("useFloatingState", () => {
  const createLayer = (overrides: Partial<LayerDefinition> = {}): LayerDefinition => ({
    id: "test-layer",
    component: null,
    floating: {
      defaultPosition: { left: 100, top: 100 },
      defaultSize: { width: 300, height: 200 },
      draggable: true,
    },
    ...overrides,
  });

  describe("getPosition", () => {
    it("should return defaultPosition for uncontrolled mode", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      const position = result.current.getPosition("test-layer");

      expect(position).toEqual({ left: 100, top: 100 });
    });

    it("should return controlled position when provided", () => {
      const layers = [
        createLayer({
          floating: {
            position: { left: 200, top: 200 },
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      const position = result.current.getPosition("test-layer");

      expect(position).toEqual({ left: 200, top: 200 });
    });

    it("should return default position for unknown layer", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      const position = result.current.getPosition("unknown-layer");

      expect(position).toEqual({ left: 0, top: 0 });
    });
  });

  describe("getSize", () => {
    it("should return defaultSize for uncontrolled mode", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      const size = result.current.getSize("test-layer");

      expect(size).toEqual({ width: 300, height: 200 });
    });

    it("should return controlled size when provided", () => {
      const layers = [
        createLayer({
          floating: {
            size: { width: 500, height: 400 },
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      const size = result.current.getSize("test-layer");

      expect(size).toEqual({ width: 500, height: 400 });
    });
  });

  describe("getZIndex", () => {
    it("should return zIndex from floating config", () => {
      const layers = [
        createLayer({
          floating: {
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
            zIndex: 10,
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      const zIndex = result.current.getZIndex("test-layer");

      expect(zIndex).toBe(10);
    });

    it("should return undefined when zIndex not set", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      const zIndex = result.current.getZIndex("test-layer");

      expect(zIndex).toBeUndefined();
    });
  });

  describe("updatePosition", () => {
    it("should update internal state in uncontrolled mode", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      act(() => {
        result.current.updatePosition("test-layer", { left: 150, top: 150 });
      });

      const position = result.current.getPosition("test-layer");
      expect(position).toEqual({ left: 150, top: 150 });
    });

    it("should call onMove callback", () => {
      const tracked = createTrackedCallback<WindowPosition>();
      const layers = [
        createLayer({
          floating: {
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
            onMove: tracked.fn,
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      act(() => {
        result.current.updatePosition("test-layer", { left: 150, top: 150 });
      });

      expect(tracked.calls).toEqual([{ left: 150, top: 150 }]);
    });

    it("should not update internal state in controlled mode", () => {
      const tracked = createTrackedCallback<WindowPosition>();
      const layers = [
        createLayer({
          floating: {
            position: { left: 200, top: 200 },
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
            onMove: tracked.fn,
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      act(() => {
        result.current.updatePosition("test-layer", { left: 150, top: 150 });
      });

      // In controlled mode, position should still come from the prop
      const position = result.current.getPosition("test-layer");
      expect(position).toEqual({ left: 200, top: 200 });
      // But callback should still be called
      expect(tracked.calls).toEqual([{ left: 150, top: 150 }]);
    });
  });

  describe("updateSize", () => {
    it("should update internal state in uncontrolled mode", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      act(() => {
        result.current.updateSize("test-layer", { width: 400, height: 300 });
      });

      const size = result.current.getSize("test-layer");
      expect(size).toEqual({ width: 400, height: 300 });
    });

    it("should call onResize callback", () => {
      const tracked = createTrackedCallback<WindowSize>();
      const layers = [
        createLayer({
          floating: {
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
            onResize: tracked.fn,
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      act(() => {
        result.current.updateSize("test-layer", { width: 400, height: 300 });
      });

      expect(tracked.calls).toEqual([{ width: 400, height: 300 }]);
    });
  });

  describe("close", () => {
    it("should call onClose callback", () => {
      const closeTracker = { called: false };
      const layers = [
        createLayer({
          floating: {
            defaultPosition: { left: 100, top: 100 },
            defaultSize: { width: 300, height: 200 },
            onClose: () => {
              closeTracker.called = true;
            },
          },
        }),
      ];
      const { result } = renderHook(() => useFloatingState(layers));

      act(() => {
        result.current.close("test-layer");
      });

      expect(closeTracker.called).toBe(true);
    });

    it("should not throw when layer has no onClose callback", () => {
      const layers = [createLayer()];
      const { result } = renderHook(() => useFloatingState(layers));

      expect(() => {
        act(() => {
          result.current.close("test-layer");
        });
      }).not.toThrow();
    });
  });
});
