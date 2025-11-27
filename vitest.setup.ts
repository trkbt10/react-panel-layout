/**
 * @file Vitest setup file for React testing
 */

import "@testing-library/jest-dom/vitest";

// Polyfill IntersectionObserver for jsdom environment
if (typeof (globalThis as any).IntersectionObserver === "undefined") {
  class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = "0px";
    readonly thresholds: ReadonlyArray<number> = [0];
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  ;(globalThis as any).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

// Polyfill ResizeObserver for jsdom environment
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  class MockResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  ;(globalThis as any).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}
