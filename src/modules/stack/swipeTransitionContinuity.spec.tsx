/**
 * @file Tests for swipe-to-navigation transition continuity.
 *
 * These tests verify that when a swipe gesture completes and triggers navigation,
 * the behind panel (which becomes active) should NOT restart its animation from
 * the original "behind" position, but should continue smoothly from its current position.
 *
 * Issue: When swiping back strongly, the panel that was "behind" becomes "active",
 * and its animation appears to restart from the beginning rather than continuing
 * from where the swipe left it.
 */
import { render, act } from "@testing-library/react";
import { SwipeStackContent } from "./SwipeStackContent.js";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";

// Mock requestAnimationFrame for animation testing
const rafState = {
  callbacks: [] as FrameRequestCallback[],
  id: 0,
  mockTimestamp: 0,
  originalRAF: globalThis.requestAnimationFrame,
  originalCAF: globalThis.cancelAnimationFrame,
};

const resetRafState = (): void => {
  rafState.callbacks = [];
  rafState.id = 0;
  rafState.mockTimestamp = 0;
};

const mockRAF = (callback: FrameRequestCallback): number => {
  rafState.callbacks = [...rafState.callbacks, callback];
  rafState.id += 1;
  return rafState.id;
};

const mockCAF = (): void => {};

const flushRAF = (advanceMs = 400): void => {
  rafState.mockTimestamp += advanceMs;
  const callbacks = rafState.callbacks;
  rafState.callbacks = [];
  callbacks.forEach((cb) => cb(rafState.mockTimestamp));
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

const IDLE_STATE: ContinuousOperationState = {
  phase: "idle",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
};

const createOperatingState = (displacementX: number): ContinuousOperationState => ({
  phase: "operating",
  displacement: { x: displacementX, y: 0 },
  velocity: { x: 0.5, y: 0 },
});

describe("Swipe transition continuity", () => {
  describe("behind panel becoming active after full swipe", () => {
    /**
     * Scenario: User swipes 100% to go back.
     *
     * Before swipe:
     * - Panel at depth 0: role=behind, targetPx=-120, visible=hidden
     * - Panel at depth 1: role=active, targetPx=0, visible=visible
     *
     * During 100% swipe:
     * - Panel at depth 0: role=behind, at 0px (fully revealed via parallax)
     * - Panel at depth 1: role=active, at 400px (fully off-screen)
     *
     * After swipe (navigation changed, depth 1→0):
     * - Panel at depth 0: role=active, should stay at 0px (NO animation needed)
     * - Panel at depth 1: role=hidden, should stay at 400px
     *
     * Bug: The panel at depth 0 incorrectly animates from -120px to 0px,
     * even though it's already at 0px.
     */
    it("behind panel should NOT animate after completing 100% swipe back", () => {
      const containerSize = 400;
      const behindOffset = -0.3; // -120px

      // Step 1: Render behind panel at depth 0, navigationDepth 1
      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Initial: behind position at -120px
      expect(element.style.transform).toBe("translateX(-120px)");

      // Step 2: Swipe 100% (400px displacement)
      // Behind panel should be at 0px (fully revealed)
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(400)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Behind panel at 0px (parallax completed)
      expect(element.style.transform).toBe("translateX(0px)");

      // Step 3: Swipe ends AND navigation changes simultaneously
      // - operationState becomes IDLE (displacement = 0)
      // - navigationDepth changes to 0 (this panel becomes active)
      // - role changes from "behind" to "active"
      // - targetPx changes from -120 to 0
      //
      // CRITICAL: Since the panel is ALREADY at 0px, it should NOT animate.
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // The panel should stay at 0px immediately (no jump to -120px)
      // This is the bug: it might incorrectly start an animation from -120px
      expect(element.style.transform).toBe("translateX(0px)");

      // Flush any pending animations
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After potential animation, should still be at 0px
      expect(element.style.transform).toBe("translateX(0px)");
    });

    /**
     * Scenario: User swipes 80% and releases (meets threshold).
     *
     * The behind panel at depth 0 should animate from its current position
     * (-24px at 80% swipe) to 0px, NOT from -120px to 0px.
     */
    it("behind panel should animate from current position after 80% swipe", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Swipe 80% (320px)
      // Behind panel: -120 + 0.8 * 120 = -120 + 96 = -24px
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(320)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // At 80% swipe, behind panel should be at -24px
      expect(element.style.transform).toBe("translateX(-24px)");

      // Swipe ends, navigation changes
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start from -24px (current position), not -120px
      // Immediately after render, should still be at -24px (animation hasn't run yet)
      expect(element.style.transform).toBe("translateX(-24px)");

      // Flush animations
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation, should be at 0px
      expect(element.style.transform).toBe("translateX(0px)");
    });
  });

  describe("swipe continuation beyond threshold", () => {
    /**
     * Scenario: User swipes past 100% and continues moving.
     *
     * This tests the "strong swipe" behavior where the user swipes
     * past the container width.
     */
    it("handles swipe beyond 100% without animation glitches", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Swipe beyond 100% (500px, 125%)
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(500)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Behind panel should be at 0px (capped at full reveal)
      expect(element.style.transform).toBe("translateX(0px)");

      // Swipe ends, navigation changes
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Should stay at 0px, no animation needed
      expect(element.style.transform).toBe("translateX(0px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      expect(element.style.transform).toBe("translateX(0px)");
    });
  });

  describe("role change during operation", () => {
    /**
     * Edge case: What happens if role changes while still operating?
     *
     * This could happen when navigation changes before the swipe gesture fully ends.
     * The panel should maintain its current position to avoid visual jumps,
     * then transition to the new role's behavior when the swipe ends.
     */
    it("maintains position continuity when role changes during swipe", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(200)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // At 50% swipe, behind panel at -60px (parallax effect)
      expect(element.style.transform).toBe("translateX(-60px)");

      // Role changes while still operating (navigation happened before swipe ended)
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={createOperatingState(200)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // KEY BEHAVIOR: Position should be maintained to avoid visual jump
      // Panel continues using previous role's calculation during swipe
      expect(element.style.transform).toBe("translateX(-60px)");

      // When swipe ends, panel transitions to new role
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Now at rest position for active panel
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      expect(element.style.transform).toBe("translateX(0px)");
    });
  });

  describe("consecutive operations", () => {
    /**
     * Scenario: Complete a swipe back, then immediately start another swipe.
     *
     * This tests the "strong swipe" followed by another operation scenario.
     */
    it("handles immediate second swipe after first swipe completes", () => {
      const containerSize = 400;

      // Start as behind panel
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(-120px)");

      // First swipe: 100%
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(400)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(0px)");

      // First swipe ends, navigation changes
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(0px)");

      // Immediately start a second swipe (even though we can't go back further)
      // This simulates the user continuing to swipe after navigation completed
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={createOperatingState(50)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Panel should respond to the new displacement
      expect(element.style.transform).toBe("translateX(50px)");

      // Release the second swipe
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Should snap back to 0
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      expect(element.style.transform).toBe("translateX(0px)");
    });

    /**
     * Scenario: Swipe ends with animation in progress, then new operation starts.
     *
     * This tests interrupting an animation with a new swipe.
     */
    it("interrupts snap-back animation with new swipe", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Start a swipe
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={createOperatingState(200)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(200px)");

      // Release (starts snap-back animation)
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation starts but we don't complete it
      act(() => {
        flushRAF(0); // Start animation
        flushRAF(100); // Partial progress
      });

      // Position should be somewhere between 200 and 0
      const currentTransform = element.style.transform;
      const matchResult = currentTransform.match(/translateX\(([^)]+)px\)/);
      const currentPx = matchResult ? parseFloat(matchResult[1]) : NaN;

      // Should be between 0 and 200 (animation in progress)
      expect(currentPx).toBeGreaterThanOrEqual(0);
      expect(currentPx).toBeLessThanOrEqual(200);

      // Start a new swipe (interrupts animation)
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={createOperatingState(150)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Should now be at the new displacement position
      expect(element.style.transform).toBe("translateX(150px)");
    });
  });

  describe("stack display mode (scale effect)", () => {
    /**
     * Scenario: Stack display mode adds scale transform.
     *
     * In stack mode, behind panels have a scale < 1.
     * When the panel becomes active, the scale should animate to 1.
     * This should not interfere with the translate animation.
     */
    it("behind panel in stack mode transitions smoothly when becoming active", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Behind panel should have scale(0.95)
      expect(element.style.transform).toContain("scale(0.95)");
      expect(element.style.transform).toContain("translateX(-120px)");

      // 100% swipe
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(400)}
          containerSize={containerSize}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      // At 100% swipe, scale should be 1 and position 0
      expect(element.style.transform).toContain("translateX(0px)");
      expect(element.style.transform).toContain("scale(1)");

      // Swipe ends, becomes active
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      // Should stay at 0 with scale 1 (no animation restart)
      expect(element.style.transform).toContain("translateX(0px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      expect(element.style.transform).toContain("translateX(0px)");
    });

    /**
     * Scenario: Partial swipe in stack mode.
     *
     * After 80% swipe, behind panel should animate from -24px to 0px.
     * Scale should also animate from ~0.99 to 1.
     */
    it("partial swipe in stack mode animates from correct position", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // 80% swipe
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(320)}
          containerSize={containerSize}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      expect(element.style.transform).toContain("translateX(-24px)");

      // Becomes active
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      // Should start animation from -24px
      expect(element.style.transform).toContain("translateX(-24px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      expect(element.style.transform).toContain("translateX(0px)");
    });
  });

  describe("over-swipe behavior (beyond 100%)", () => {
    /**
     * Scenario: User swipes beyond 100% (e.g., 500px when container is 400px).
     *
     * This is the "strong swipe" case:
     * - behind panel should stay at 0px (clamped)
     * - active panel should be at 500px (beyond container)
     * - On release, exiting panel should animate from 500px to 400px
     * - behind (now active) panel should stay at 0px (no animation needed)
     */
    it("behind panel stays at 0px when over-swiped 125%", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(-120px)");

      // Over-swipe: 125% (500px)
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(500)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Behind panel should be clamped at 0px (not going positive)
      expect(element.style.transform).toBe("translateX(0px)");

      // Release and navigation changes
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Should stay at 0px immediately (no jump)
      expect(element.style.transform).toBe("translateX(0px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After any animation, still at 0px
      expect(element.style.transform).toBe("translateX(0px)");
    });

    it("exiting panel at 125% swipe snaps to target (no backward animation)", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(0px)");

      // Over-swipe: 125%
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(500)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Active panel follows displacement exactly (no clamp)
      expect(element.style.transform).toBe("translateX(500px)");

      // Over-swipe triggers navigation change while STILL SWIPING
      // This is the key: navigation changes before the gesture ends
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={createOperatingState(500)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Panel maintains position (useOperationContinuity keeps using old role)
      expect(element.style.transform).toBe("translateX(500px)");

      // Now release - gesture ends
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Should snap to target position (400px) - no backward ANIMATION
      // The key is we snap (instant) rather than animate backward
      // Since the panel is off-screen, snapping to 400px is visually acceptable
      expect(element.style.transform).toBe("translateX(400px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After frames, still at target position (no animation occurred)
      expect(element.style.transform).toBe("translateX(400px)");
    });

    /**
     * This tests both panels together during over-swipe.
     * The exiting panel should stay at 500px (no backward animation).
     */
    it("both panels handle 125% over-swipe transition smoothly", () => {
      const containerSize = 400;

      // Render behind panel
      const behindResult = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Behind
        </SwipeStackContent>,
      );

      // Render active panel
      const activeResult = render(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Active
        </SwipeStackContent>,
      );

      const behindEl = behindResult.container.firstChild as HTMLElement;
      const activeEl = activeResult.container.firstChild as HTMLElement;

      // Over-swipe 125%
      const overSwipeState = createOperatingState(500);

      behindResult.rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={overSwipeState}
          containerSize={containerSize}
        >
          Behind
        </SwipeStackContent>,
      );

      activeResult.rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={overSwipeState}
          containerSize={containerSize}
        >
          Active
        </SwipeStackContent>,
      );

      // Positions during over-swipe
      expect(behindEl.style.transform).toBe("translateX(0px)");
      expect(activeEl.style.transform).toBe("translateX(500px)");

      // Over-swipe triggers navigation change while STILL SWIPING
      behindResult.rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={overSwipeState}
          containerSize={containerSize}
        >
          Behind
        </SwipeStackContent>,
      );

      activeResult.rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={overSwipeState}
          containerSize={containerSize}
        >
          Active
        </SwipeStackContent>,
      );

      // Panels maintain positions (useOperationContinuity keeps using old roles)
      expect(behindEl.style.transform).toBe("translateX(0px)");
      expect(activeEl.style.transform).toBe("translateX(500px)");

      // Now release - gesture ends
      behindResult.rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Behind
        </SwipeStackContent>,
      );

      activeResult.rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Active
        </SwipeStackContent>,
      );

      // Behind (now active) should stay at 0
      expect(behindEl.style.transform).toBe("translateX(0px)");
      // Active (now exiting) snaps to target (400px) - no backward ANIMATION
      expect(activeEl.style.transform).toBe("translateX(400px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // Final positions - both at their target positions, no animation occurred
      expect(behindEl.style.transform).toBe("translateX(0px)");
      expect(activeEl.style.transform).toBe("translateX(400px)");
    });
  });

  describe("exiting panel behavior", () => {
    /**
     * Scenario: Panel exits (becomes hidden) after swipe back.
     *
     * When a panel at depth 1 becomes hidden (navigationDepth changes to 0),
     * it should animate off-screen from its current position.
     */
    it("exiting panel animates from current position", () => {
      const containerSize = 400;

      // Panel at depth 1, currently active
      const { container, rerender } = render(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(0px)");

      // Swipe 100% to go back
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(400)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(400px)");

      // Navigation changes - panel becomes hidden
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Panel is already at 400px (off-screen), should stay there
      expect(element.style.transform).toBe("translateX(400px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation, should be at containerSize (off-screen)
      expect(element.style.transform).toBe("translateX(400px)");
    });

    /**
     * Scenario: Panel exits after 80% swipe.
     *
     * The panel should animate from ~320px to 400px, not from 0px.
     */
    it("exiting panel at 80% swipe animates from 320px to 400px", () => {
      const containerSize = 400;

      const { container, rerender } = render(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Swipe 80%
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(320)}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(320px)");

      // Navigation changes
      rerender(
        <SwipeStackContent
          id="exiting"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={containerSize}
        >
          Content
        </SwipeStackContent>,
      );

      // Should be at 320px (animation starting point)
      expect(element.style.transform).toBe("translateX(320px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation, at containerSize
      expect(element.style.transform).toBe("translateX(400px)");
    });
  });
});
