/**
 * @file Tests for usePivot hook - navigation methods.
 */
import { renderHook, act } from "@testing-library/react";
import { usePivot } from "./usePivot.js";
import type { PivotItem } from "./types.js";

describe("usePivot", () => {
  const createItems = (): ReadonlyArray<PivotItem<"a" | "b" | "c">> => [
    { id: "a", label: "Item A", content: "Content A" },
    { id: "b", label: "Item B", content: "Content B" },
    { id: "c", label: "Item C", content: "Content C" },
  ];

  describe("go navigation", () => {
    it("navigates to next item with go(1)", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.activeId).toBe("a");

      act(() => {
        result.current.go(1);
      });

      expect(result.current.activeId).toBe("b");
    });

    it("navigates to previous item with go(-1)", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.activeId).toBe("b");

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.activeId).toBe("a");
    });

    it("navigates multiple steps with go(2)", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      act(() => {
        result.current.go(2);
      });

      expect(result.current.activeId).toBe("c");
    });

    it("does not navigate beyond first item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.activeId).toBe("a");
    });

    it("does not navigate beyond last item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c" }),
      );

      act(() => {
        result.current.go(1);
      });

      expect(result.current.activeId).toBe("c");
    });

    it("does nothing with go(0)", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      act(() => {
        result.current.go(0);
      });

      expect(result.current.activeId).toBe("b");
    });

    it("skips disabled items in navigation", () => {
      const items: ReadonlyArray<PivotItem<"a" | "b" | "c">> = [
        { id: "a", label: "Item A", content: "Content A" },
        { id: "b", label: "Item B", content: "Content B", disabled: true },
        { id: "c", label: "Item C", content: "Content C" },
      ];

      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      // go(1) should go to 'c' since 'b' is disabled and not in enabledItems
      act(() => {
        result.current.go(1);
      });

      expect(result.current.activeId).toBe("c");
    });
  });

  describe("canGo", () => {
    it("returns true when can navigate forward", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.canGo(1)).toBe(true);
    });

    it("returns false when at last item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c" }),
      );

      expect(result.current.canGo(1)).toBe(false);
    });

    it("returns true when can navigate backward", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.canGo(-1)).toBe(true);
    });

    it("returns false when at first item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.canGo(-1)).toBe(false);
    });

    it("returns false for go(0)", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.canGo(0)).toBe(false);
    });

    it("returns correct value for multi-step navigation", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.canGo(2)).toBe(true); // Can go to 'c'
      expect(result.current.canGo(3)).toBe(false); // Would go beyond 'c'
    });
  });

  describe("activeIndex", () => {
    it("returns correct index for first item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.activeIndex).toBe(0);
    });

    it("returns correct index for middle item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.activeIndex).toBe(1);
    });

    it("returns correct index for last item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c" }),
      );

      expect(result.current.activeIndex).toBe(2);
    });

    it("updates when active item changes", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.activeIndex).toBe(0);

      act(() => {
        result.current.setActiveId("c");
      });

      expect(result.current.activeIndex).toBe(2);
    });
  });

  describe("itemCount", () => {
    it("returns total count of enabled items", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.itemCount).toBe(3);
    });

    it("excludes disabled items from count", () => {
      const items: ReadonlyArray<PivotItem<"a" | "b" | "c">> = [
        { id: "a", label: "Item A", content: "Content A" },
        { id: "b", label: "Item B", content: "Content B", disabled: true },
        { id: "c", label: "Item C", content: "Content C" },
      ];

      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.itemCount).toBe(2);
    });
  });

  describe("onActiveChange callback", () => {
    it("calls onActiveChange when navigating with go", () => {
      const items = createItems();
      const onActiveChange = vi.fn();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", onActiveChange }),
      );

      act(() => {
        result.current.go(1);
      });

      expect(onActiveChange).toHaveBeenCalledWith("b");
    });
  });

  describe("go with animation options", () => {
    it("go() supports animated option", () => {
      // Previous/Nextの操作は、アニメーション込みで移動するかどうかを設定できるようにしたい
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", transitionMode: "css" }),
      );

      // go(direction, { animated: false }) でアニメーションなしに移動できる
      act(() => {
        result.current.go(1, { animated: false });
      });

      expect(result.current.activeId).toBe("b");
      // isAnimating should be false when animated: false
      expect(result.current.isAnimating).toBe(false);
    });

    it("go() defaults to animated based on transitionMode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", transitionMode: "css" }),
      );

      act(() => {
        result.current.go(1); // デフォルトはtransitionModeに従う
      });

      expect(result.current.activeId).toBe("b");
      // Should be animating when transitionMode is "css" and no animated option
      expect(result.current.isAnimating).toBe(true);
    });

    it("setActiveId() also supports animated option", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", transitionMode: "css" }),
      );

      act(() => {
        result.current.setActiveId("c", { animated: false });
      });

      expect(result.current.activeId).toBe("c");
      expect(result.current.isAnimating).toBe(false);
    });

    it("isAnimating becomes false after animation completes", async () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", transitionMode: "css" }),
      );

      act(() => {
        result.current.go(1);
      });

      expect(result.current.isAnimating).toBe(true);

      // Animation ends via endAnimation callback
      act(() => {
        result.current.endAnimation();
      });

      expect(result.current.isAnimating).toBe(false);
    });
  });
});
