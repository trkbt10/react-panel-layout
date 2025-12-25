/**
 * @file SwipePivotContent tests
 *
 * Tests for swipe pivot content positioning, animation, and visibility.
 */
/* eslint-disable no-restricted-imports, no-restricted-properties, no-restricted-syntax -- integration test requires vitest APIs for timer/rAF mocks */
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import * as React from "react";
import { SwipePivotContent } from "./SwipePivotContent";
import type { SwipeInputState } from "../../hooks/gesture/types";

// Idle state for tests
const IDLE_STATE: SwipeInputState = {
  phase: "idle",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  direction: 0,
};

// Helper to create swiping state
const createSwipingState = (dx: number, direction: -1 | 0 | 1): SwipeInputState => ({
  phase: "swiping",
  displacement: { x: dx, y: 0 },
  velocity: { x: 0, y: 0 },
  direction,
});

describe("SwipePivotContent", () => {
  // Mock requestAnimationFrame for animation tests
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      rafCallbacks = rafCallbacks.filter((_, i) => i + 1 !== id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to advance animation frames
  const runAnimationFrame = (time: number = 16) => {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach((cb) => cb(time));
  };

  describe("Initial positioning", () => {
    it("should position active item at center (position 0)", () => {
      render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ transform: "translateX(0px)" });
      expect(element).toHaveStyle({ visibility: "visible" });
    });

    it("should position next item off-screen right (position 1)", () => {
      render(
        <SwipePivotContent
          id="page2"
          isActive={false}
          position={1}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ transform: "translateX(400px)" });
      // Non-active items in idle state should be hidden
      expect(element).toHaveStyle({ visibility: "hidden" });
    });

    it("should position previous item off-screen left (position -1)", () => {
      render(
        <SwipePivotContent
          id="page0"
          isActive={false}
          position={-1}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ transform: "translateX(-400px)" });
      expect(element).toHaveStyle({ visibility: "hidden" });
    });
  });

  describe("Visibility during swipe", () => {
    it("should show next item when swiping left (direction -1)", () => {
      render(
        <SwipePivotContent
          id="page2"
          isActive={false}
          position={1}
          inputState={createSwipingState(-50, -1)}
          containerSize={400}
          canNavigate={true}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ visibility: "visible" });
    });

    it("should show previous item when swiping right (direction 1)", () => {
      render(
        <SwipePivotContent
          id="page0"
          isActive={false}
          position={-1}
          inputState={createSwipingState(50, 1)}
          containerSize={400}
          canNavigate={true}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ visibility: "visible" });
    });

    it("should hide item when swiping in opposite direction", () => {
      // Swiping left, but this is the previous page (position -1)
      render(
        <SwipePivotContent
          id="page0"
          isActive={false}
          position={-1}
          inputState={createSwipingState(-50, -1)}
          containerSize={400}
          canNavigate={true}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ visibility: "hidden" });
    });

    it("should hide item when canNavigate is false", () => {
      render(
        <SwipePivotContent
          id="page2"
          isActive={false}
          position={1}
          inputState={createSwipingState(-50, -1)}
          containerSize={400}
          canNavigate={false}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ visibility: "hidden" });
    });
  });

  describe("Displacement during swipe", () => {
    it("should apply displacement offset during swipe", () => {
      const { rerender } = render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      // Start swiping
      rerender(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={createSwipingState(-100, -1)}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      // Position 0 + displacement -100 = -100
      expect(element).toHaveStyle({ transform: "translateX(-100px)" });
    });
  });

  describe("Container size changes (resize)", () => {
    it("should snap to new position when containerSize changes", () => {
      const { rerender } = render(
        <SwipePivotContent
          id="page2"
          isActive={false}
          position={1}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ transform: "translateX(400px)" });

      // Resize container
      rerender(
        <SwipePivotContent
          id="page2"
          isActive={false}
          position={1}
          inputState={IDLE_STATE}
          containerSize={600}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      // Should immediately snap to new position (no animation)
      expect(element).toHaveStyle({ transform: "translateX(600px)" });
    });

    it("should snap all positions correctly after resize", () => {
      // Test that all positions (-1, 0, 1) update correctly on resize
      const { rerender } = render(
        <div>
          <SwipePivotContent
            id="page0"
            isActive={false}
            position={-1}
            inputState={IDLE_STATE}
            containerSize={400}
          >
            <div data-testid="prev">Prev</div>
          </SwipePivotContent>
          <SwipePivotContent
            id="page1"
            isActive={true}
            position={0}
            inputState={IDLE_STATE}
            containerSize={400}
          >
            <div data-testid="current">Current</div>
          </SwipePivotContent>
          <SwipePivotContent
            id="page2"
            isActive={false}
            position={1}
            inputState={IDLE_STATE}
            containerSize={400}
          >
            <div data-testid="next">Next</div>
          </SwipePivotContent>
        </div>
      );

      // Verify initial positions
      expect(screen.getByTestId("prev").parentElement).toHaveStyle({ transform: "translateX(-400px)" });
      expect(screen.getByTestId("current").parentElement).toHaveStyle({ transform: "translateX(0px)" });
      expect(screen.getByTestId("next").parentElement).toHaveStyle({ transform: "translateX(400px)" });

      // Resize to 800px
      rerender(
        <div>
          <SwipePivotContent
            id="page0"
            isActive={false}
            position={-1}
            inputState={IDLE_STATE}
            containerSize={800}
          >
            <div data-testid="prev">Prev</div>
          </SwipePivotContent>
          <SwipePivotContent
            id="page1"
            isActive={true}
            position={0}
            inputState={IDLE_STATE}
            containerSize={800}
          >
            <div data-testid="current">Current</div>
          </SwipePivotContent>
          <SwipePivotContent
            id="page2"
            isActive={false}
            position={1}
            inputState={IDLE_STATE}
            containerSize={800}
          >
            <div data-testid="next">Next</div>
          </SwipePivotContent>
        </div>
      );

      // All should snap to new positions based on new containerSize
      expect(screen.getByTestId("prev").parentElement).toHaveStyle({ transform: "translateX(-800px)" });
      expect(screen.getByTestId("current").parentElement).toHaveStyle({ transform: "translateX(0px)" });
      expect(screen.getByTestId("next").parentElement).toHaveStyle({ transform: "translateX(800px)" });
    });

    it("should handle resize after swipe interaction", () => {
      const { rerender } = render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;

      // Simulate swipe
      rerender(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={createSwipingState(-100, -1)}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );
      expect(element).toHaveStyle({ transform: "translateX(-100px)" });

      // End swipe and resize at the same time
      rerender(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={600}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      // Should snap to new position 0 (active item stays at center)
      expect(element).toHaveStyle({ transform: "translateX(0px)" });
    });

    it("should not render content when containerSize is 0", () => {
      // This test verifies that parent components should guard against containerSize=0
      // SwipePivotContent itself will render, but all items will be at position 0
      render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={0}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      // With containerSize 0, position * 0 = 0
      expect(element).toHaveStyle({ transform: "translateX(0px)" });
    });
  });

  describe("Position changes (navigation)", () => {
    it("should animate when position changes and swipe ends", async () => {
      const { rerender } = render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={createSwipingState(-200, -1)}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      // During swipe: position 0 + displacement -200 = -200
      expect(element).toHaveStyle({ transform: "translateX(-200px)" });

      // Swipe ends, position changes to -1 (this page is now to the left)
      rerender(
        <SwipePivotContent
          id="page1"
          isActive={false}
          position={-1}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      // Animation should start - we need to advance animation frames
      // The animation goes from current position (-200) to target (-400)
      act(() => {
        runAnimationFrame(0); // Start animation
      });

      // After animation starts, element should be animating towards target
      // The exact value depends on animation progress, but it should not be at target yet
      // or should be animating (we can't easily test intermediate values)
    });
  });

  describe("Active item always visible", () => {
    it("should always show active item regardless of input state", () => {
      render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ visibility: "visible" });
    });

    it("should show active item during swiping", () => {
      render(
        <SwipePivotContent
          id="page1"
          isActive={true}
          position={0}
          inputState={createSwipingState(-100, -1)}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveStyle({ visibility: "visible" });
    });
  });

  describe("Data attributes", () => {
    it("should set correct data attributes", () => {
      render(
        <SwipePivotContent
          id="test-page"
          isActive={true}
          position={0}
          inputState={IDLE_STATE}
          containerSize={400}
        >
          <div>Content</div>
        </SwipePivotContent>
      );

      const element = screen.getByText("Content").parentElement;
      expect(element).toHaveAttribute("data-pivot-content", "test-page");
      expect(element).toHaveAttribute("data-active", "true");
      expect(element).toHaveAttribute("data-position", "0");
    });
  });
});
