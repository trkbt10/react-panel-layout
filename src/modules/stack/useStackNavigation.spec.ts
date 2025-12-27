/**
 * @file Tests for useStackNavigation hook.
 */
import { renderHook, act } from "@testing-library/react";
import { useStackNavigation } from "./useStackNavigation.js";
import type { StackPanel } from "./types.js";

type CallTracker = {
  calls: ReadonlyArray<ReadonlyArray<unknown>>;
  fn: (...args: ReadonlyArray<unknown>) => void;
};

const createCallTracker = (): CallTracker => {
  const calls: Array<ReadonlyArray<unknown>> = [];
  const fn = (...args: ReadonlyArray<unknown>): void => {
    calls.push(args);
  };
  return { calls, fn };
};

describe("useStackNavigation", () => {
  const createPanels = (): ReadonlyArray<StackPanel<"root" | "list" | "detail" | "edit">> => [
    { id: "root", title: "Root", content: "Root Content" },
    { id: "list", title: "List", content: "List Content" },
    { id: "detail", title: "Detail", content: "Detail Content" },
    { id: "edit", title: "Edit", content: "Edit Content" },
  ];

  describe("initialization", () => {
    it("starts with initial panel on stack", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
      expect(result.current.currentPanelId).toBe("root");
    });

    it("uses initialPanelId when provided", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, initialPanelId: "list", displayMode: "overlay" }),
      );

      expect(result.current.state.stack).toEqual(["list"]);
      expect(result.current.currentPanelId).toBe("list");
    });

    it("starts without reveal state", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      expect(result.current.state.isRevealing).toBe(false);
      expect(result.current.state.revealDepth).toBe(null);
    });
  });

  describe("push operation", () => {
    it("pushes panel onto stack", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      expect(result.current.state.stack).toEqual(["root", "list"]);
      expect(result.current.state.depth).toBe(1);
      expect(result.current.currentPanelId).toBe("list");
    });

    it("allows multiple pushes", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.push("edit");
      });

      expect(result.current.state.stack).toEqual(["root", "list", "detail", "edit"]);
      expect(result.current.state.depth).toBe(3);
    });

    it("ignores push for non-existent panel", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        // @ts-expect-error Testing invalid panel ID
        result.current.push("nonexistent");
      });

      expect(result.current.state.stack).toEqual(["root"]);
    });

    it("calls onPanelChange when pushing", () => {
      const panels = createPanels();
      const onPanelChange = createCallTracker();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay", onPanelChange: onPanelChange.fn }),
      );

      act(() => {
        result.current.push("list");
      });

      expect(onPanelChange.calls).toHaveLength(1);
      expect(onPanelChange.calls[0]?.[0]).toBe("list");
      expect(onPanelChange.calls[0]?.[1]).toBe(1);
    });
  });

  describe("go operation", () => {
    it("navigates back with go(-1)", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
      });

      expect(result.current.state.depth).toBe(2);

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.state.stack).toEqual(["root", "list"]);
      expect(result.current.state.depth).toBe(1);
      expect(result.current.currentPanelId).toBe("list");
    });

    it("navigates back multiple steps with go(-2)", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.push("edit");
      });

      act(() => {
        result.current.go(-2);
      });

      expect(result.current.state.stack).toEqual(["root", "list"]);
      expect(result.current.state.depth).toBe(1);
    });

    it("does not navigate past root", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
    });

    it("ignores forward navigation", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.go(1);
      });

      expect(result.current.state.stack).toEqual(["root"]);
    });
  });

  describe("move operation", () => {
    it("moves to absolute depth", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.push("edit");
      });

      act(() => {
        result.current.move(1);
      });

      expect(result.current.state.stack).toEqual(["root", "list"]);
      expect(result.current.state.depth).toBe(1);
    });

    it("moves to root with move(0)", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
      });

      act(() => {
        result.current.move(0);
      });

      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
    });

    it("ignores invalid depth", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      act(() => {
        result.current.move(5); // Beyond stack
      });

      expect(result.current.state.stack).toEqual(["root", "list"]);
    });
  });

  describe("replace operation", () => {
    it("replaces current panel", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      act(() => {
        result.current.replace("detail");
      });

      expect(result.current.state.stack).toEqual(["root", "detail"]);
      expect(result.current.currentPanelId).toBe("detail");
    });
  });

  describe("canGo", () => {
    it("returns true when can go back", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      expect(result.current.canGo(-1)).toBe(true);
    });

    it("returns false at root", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      expect(result.current.canGo(-1)).toBe(false);
    });

    it("returns false for forward navigation", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      expect(result.current.canGo(1)).toBe(false);
    });
  });

  describe("reveal operations", () => {
    it("reveals parent panel", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
      });

      act(() => {
        result.current.revealParent();
      });

      expect(result.current.state.isRevealing).toBe(true);
      expect(result.current.state.revealDepth).toBe(1); // list
    });

    it("reveals specific depth", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.push("edit");
      });

      act(() => {
        result.current.revealParent(0);
      });

      expect(result.current.state.revealDepth).toBe(0); // root
    });

    it("reveals root panel", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
      });

      act(() => {
        result.current.revealRoot();
      });

      expect(result.current.state.isRevealing).toBe(true);
      expect(result.current.state.revealDepth).toBe(0);
    });

    it("dismisses reveal", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
      });

      act(() => {
        result.current.revealParent();
      });

      expect(result.current.state.isRevealing).toBe(true);

      act(() => {
        result.current.dismissReveal();
      });

      expect(result.current.state.isRevealing).toBe(false);
      expect(result.current.state.revealDepth).toBe(null);
    });
  });

  describe("previousPanelId", () => {
    it("returns null at root", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      expect(result.current.previousPanelId).toBe(null);
    });

    it("returns previous panel ID", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      expect(result.current.previousPanelId).toBe("root");
    });
  });

  describe("getPanelProps", () => {
    it("returns correct props for active panel", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      const props = result.current.getPanelProps("root");

      expect(props["data-stack-panel"]).toBe("root");
      expect(props["data-depth"]).toBe(0);
      expect(props["data-active"]).toBe("true");
      expect(props["aria-hidden"]).toBe(false);
    });

    it("returns correct props for inactive panel", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      const props = result.current.getPanelProps("root");

      expect(props["data-active"]).toBe("false");
      expect(props["aria-hidden"]).toBe(true);
    });
  });

  describe("getBackButtonProps", () => {
    it("is disabled at root", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      const props = result.current.getBackButtonProps();

      expect(props.disabled).toBe(true);
    });

    it("is enabled when can go back", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      const props = result.current.getBackButtonProps();

      expect(props.disabled).toBe(false);
      expect(props["aria-label"]).toBe("Back to Root");
    });

    it("calls go(-1) on click", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      act(() => {
        result.current.getBackButtonProps().onClick();
      });

      expect(result.current.state.depth).toBe(0);
    });
  });

  describe("rapid navigation stress tests", () => {
    it("handles rapid push-go-push-go cycles correctly", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      // Simulate rapid clicks: push -> go back -> push -> go back (all in single act)
      act(() => {
        result.current.push("list");
        result.current.go(-1);
        result.current.push("detail");
        result.current.go(-1);
        result.current.push("edit");
        result.current.go(-1);
      });

      // Should end at root after all back navigations
      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
      expect(result.current.currentPanelId).toBe("root");
    });

    it("handles deep nesting then rapid back to root", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      // Push to max depth
      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.push("edit");
      });

      expect(result.current.state.depth).toBe(3);

      // Rapidly go back to root in single act
      act(() => {
        result.current.go(-1);
        result.current.go(-1);
        result.current.go(-1);
      });

      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
    });

    it("handles alternating push-go-push pattern", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");    // depth 1
        result.current.go(-1);          // depth 0
        result.current.push("list");    // depth 1
        result.current.push("detail");  // depth 2
        result.current.go(-1);          // depth 1
        result.current.go(-1);          // depth 0
        result.current.push("edit");    // depth 1
      });

      expect(result.current.state.stack).toEqual(["root", "edit"]);
      expect(result.current.state.depth).toBe(1);
    });

    it("handles excessive back navigation attempts gracefully", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
      });

      // Try to go back more times than possible
      act(() => {
        result.current.go(-1);
        result.current.go(-1); // Already at root, should be ignored
        result.current.go(-1); // Should be ignored
        result.current.go(-1); // Should be ignored
      });

      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
    });

    it("handles interleaved push/go/replace operations", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.replace("detail");
        result.current.push("edit");
        result.current.go(-1);
        result.current.replace("list");
      });

      expect(result.current.state.stack).toEqual(["root", "list"]);
      expect(result.current.currentPanelId).toBe("list");
    });

    it("maintains correct onPanelChange calls during rapid navigation", () => {
      const panels = createPanels();
      const onPanelChange = createCallTracker();
      const { result } = renderHook(() =>
        useStackNavigation({
          panels,
          displayMode: "overlay",
          onPanelChange: onPanelChange.fn,
        }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.go(-1);
        result.current.go(-1);
      });

      // Should have called onPanelChange for each navigation
      // Final state should be at root
      expect(result.current.state.depth).toBe(0);
      expect(result.current.currentPanelId).toBe("root");
    });

    it("handles move(0) after deep navigation", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
        result.current.push("edit");
        result.current.move(0); // Jump directly to root
      });

      expect(result.current.state.stack).toEqual(["root"]);
      expect(result.current.state.depth).toBe(0);
    });

    it("canGo returns correct value during rapid state changes", () => {
      const panels = createPanels();
      const { result } = renderHook(() =>
        useStackNavigation({ panels, displayMode: "overlay" }),
      );

      act(() => {
        result.current.push("list");
        result.current.push("detail");
      });

      expect(result.current.canGo(-1)).toBe(true);
      expect(result.current.canGo(-2)).toBe(true);
      expect(result.current.canGo(-3)).toBe(false);

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.canGo(-1)).toBe(true);
      expect(result.current.canGo(-2)).toBe(false);

      act(() => {
        result.current.go(-1);
      });

      expect(result.current.canGo(-1)).toBe(false);
    });
  });
});
