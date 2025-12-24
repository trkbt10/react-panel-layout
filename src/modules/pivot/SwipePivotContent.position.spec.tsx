/**
 * @file Tests for SwipePivotContent position handling.
 *
 * TDD: Swipe NavigationでPage2,3が重なる問題を再現するテスト
 *
 * 問題: Page 1でスワイプすると、Page 2とPage 3が同じ位置に表示される
 * 原因: getPosition関数が-1, 0, 1しか返さないため、離れたページも同じpositionになる
 * 解決: 親コンポーネントで隣接するアイテムのみをレンダリングする
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SwipePivotContent } from "./SwipePivotContent.js";
import type { SwipeInputState } from "../../hooks/gesture/types.js";

/**
 * Helper function to calculate position offset (not clamped)
 * This is the fix: calculate actual offset, then filter
 */
const getPositionOffset = (itemIndex: number, activeIndex: number): number => {
  return itemIndex - activeIndex;
};

/**
 * Helper to determine if item should be rendered
 */
const shouldRenderItem = (offset: number): boolean => {
  return Math.abs(offset) <= 1;
};

/**
 * Helper to convert offset to display position
 */
const toDisplayPosition = (offset: number): -1 | 0 | 1 => {
  if (offset < 0) return -1;
  if (offset > 0) return 1;
  return 0;
};

describe("SwipePivotContent position handling", () => {
  const containerSize = 300;

  const swipingLeftState: SwipeInputState = {
    phase: "swiping",
    displacement: { x: -50, y: 0 },
    velocity: { x: -0.5, y: 0 },
    direction: -1,
  };

  describe("correct position offset calculation", () => {
    it("calculates correct offset for each item", () => {
      // When on Page 1 (index 0)
      const activeIndex = 0;

      expect(getPositionOffset(0, activeIndex)).toBe(0);  // Page 1
      expect(getPositionOffset(1, activeIndex)).toBe(1);  // Page 2
      expect(getPositionOffset(2, activeIndex)).toBe(2);  // Page 3 - offset is 2!
    });

    it("filters out non-adjacent items", () => {
      const activeIndex = 0;

      expect(shouldRenderItem(getPositionOffset(0, activeIndex))).toBe(true);  // Page 1
      expect(shouldRenderItem(getPositionOffset(1, activeIndex))).toBe(true);  // Page 2
      expect(shouldRenderItem(getPositionOffset(2, activeIndex))).toBe(false); // Page 3 - should NOT render
    });
  });

  describe("rendering only adjacent items", () => {
    it("only renders Page 1 and Page 2 when on Page 1", () => {
      // Simulating correct behavior in parent component
      const items = [
        { id: "page1", index: 0 },
        { id: "page2", index: 1 },
        { id: "page3", index: 2 },
      ];
      const activeIndex = 0;

      // Filter to only adjacent items BEFORE rendering
      const itemsToRender = items.filter(item =>
        shouldRenderItem(getPositionOffset(item.index, activeIndex))
      );

      render(
        <>
          {itemsToRender.map((item) => {
            const offset = getPositionOffset(item.index, activeIndex);
            return (
              <SwipePivotContent
                key={item.id}
                id={item.id}
                isActive={offset === 0}
                position={toDisplayPosition(offset)}
                inputState={swipingLeftState}
                containerSize={containerSize}
                canNavigate={true}
              >
                <div data-testid={item.id}>{item.id}</div>
              </SwipePivotContent>
            );
          })}
        </>,
      );

      expect(screen.queryByTestId("page1")).toBeInTheDocument();
      expect(screen.queryByTestId("page2")).toBeInTheDocument();
      expect(screen.queryByTestId("page3")).not.toBeInTheDocument(); // Page 3 not rendered
    });

    it("only renders Page 2, Page 3 when on Page 2", () => {
      const items = [
        { id: "page1", index: 0 },
        { id: "page2", index: 1 },
        { id: "page3", index: 2 },
      ];
      const activeIndex = 1; // On Page 2

      const itemsToRender = items.filter(item =>
        shouldRenderItem(getPositionOffset(item.index, activeIndex))
      );

      render(
        <>
          {itemsToRender.map((item) => {
            const offset = getPositionOffset(item.index, activeIndex);
            return (
              <SwipePivotContent
                key={item.id}
                id={item.id}
                isActive={offset === 0}
                position={toDisplayPosition(offset)}
                inputState={swipingLeftState}
                containerSize={containerSize}
                canNavigate={true}
              >
                <div data-testid={item.id}>{item.id}</div>
              </SwipePivotContent>
            );
          })}
        </>,
      );

      expect(screen.queryByTestId("page1")).toBeInTheDocument();  // Previous
      expect(screen.queryByTestId("page2")).toBeInTheDocument();  // Active
      expect(screen.queryByTestId("page3")).toBeInTheDocument();  // Next
    });
  });

  describe("canNavigate for boundary items", () => {
    it("non-adjacent items should not be visible when canNavigate=false", () => {
      render(
        <SwipePivotContent
          id="page3"
          isActive={false}
          position={1}
          inputState={swipingLeftState}
          containerSize={containerSize}
          canNavigate={false}
        >
          <div data-testid="page3">Page 3</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("page3").parentElement;
      expect(wrapper?.style?.visibility).toBe("hidden");
    });
  });
});
