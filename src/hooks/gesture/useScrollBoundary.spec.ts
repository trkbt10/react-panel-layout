/**
 * @file Tests for useScrollBoundary hook.
 */
/* eslint-disable no-restricted-globals -- test requires vi for mocking */
import { renderHook, act } from "@testing-library/react";
import { useScrollBoundary } from "./useScrollBoundary.js";

describe("useScrollBoundary", () => {
  beforeEach(() => {
    // Mock ResizeObserver
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createMockElement = (props: {
    scrollLeft?: number;
    scrollTop?: number;
    scrollWidth?: number;
    scrollHeight?: number;
    clientWidth?: number;
    clientHeight?: number;
  }): HTMLDivElement => {
    const element = document.createElement("div");
    Object.defineProperties(element, {
      scrollLeft: { value: props.scrollLeft ?? 0, writable: true },
      scrollTop: { value: props.scrollTop ?? 0, writable: true },
      scrollWidth: { value: props.scrollWidth ?? 100, writable: true },
      scrollHeight: { value: props.scrollHeight ?? 100, writable: true },
      clientWidth: { value: props.clientWidth ?? 100, writable: true },
      clientHeight: { value: props.clientHeight ?? 100, writable: true },
    });
    return element;
  };

  describe("horizontal axis", () => {
    it("detects at start when scrollLeft is 0", () => {
      const element = createMockElement({
        scrollLeft: 0,
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.atStart).toBe(true);
      expect(result.current.atEnd).toBe(false);
    });

    it("detects at end when scrolled to maximum", () => {
      const element = createMockElement({
        scrollLeft: 400, // scrollWidth - clientWidth
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.atStart).toBe(false);
      expect(result.current.atEnd).toBe(true);
    });

    it("detects neither at start nor end when in middle", () => {
      const element = createMockElement({
        scrollLeft: 200,
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.atStart).toBe(false);
      expect(result.current.atEnd).toBe(false);
    });
  });

  describe("vertical axis", () => {
    it("detects at start when scrollTop is 0", () => {
      const element = createMockElement({
        scrollTop: 0,
        scrollHeight: 500,
        clientHeight: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "vertical" }),
      );

      expect(result.current.atStart).toBe(true);
      expect(result.current.atEnd).toBe(false);
    });

    it("detects at end when scrolled to maximum", () => {
      const element = createMockElement({
        scrollTop: 400, // scrollHeight - clientHeight
        scrollHeight: 500,
        clientHeight: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "vertical" }),
      );

      expect(result.current.atStart).toBe(false);
      expect(result.current.atEnd).toBe(true);
    });
  });

  describe("tolerance", () => {
    it("considers at start within tolerance", () => {
      const element = createMockElement({
        scrollLeft: 3, // Within default tolerance of 1? No, let's use explicit
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal", tolerance: 5 }),
      );

      expect(result.current.atStart).toBe(true);
    });

    it("considers at end within tolerance", () => {
      const element = createMockElement({
        scrollLeft: 398, // 2 pixels from max (400)
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal", tolerance: 5 }),
      );

      expect(result.current.atEnd).toBe(true);
    });
  });

  describe("scroll position values", () => {
    it("returns current scroll position", () => {
      const element = createMockElement({
        scrollLeft: 150,
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.scrollPosition).toBe(150);
    });

    it("returns max scroll position", () => {
      const element = createMockElement({
        scrollLeft: 0,
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.maxScrollPosition).toBe(400);
    });
  });

  describe("no scrollable content", () => {
    it("handles non-scrollable content (content fits)", () => {
      const element = createMockElement({
        scrollLeft: 0,
        scrollWidth: 100,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.atStart).toBe(true);
      expect(result.current.atEnd).toBe(false); // maxScrollPosition is 0, so atEnd condition is false
      expect(result.current.maxScrollPosition).toBe(0);
    });
  });

  describe("null ref", () => {
    it("handles null container ref", () => {
      const ref = { current: null };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.atStart).toBe(true);
      expect(result.current.atEnd).toBe(false);
      expect(result.current.scrollPosition).toBe(0);
      expect(result.current.maxScrollPosition).toBe(0);
    });
  });

  describe("scroll event updates", () => {
    it("updates on scroll event", () => {
      const element = createMockElement({
        scrollLeft: 0,
        scrollWidth: 500,
        clientWidth: 100,
      });
      const ref = { current: element };

      const { result } = renderHook(() =>
        useScrollBoundary({ containerRef: ref, axis: "horizontal" }),
      );

      expect(result.current.atStart).toBe(true);

      // Simulate scroll
      act(() => {
        Object.defineProperty(element, "scrollLeft", { value: 400, writable: true });
        element.dispatchEvent(new Event("scroll"));
      });

      expect(result.current.atEnd).toBe(true);
      expect(result.current.atStart).toBe(false);
    });
  });
});
