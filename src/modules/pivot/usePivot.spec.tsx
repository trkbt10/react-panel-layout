/**
 * @file Unit tests for usePivot hook.
 */
import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { usePivot } from "./usePivot";
import type { PivotItem } from "./types";

const mockItems: PivotItem[] = [
  { id: "tab1", label: "Tab 1", content: <div>Content 1</div> },
  { id: "tab2", label: "Tab 2", content: <div>Content 2</div> },
  { id: "tab3", label: "Tab 3", content: <div>Content 3</div>, disabled: true },
];

type CallRecord = { id: string };
const createFakeCallback = (): { callback: (id: string) => void; calls: CallRecord[] } => {
  const calls: CallRecord[] = [];
  return {
    callback: (id: string) => {
      calls.push({ id });
    },
    calls,
  };
};

describe("usePivot", () => {
  describe("initialization", () => {
    it("initializes with first enabled item when no default provided", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems }));
      expect(result.current.activeId).toBe("tab1");
    });

    it("initializes with defaultActiveId when provided", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab2" }));
      expect(result.current.activeId).toBe("tab2");
    });

    it("respects controlled activeId", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, activeId: "tab2" }));
      expect(result.current.activeId).toBe("tab2");
    });

    it("throws when no enabled items are provided", () => {
      const disabledItems: PivotItem[] = [
        { id: "tab1", label: "Tab 1", content: <div>Content 1</div>, disabled: true },
      ];

      expect(() => {
        renderHook(() => usePivot({ items: disabledItems }));
      }).toThrow("usePivot: No enabled items provided");
    });
  });

  describe("state changes", () => {
    it("changes active item via setActiveId in uncontrolled mode", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab1" }));

      act(() => {
        result.current.setActiveId("tab2");
      });

      expect(result.current.activeId).toBe("tab2");
    });

    it("calls onActiveChange when changing active item", () => {
      const { callback: onActiveChange, calls } = createFakeCallback();
      const { result } = renderHook(() => usePivot({ items: mockItems, onActiveChange }));

      act(() => {
        result.current.setActiveId("tab2");
      });

      expect(calls.length).toBe(1);
      expect(calls[0].id).toBe("tab2");
    });

    it("does not activate disabled items", () => {
      const { callback: onActiveChange, calls } = createFakeCallback();
      const { result } = renderHook(() =>
        usePivot({ items: mockItems, defaultActiveId: "tab1", onActiveChange }),
      );

      act(() => {
        result.current.setActiveId("tab3");
      });

      expect(result.current.activeId).toBe("tab1");
      expect(calls.length).toBe(0);
    });

    it("ignores non-existent item ids", () => {
      const { callback: onActiveChange, calls } = createFakeCallback();
      const { result } = renderHook(() =>
        usePivot({ items: mockItems, defaultActiveId: "tab1", onActiveChange }),
      );

      act(() => {
        result.current.setActiveId("nonexistent" as "tab1");
      });

      expect(result.current.activeId).toBe("tab1");
      expect(calls.length).toBe(0);
    });
  });

  describe("isActive helper", () => {
    it("returns correct active state", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab2" }));

      expect(result.current.isActive("tab1")).toBe(false);
      expect(result.current.isActive("tab2")).toBe(true);
      expect(result.current.isActive("tab3")).toBe(false);
    });
  });

  describe("getItemProps", () => {
    it("returns correct props for active item", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab1" }));

      const props = result.current.getItemProps("tab1");

      expect(props["data-pivot-item"]).toBe("tab1");
      expect(props["data-active"]).toBe("true");
      expect(props["aria-selected"]).toBe(true);
      expect(props.tabIndex).toBe(0);
      expect(typeof props.onClick).toBe("function");
    });

    it("returns correct props for inactive item", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab1" }));

      const props = result.current.getItemProps("tab2");

      expect(props["data-pivot-item"]).toBe("tab2");
      expect(props["data-active"]).toBe("false");
      expect(props["aria-selected"]).toBe(false);
      expect(props.tabIndex).toBe(-1);
    });

    it("onClick changes active item", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab1" }));

      const props = result.current.getItemProps("tab2");
      act(() => {
        props.onClick();
      });

      expect(result.current.activeId).toBe("tab2");
    });
  });

  describe("Outlet", () => {
    it("returns a component that renders content wrapped in React.Activity", () => {
      const { result } = renderHook(() => usePivot({ items: mockItems, defaultActiveId: "tab1" }));

      const { Outlet } = result.current;
      expect(typeof Outlet).toBe("function");
      const content = Outlet({});
      expect(content).toBeDefined();
    });
  });

  describe("controlled mode", () => {
    it("does not update internal state when controlled", () => {
      const { callback: onActiveChange, calls } = createFakeCallback();
      const { result, rerender } = renderHook(
        ({ activeId }: { activeId: string }) => usePivot({ items: mockItems, activeId, onActiveChange }),
        { initialProps: { activeId: "tab1" } },
      );

      act(() => {
        result.current.setActiveId("tab2");
      });

      // onActiveChange should be called
      expect(calls.length).toBe(1);
      expect(calls[0].id).toBe("tab2");
      // But activeId should still be the controlled value until parent updates
      expect(result.current.activeId).toBe("tab1");

      // Simulate parent updating the controlled value
      rerender({ activeId: "tab2" });
      expect(result.current.activeId).toBe("tab2");
    });
  });
});
