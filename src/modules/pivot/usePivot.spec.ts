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

  describe("loop navigation mode", () => {
    it("returns loop navigationMode when set", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      expect(result.current.navigationMode).toBe("loop");
    });

    it("returns linear navigationMode by default", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.navigationMode).toBe("linear");
    });

    it("canGo returns true in both directions when in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      // At first item, can still go backward in loop mode
      expect(result.current.canGo(-1)).toBe(true);
      expect(result.current.canGo(1)).toBe(true);
    });

    it("canGo returns true at last item in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c", navigationMode: "loop" }),
      );

      // At last item, can still go forward in loop mode
      expect(result.current.canGo(1)).toBe(true);
      expect(result.current.canGo(-1)).toBe(true);
    });

    it("canGo returns false for single item in loop mode", () => {
      const items: ReadonlyArray<PivotItem<"a">> = [
        { id: "a", label: "Item A", content: "Content A" },
      ];
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      expect(result.current.canGo(1)).toBe(false);
      expect(result.current.canGo(-1)).toBe(false);
    });

    it("go(1) wraps from last to first in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c", navigationMode: "loop" }),
      );

      expect(result.current.activeId).toBe("c");

      act(() => {
        result.current.go(1);
      });

      expect(result.current.activeId).toBe("a");
    });

    it("go(-1) wraps from first to last in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      expect(result.current.activeId).toBe("a");

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.activeId).toBe("c");
    });

    it("go(2) wraps correctly in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b", navigationMode: "loop" }),
      );

      // b(1) + 2 = 3 % 3 = 0 -> a
      act(() => {
        result.current.go(2);
      });

      expect(result.current.activeId).toBe("a");
    });
  });

  describe("getVirtualPosition", () => {
    it("returns 0 for active item in linear mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.getVirtualPosition("b")).toBe(0);
    });

    it("returns -1 for previous item in linear mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.getVirtualPosition("a")).toBe(-1);
    });

    it("returns 1 for next item in linear mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.getVirtualPosition("c")).toBe(1);
    });

    it("returns null for non-adjacent items in linear mode", () => {
      const items: ReadonlyArray<PivotItem<"a" | "b" | "c" | "d">> = [
        { id: "a", label: "Item A", content: "Content A" },
        { id: "b", label: "Item B", content: "Content B" },
        { id: "c", label: "Item C", content: "Content C" },
        { id: "d", label: "Item D", content: "Content D" },
      ];
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      // 'c' and 'd' are not adjacent to 'a'
      expect(result.current.getVirtualPosition("c")).toBe(null);
      expect(result.current.getVirtualPosition("d")).toBe(null);
    });

    it("returns 0 for active item in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b", navigationMode: "loop" }),
      );

      expect(result.current.getVirtualPosition("b")).toBe(0);
    });

    it("returns 1 for first item when last is active in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c", navigationMode: "loop" }),
      );

      // When 'c' (last) is active, 'a' (first) should be at position 1 (next)
      expect(result.current.getVirtualPosition("a")).toBe(1);
    });

    it("returns -1 for last item when first is active in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      // When 'a' (first) is active, 'c' (last) should be at position -1 (prev)
      expect(result.current.getVirtualPosition("c")).toBe(-1);
    });

    it("returns null for non-adjacent items in loop mode with 4+ items", () => {
      const items: ReadonlyArray<PivotItem<"a" | "b" | "c" | "d">> = [
        { id: "a", label: "Item A", content: "Content A" },
        { id: "b", label: "Item B", content: "Content B" },
        { id: "c", label: "Item C", content: "Content C" },
        { id: "d", label: "Item D", content: "Content D" },
      ];
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      // 'a' is active, adjacent are 'd' (-1) and 'b' (1)
      // 'c' is not adjacent
      expect(result.current.getVirtualPosition("c")).toBe(null);
    });

    it("returns null for non-existent item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.getVirtualPosition("nonexistent" as "a")).toBe(null);
    });
  });

  describe("getItemPosition", () => {
    it("returns 0 for active item in linear mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b" }),
      );

      expect(result.current.getItemPosition("b")).toBe(0);
    });

    it("returns correct positions for all items in linear mode", () => {
      const items: ReadonlyArray<PivotItem<"a" | "b" | "c" | "d" | "e">> = [
        { id: "a", label: "A", content: "A" },
        { id: "b", label: "B", content: "B" },
        { id: "c", label: "C", content: "C" },
        { id: "d", label: "D", content: "D" },
        { id: "e", label: "E", content: "E" },
      ];
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c" }),
      );

      // c is at index 2, so:
      // a(0) -> -2, b(1) -> -1, c(2) -> 0, d(3) -> 1, e(4) -> 2
      expect(result.current.getItemPosition("a")).toBe(-2);
      expect(result.current.getItemPosition("b")).toBe(-1);
      expect(result.current.getItemPosition("c")).toBe(0);
      expect(result.current.getItemPosition("d")).toBe(1);
      expect(result.current.getItemPosition("e")).toBe(2);
    });

    it("returns 0 for active item in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "b", navigationMode: "loop" }),
      );

      expect(result.current.getItemPosition("b")).toBe(0);
    });

    it("returns shortest path position in loop mode (5 items)", () => {
      const items: ReadonlyArray<PivotItem<"a" | "b" | "c" | "d" | "e">> = [
        { id: "a", label: "A", content: "A" },
        { id: "b", label: "B", content: "B" },
        { id: "c", label: "C", content: "C" },
        { id: "d", label: "D", content: "D" },
        { id: "e", label: "E", content: "E" },
      ];
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c", navigationMode: "loop" }),
      );

      // c is active (index 2). 5 items total.
      // a(0): forward=3, backward=2 -> -2
      // b(1): forward=4, backward=1 -> -1
      // c(2): 0
      // d(3): forward=1, backward=4 -> 1
      // e(4): forward=2, backward=3 -> 2
      expect(result.current.getItemPosition("a")).toBe(-2);
      expect(result.current.getItemPosition("b")).toBe(-1);
      expect(result.current.getItemPosition("c")).toBe(0);
      expect(result.current.getItemPosition("d")).toBe(1);
      expect(result.current.getItemPosition("e")).toBe(2);
    });

    it("returns 1 for first item when last is active in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "c", navigationMode: "loop" }),
      );

      // c(2) is active. 3 items.
      // a(0): forward=1, backward=2 -> 1
      expect(result.current.getItemPosition("a")).toBe(1);
    });

    it("returns -1 for last item when first is active in loop mode", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a", navigationMode: "loop" }),
      );

      // a(0) is active. 3 items.
      // c(2): forward=2, backward=1 -> -1
      expect(result.current.getItemPosition("c")).toBe(-1);
    });

    it("returns null for non-existent item", () => {
      const items = createItems();
      const { result } = renderHook(() =>
        usePivot({ items, defaultActiveId: "a" }),
      );

      expect(result.current.getItemPosition("nonexistent" as "a")).toBe(null);
    });
  });
});
