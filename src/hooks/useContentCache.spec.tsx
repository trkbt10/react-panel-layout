/**
 * @file Unit tests for useContentCache hook.
 * Verifies content caching, cache cleanup, and state preservation.
 */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useContentCache } from "./useContentCache";

/**
 * Creates a simple fake function that tracks call count and can return a configured value.
 */
function createFake<T>(returnValue: T) {
  const state = { callCount: 0 };
  const fn = () => {
    state.callCount++;
    return returnValue;
  };
  return { fn, state };
}

/**
 * Creates a fake function with custom implementation that tracks call count.
 */
function createFakeWithImpl<T>(impl: (id: string) => T) {
  const state = { callCount: 0 };
  const fn = (id: string) => {
    state.callCount++;
    return impl(id);
  };
  return { fn, state };
}

describe("useContentCache", () => {
  describe("content caching", () => {
    it("returns cached content for the same ID", () => {
      const content = <div>Test Content</div>;
      const { fn: resolveContent, state } = createFake(content);

      const { result } = renderHook(() =>
        useContentCache({
          resolveContent,
          validIds: ["item-1"],
        }),
      );

      // First call should invoke resolveContent
      const first = result.current.getCachedContent("item-1");
      expect(state.callCount).toBe(1);
      expect(first).toBe(content);

      // Second call should return cached value without calling resolveContent
      const second = result.current.getCachedContent("item-1");
      expect(state.callCount).toBe(1);
      expect(second).toBe(first);
    });

    it("returns the same reference across re-renders", () => {
      const content = <div>Test Content</div>;
      const { fn: resolveContent, state } = createFake(content);

      const { result, rerender } = renderHook(
        ({ validIds }) =>
          useContentCache({
            resolveContent,
            validIds,
          }),
        { initialProps: { validIds: ["item-1"] as readonly string[] } },
      );

      const first = result.current.getCachedContent("item-1");
      expect(state.callCount).toBe(1);

      // Re-render with same validIds
      rerender({ validIds: ["item-1"] });
      const afterRerender = result.current.getCachedContent("item-1");

      // Should still be the same reference, resolveContent not called again
      expect(state.callCount).toBe(1);
      expect(afterRerender).toBe(first);
    });

    it("caches content for multiple IDs independently", () => {
      const content1 = <div>Content 1</div>;
      const content2 = <div>Content 2</div>;
      const { fn: resolveContent, state } = createFakeWithImpl((id: string) => {
        if (id === "item-1") {
          return content1;
        }
        if (id === "item-2") {
          return content2;
        }
        return null;
      });

      const { result } = renderHook(() =>
        useContentCache({
          resolveContent,
          validIds: ["item-1", "item-2"],
        }),
      );

      const cached1 = result.current.getCachedContent("item-1");
      const cached2 = result.current.getCachedContent("item-2");

      expect(cached1).toBe(content1);
      expect(cached2).toBe(content2);
      expect(state.callCount).toBe(2);

      // Accessing again should not call resolveContent
      result.current.getCachedContent("item-1");
      result.current.getCachedContent("item-2");
      expect(state.callCount).toBe(2);
    });

    it("returns null for non-existent IDs", () => {
      const { fn: resolveContent } = createFake(null);

      const { result } = renderHook(() =>
        useContentCache({
          resolveContent,
          validIds: ["item-1"],
        }),
      );

      const cached = result.current.getCachedContent("non-existent");
      expect(cached).toBeNull();
    });
  });

  describe("cache cleanup", () => {
    it("removes stale entries when validIds changes", () => {
      const content1 = <div>Content 1</div>;
      const content2 = <div>Content 2</div>;
      const { fn: resolveContent, state } = createFakeWithImpl((id: string) => {
        if (id === "item-1") {
          return content1;
        }
        if (id === "item-2") {
          return content2;
        }
        return null;
      });

      const { result, rerender } = renderHook(
        ({ validIds }) =>
          useContentCache({
            resolveContent,
            validIds,
          }),
        { initialProps: { validIds: ["item-1", "item-2"] as readonly string[] } },
      );

      // Cache both items
      result.current.getCachedContent("item-1");
      result.current.getCachedContent("item-2");
      expect(state.callCount).toBe(2);

      // Remove item-1 from validIds
      rerender({ validIds: ["item-2"] });

      // item-2 should still be cached
      result.current.getCachedContent("item-2");
      expect(state.callCount).toBe(2);

      // item-1 should be removed from cache, so resolveContent will be called again
      result.current.getCachedContent("item-1");
      expect(state.callCount).toBe(3);
    });
  });

  describe("clearCache", () => {
    it("clears all cached content", () => {
      const content = <div>Test Content</div>;
      const { fn: resolveContent, state } = createFake(content);

      const { result } = renderHook(() =>
        useContentCache({
          resolveContent,
          validIds: ["item-1"],
        }),
      );

      // Cache the content
      result.current.getCachedContent("item-1");
      expect(state.callCount).toBe(1);

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      // Accessing again should call resolveContent
      result.current.getCachedContent("item-1");
      expect(state.callCount).toBe(2);
    });
  });

  describe("resolveContent updates", () => {
    it("uses latest resolveContent function via ref pattern", () => {
      const initialContent = <div>Initial</div>;
      const updatedContent = <div>Updated</div>;
      const { result, rerender } = renderHook(
        ({ content }) =>
          useContentCache({
            resolveContent: () => content,
            validIds: ["item-1"],
          }),
        { initialProps: { content: initialContent } },
      );

      // Cache with initial content
      const first = result.current.getCachedContent("item-1");
      expect(first).toBe(initialContent);

      // Update content
      rerender({ content: updatedContent });

      // getCachedContent should still return cached value
      const cached = result.current.getCachedContent("item-1");
      expect(cached).toBe(first);

      // Clear cache and get new content
      act(() => {
        result.current.clearCache();
      });

      const updated = result.current.getCachedContent("item-1");
      expect(updated).toBe(updatedContent);
    });
  });
});
