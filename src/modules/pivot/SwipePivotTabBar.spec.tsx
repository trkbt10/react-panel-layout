/**
 * @file Tests for SwipePivotTabBar - covering all navigation patterns
 *
 * Slot-based rendering model:
 * - Tabs are rendered at slot positions, not by item
 * - Active tab is always at slot 0 (center)
 * - Same tab may appear at multiple slots (clones for infinite loop)
 * - Query by data-slot attribute for unique identification
 */
import { render, screen, act } from "@testing-library/react";
import * as React from "react";
import { SwipePivotTabBar } from "./SwipePivotTabBar";
import type { IndicatorRenderProps } from "./SwipePivotTabBar";
import type { SwipeInputState } from "../../hooks/gesture/types";

// Mock requestAnimationFrame for animation testing
const rafState = {
  callbacks: [] as FrameRequestCallback[],
  id: 0,
  originalRAF: globalThis.requestAnimationFrame,
  originalCAF: globalThis.cancelAnimationFrame,
};

const resetRafState = (): void => {
  rafState.callbacks = [];
  rafState.id = 0;
};

const mockRAF = (callback: FrameRequestCallback): number => {
  rafState.callbacks = [...rafState.callbacks, callback];
  rafState.id += 1;
  return rafState.id;
};

const mockCAF = (id: number): void => {
  void id;
};

const flushRAF = (): void => {
  const callbacks = rafState.callbacks;
  rafState.callbacks = [];
  callbacks.forEach((cb) => cb(performance.now()));
};

type RenderTracker<TArgs extends ReadonlyArray<unknown>, TResult> = {
  calls: ReadonlyArray<TArgs>;
  fn: (...args: TArgs) => TResult;
};

const createRenderTracker = <TArgs extends ReadonlyArray<unknown>, TResult>(
  implementation: (...args: TArgs) => TResult,
): RenderTracker<TArgs, TResult> => {
  const calls: Array<TArgs> = [];
  const fn = (...args: TArgs): TResult => {
    calls.push(args);
    return implementation(...args);
  };
  return { calls, fn };
};

beforeEach(() => {
  resetRafState();
  globalThis.requestAnimationFrame = mockRAF;
  globalThis.cancelAnimationFrame = mockCAF;
});

afterEach(() => {
  globalThis.requestAnimationFrame = rafState.originalRAF;
  globalThis.cancelAnimationFrame = rafState.originalCAF;
});

const createItems = () => [
  { id: "tab1", label: "Tab 1" },
  { id: "tab2", label: "Tab 2" },
  { id: "tab3", label: "Tab 3" },
  { id: "tab4", label: "Tab 4" },
  { id: "tab5", label: "Tab 5" },
];

const idleState: SwipeInputState = {
  phase: "idle",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  direction: 0,
};

const swipingLeftState = (displacement: number): SwipeInputState => ({
  phase: "swiping",
  displacement: { x: displacement, y: 0 },
  velocity: { x: -0.5, y: 0 },
  direction: -1,
});

const endedState = (direction: -1 | 0 | 1): SwipeInputState => ({
  phase: "ended",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  direction,
});

const defaultProps = {
  items: createItems(),
  tabWidth: 100,
  viewportWidth: 500,
  navigationMode: "loop" as const,
  renderTab: (item: { id: string; label?: string }, isActive: boolean) => (
    <button data-testid={`tab-${item.id}`} data-active={isActive}>
      {item.label}
    </button>
  ),
};

// Helper: centerX for default props
const centerX = (defaultProps.viewportWidth - defaultProps.tabWidth) / 2; // 200

// Helper to get slot element by position
const getSlot = (container: HTMLElement, slotPosition: number): HTMLElement | null => {
  return container.querySelector(`[data-slot="${slotPosition}"]`);
};

// Helper to get all visible slots
describe("SwipePivotTabBar", () => {
  describe("Initial render", () => {
    it("renders tabs at slot positions", () => {
      const { container } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Slot 0 should have tab1 (active)
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab1");
      expect(slot0).toHaveAttribute("data-active", "true");

      // Slot 1 should have tab2
      const slot1 = getSlot(container, 1);
      expect(slot1).toHaveAttribute("data-pivot-tab", "tab2");

      // Slot -1 should have tab5 (loop)
      const slotMinus1 = getSlot(container, -1);
      expect(slotMinus1).toHaveAttribute("data-pivot-tab", "tab5");
    });

    it("centers active tab in viewport", () => {
      const { container } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab3"
          activeIndex={2}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Slot 0 always has active tab, at center
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab3");
      expect(slot0).toHaveStyle({ left: `${centerX}px` });
      expect(slot0).toHaveStyle({ transform: "translateX(0px)" });
    });
  });

  describe("Pattern 1: Swipe to adjacent tab (threshold exceeded)", () => {
    it("follows finger during swipe", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Start swiping left
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-50)}
        />
      );

      // All slots should be offset by displacement
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveStyle({ transform: "translateX(-50px)" });

      const slot1 = getSlot(container, 1);
      expect(slot1).toHaveStyle({ transform: "translateX(50px)" }); // 100 + (-50)
    });

    it("animates to new position after swipe ends", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-150)}
        />
      );

      // Swipe ends, activeIndex changes to 1
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab2"
          activeIndex={1}
          itemCount={5}
          inputState={endedState(-1)}
        />
      );

      // Slot 0 should now have tab2 (new active)
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab2");
      expect(slot0).toHaveAttribute("data-active", "true");
    });
  });

  describe("Pattern 2: Swipe cancel (threshold not met)", () => {
    it("returns to original position when swipe is cancelled", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-30)}
        />
      );

      // Swipe ends without threshold, activeIndex stays the same
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Slot 0 should still have tab1
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab1");
    });
  });

  describe("Pattern 3: Click adjacent tab", () => {
    it("animates when adjacent tab is clicked", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Tab2 is clicked, activeIndex changes to 1
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab2"
          activeIndex={1}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Slot 0 should now have tab2
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab2");
    });
  });

  describe("Pattern 4: Click non-adjacent tab", () => {
    it("animates when distant tab is clicked (Tab 1 → Tab 5)", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Tab5 is clicked (which is at slot -1 in loop mode from tab1)
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab5"
          activeIndex={4}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Slot 0 should now have tab5
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab5");
    });

    it("calculates shortest path in loop mode (Tab 1 → Tab 5 = -1 step)", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // In loop mode, Tab5 is at slot -1 relative to Tab1
      // So going Tab1 → Tab5 should animate backward (shortest path)
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab5"
          activeIndex={4}
          itemCount={5}
          inputState={idleState}
        />
      );

      // After transition, slot configuration should be:
      // Slot 0: tab5 (active)
      // Slot 1: tab1
      // Slot -1: tab4
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab5");

      const slot1 = getSlot(container, 1);
      expect(slot1).toHaveAttribute("data-pivot-tab", "tab1");

      const slotMinus1 = getSlot(container, -1);
      expect(slotMinus1).toHaveAttribute("data-pivot-tab", "tab4");
    });
  });

  describe("Pattern 5: Previous/Next button click", () => {
    it("animates forward when Next button is clicked", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab2"
          activeIndex={1}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Next button clicked, goes to tab3
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab3"
          activeIndex={2}
          itemCount={5}
          inputState={idleState}
        />
      );

      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab3");
    });

    it("animates backward when Previous button is clicked", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab3"
          activeIndex={2}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Previous button clicked, goes to tab2
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab2"
          activeIndex={1}
          itemCount={5}
          inputState={idleState}
        />
      );

      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab2");
    });
  });

  describe("Pattern 6: Loop boundary swipe (Tab 5 → Tab 1)", () => {
    it("swipes seamlessly from Tab 5 to Tab 1", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab5"
          activeIndex={4}
          itemCount={5}
          inputState={idleState}
        />
      );

      // At Tab5, slot 1 should have Tab1 (loop)
      const slot1Before = getSlot(container, 1);
      expect(slot1Before).toHaveAttribute("data-pivot-tab", "tab1");

      // Swipe left to go to Tab1
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab5"
          activeIndex={4}
          itemCount={5}
          inputState={swipingLeftState(-100)}
        />
      );

      // After swipe completes, Tab1 becomes active
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={endedState(-1)}
        />
      );

      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab1");
    });
  });

  describe("Pattern 7: Loop boundary click (Tab 5 → Tab 1)", () => {
    it("clicking Tab 1 from Tab 5 animates correctly in loop mode", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab5"
          activeIndex={4}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Click Tab1
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Tab1 should now be at slot 0
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "tab1");

      // Tab5 should be at slot -1
      const slotMinus1 = getSlot(container, -1);
      expect(slotMinus1).toHaveAttribute("data-pivot-tab", "tab5");
    });
  });

  describe("Pattern 8: Linear mode", () => {
    it("does not wrap in linear mode", () => {
      const { container } = render(
        <SwipePivotTabBar
          {...defaultProps}
          navigationMode="linear"
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // In linear mode, slot -1 should be empty (no tab before tab1)
      const slotMinus1 = getSlot(container, -1);
      expect(slotMinus1).toBeNull();

      // Slot 4 should have tab5
      const slot4 = getSlot(container, 4);
      expect(slot4).toHaveAttribute("data-pivot-tab", "tab5");
    });
  });

  describe("Visibility", () => {
    it("hides tabs outside viewport", () => {
      const { container } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab3"
          activeIndex={2}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Slot 0 (center) should be visible
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveStyle({ visibility: "visible" });

      // Distant slots should be hidden
      const slot4 = getSlot(container, 4);
      if (slot4) {
        expect(slot4).toHaveStyle({ visibility: "hidden" });
      }
    });

    it("shows tabs that enter viewport during swipe", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Swipe to reveal more tabs
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-100)}
        />
      );

      // Slot 1 should be visible (tab2)
      const slot1 = getSlot(container, 1);
      expect(slot1).toHaveStyle({ visibility: "visible" });
    });
  });

  describe("Clone handling for small item counts", () => {
    it("handles 2 items in loop mode", () => {
      const twoItems = [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ];

      const { container } = render(
        <SwipePivotTabBar
          {...defaultProps}
          items={twoItems}
          activeId="a"
          activeIndex={0}
          itemCount={2}
          inputState={idleState}
        />
      );

      // Slot 0: a
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "a");

      // Slot 1: b
      const slot1 = getSlot(container, 1);
      expect(slot1).toHaveAttribute("data-pivot-tab", "b");

      // Slot -1: b (loop)
      const slotMinus1 = getSlot(container, -1);
      expect(slotMinus1).toHaveAttribute("data-pivot-tab", "b");

      // Slot 2: a (clone)
      const slot2 = getSlot(container, 2);
      expect(slot2).toHaveAttribute("data-pivot-tab", "a");
    });

    it("handles 3 items in loop mode", () => {
      const threeItems = [
        { id: "x", label: "X" },
        { id: "y", label: "Y" },
        { id: "z", label: "Z" },
      ];

      const { container } = render(
        <SwipePivotTabBar
          {...defaultProps}
          items={threeItems}
          activeId="x"
          activeIndex={0}
          itemCount={3}
          inputState={idleState}
        />
      );

      // Slot 0: x (active)
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveAttribute("data-pivot-tab", "x");

      // Slot 1: y
      const slot1 = getSlot(container, 1);
      expect(slot1).toHaveAttribute("data-pivot-tab", "y");

      // Slot -1: z
      const slotMinus1 = getSlot(container, -1);
      expect(slotMinus1).toHaveAttribute("data-pivot-tab", "z");
    });
  });

  describe("Sliding indicator (iOS-style)", () => {
    it("renders indicator with correct offset props", () => {
      const indicatorTracker = createRenderTracker<readonly [IndicatorRenderProps], React.ReactNode>(() => (
        <div data-testid="indicator" />
      ));

      render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
          renderIndicator={indicatorTracker.fn}
        />
      );

      expect(indicatorTracker.calls).toHaveLength(1);
      expect(indicatorTracker.calls[0]?.[0]).toEqual({
        offsetPx: 0,
        tabWidth: 100,
        centerX: 200,
        isSwiping: false,
        isAnimating: false,
      });

      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });

    it("passes swipe displacement to indicator", () => {
      const indicatorTracker = createRenderTracker<readonly [IndicatorRenderProps], React.ReactNode>(() => (
        <div data-testid="indicator" />
      ));

      const { rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
          renderIndicator={indicatorTracker.fn}
        />
      );

      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-60)}
          renderIndicator={indicatorTracker.fn}
        />
      );

      // Last call should have the swipe offset
      expect(indicatorTracker.calls.length).toBeGreaterThan(0);
      const lastCall = indicatorTracker.calls[indicatorTracker.calls.length - 1]![0];
      expect(lastCall.offsetPx).toBe(-60);
      expect(lastCall.isSwiping).toBe(true);
    });

    it("indicator follows same offset as tabs", () => {
      const indicatorState = { offset: 0 };

      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
          renderIndicator={({ offsetPx }) => {
            indicatorState.offset = offsetPx;
            return <div data-testid="indicator" />;
          }}
        />
      );

      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-80)}
          renderIndicator={({ offsetPx }) => {
            indicatorState.offset = offsetPx;
            return <div data-testid="indicator" />;
          }}
        />
      );

      // Verify indicator offset matches tab offset
      const slot0 = getSlot(container, 0);
      expect(slot0).toHaveStyle({ transform: "translateX(-80px)" });
      expect(indicatorState.offset).toBe(-80);
    });
  });

  describe("Continuous offset model", () => {
    it("all slots move together during swipe", () => {
      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={idleState}
        />
      );

      // Initial positions
      const slot0Before = getSlot(container, 0);
      const slot1Before = getSlot(container, 1);
      expect(slot0Before).toHaveStyle({ transform: "translateX(0px)" });
      expect(slot1Before).toHaveStyle({ transform: "translateX(100px)" });

      // During swipe, all slots offset by same amount
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          inputState={swipingLeftState(-75)}
        />
      );

      const slot0After = getSlot(container, 0);
      const slot1After = getSlot(container, 1);
      expect(slot0After).toHaveStyle({ transform: "translateX(-75px)" });
      expect(slot1After).toHaveStyle({ transform: "translateX(25px)" }); // 100 - 75
    });
  });

  describe("Fixed tabs mode (iOS segmented control style)", () => {
    it("tabs stay fixed during swipe, only indicator moves", () => {
      const indicatorState = { offset: 0, centerX: 0 };

      const { container, rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          fixedTabs={true}
          inputState={idleState}
          renderIndicator={({ offsetPx, centerX }) => {
            indicatorState.offset = offsetPx;
            indicatorState.centerX = centerX;
            return <div data-testid="indicator" />;
          }}
        />
      );

      // All tabs should be rendered (not slot-based)
      const tabs = container.querySelectorAll("[data-pivot-tab]");
      expect(tabs.length).toBe(5);

      // Initial state: indicator at first tab position
      // viewportWidth=500, 5 tabs * 100px = 500px, centeringOffset = (500-500)/2 = 0
      // centerX is fixed at centeringOffset = 0
      // offsetPx = activeIndex * tabWidth = 0 * 100 = 0
      expect(indicatorState.centerX).toBe(0);
      expect(indicatorState.offset).toBe(0);

      // During swipe, tabs should NOT have transform (they're fixed)
      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          fixedTabs={true}
          inputState={swipingLeftState(-80)}
          renderIndicator={({ offsetPx, centerX }) => {
            indicatorState.offset = offsetPx;
            indicatorState.centerX = centerX;
            return <div data-testid="indicator" />;
          }}
        />
      );

      // Indicator should move OPPOSITE to swipe direction
      // Swipe left (displacement = -80) → indicator moves right (+80)
      expect(indicatorState.offset).toBe(80);

      // Tabs should not have any transform applied (position is relative, not absolute with transform)
      const tabsAfterSwipe = container.querySelectorAll("[data-pivot-tab]");
      tabsAfterSwipe.forEach((tab) => {
        const style = window.getComputedStyle(tab as Element);
        expect(style.position).toBe("relative");
        // No translateX in transform (or transform is 'none')
        expect(style.transform).not.toMatch(/translateX/);
      });
    });

    it("indicator moves to new tab position when activeIndex changes", () => {
      const indicatorState = { offsetPx: 0, centerX: 0 };

      // Mock performance.now to control animation timing
      const originalNow = performance.now;
      const timeState = { value: 0 };
      performance.now = () => timeState.value;

      const { rerender } = render(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab1"
          activeIndex={0}
          itemCount={5}
          fixedTabs={true}
          inputState={idleState}
          renderIndicator={({ offsetPx, centerX }) => {
            indicatorState.offsetPx = offsetPx;
            indicatorState.centerX = centerX;
            return <div data-testid="indicator" />;
          }}
        />
      );

      // centerX is fixed at centering offset (0 for 5 tabs * 100px = 500px viewport)
      expect(indicatorState.centerX).toBe(0);
      // offsetPx includes active tab position
      expect(indicatorState.offsetPx).toBe(0); // Tab 1 at position 0

      rerender(
        <SwipePivotTabBar
          {...defaultProps}
          activeId="tab3"
          activeIndex={2}
          itemCount={5}
          fixedTabs={true}
          inputState={idleState}
          renderIndicator={({ offsetPx, centerX }) => {
            indicatorState.offsetPx = offsetPx;
            indicatorState.centerX = centerX;
            return <div data-testid="indicator" />;
          }}
        />
      );

      // Animation starts - flush RAF callbacks until animation completes
      timeState.value = 500; // Advance past animation duration (300ms default)
      act(() => {
        Array.from({ length: 10 }).forEach(() => {
          flushRAF();
        });
      });

      // centerX stays fixed
      expect(indicatorState.centerX).toBe(0);
      // offsetPx now includes Tab 3 position (after animation completes)
      expect(indicatorState.offsetPx).toBe(200); // Tab 3 at position 2 * 100
      performance.now = originalNow;
    });
  });
});
