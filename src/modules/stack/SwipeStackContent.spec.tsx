/**
 * @file Tests for SwipeStackContent component.
 *
 * These tests ensure:
 * 1. Swipe preview: active panel follows finger, behind panel reveals with parallax
 * 2. Swipe commit: when swipe completes, navigation changes and panels animate to final positions
 * 3. Swipe cancel: when swipe is released without threshold, panels snap back
 * 4. Button navigation: when navigationDepth changes without swipe, panels should animate
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

/**
 * Flush all pending RAF callbacks.
 * @param advanceMs - How much to advance the mock timestamp (default: 400ms to complete 300ms animation)
 */
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

describe("SwipeStackContent", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      const { getByText } = render(
        <SwipeStackContent
          id="test"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          <div>Test Content</div>
        </SwipeStackContent>,
      );

      expect(getByText("Test Content")).toBeInTheDocument();
    });

    it("applies correct data attributes", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel-1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.getAttribute("data-stack-content")).toBe("panel-1");
      expect(element.getAttribute("data-depth")).toBe("1");
      expect(element.getAttribute("data-active")).toBe("true");
      expect(element.getAttribute("data-role")).toBe("active");
    });

    it("applies correct role for behind panel", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel-0"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.getAttribute("data-role")).toBe("behind");
    });
  });

  describe("visibility", () => {
    it("active panel is always visible", () => {
      const { container } = render(
        <SwipeStackContent
          id="test"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.visibility).toBe("visible");
    });

    it("behind panel is hidden when idle", () => {
      const { container } = render(
        <SwipeStackContent
          id="test"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.visibility).toBe("hidden");
    });

    it("behind panel is visible when swiping", () => {
      const { container } = render(
        <SwipeStackContent
          id="test"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(100)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.visibility).toBe("visible");
    });
  });

  describe("transform during swipe", () => {
    it("active panel follows displacement", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="test"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Start swiping
      rerender(
        <SwipeStackContent
          id="test"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(150)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(150px)");
    });

    it("behind panel uses parallax effect", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="test"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Start swiping - at 50% progress (200px), behind should move from -120 to -60
      rerender(
        <SwipeStackContent
          id="test"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(200)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Behind panel should be at -60px (halfway from -120 to 0)
      expect(element.style.transform).toBe("translateX(-60px)");
    });
  });

  describe("z-index", () => {
    it("applies z-index based on depth", () => {
      const { container } = render(
        <SwipeStackContent
          id="test"
          depth={3}
          navigationDepth={3}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.zIndex).toBe("3");
    });
  });

  describe("pointer events", () => {
    it("active panel has auto pointer events", () => {
      const { container } = render(
        <SwipeStackContent
          id="test"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.pointerEvents).toBe("auto");
    });

    it("inactive panel has none pointer events", () => {
      const { container } = render(
        <SwipeStackContent
          id="test"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.pointerEvents).toBe("none");
    });
  });

  describe("swipe preview behavior", () => {
    it("active panel position changes immediately with displacement during swiping", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Initial position
      expect(element.style.transform).toBe("translateX(0px)");

      // Start tracking (before direction lock) - displacement is still applied
      // because we want responsive feedback even before direction is confirmed
      rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(50)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      // Tracking phase also applies displacement for responsive feedback
      expect(element.style.transform).toBe("translateX(50px)");

      // Swipe confirmed (direction locked)
      rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(100)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(100px)");

      // Continue swiping
      rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(250)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(250px)");
    });

    it("behind panel reveals progressively during swipe with parallax effect", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Initial: behind panel at -30% = -120px
      expect(element.style.transform).toBe("translateX(-120px)");
      expect(element.style.visibility).toBe("hidden");

      // Swipe 25% (100px of 400px)
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(100)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      // Behind moves 25% of 120px = 30px, so from -120 to -90
      expect(element.style.transform).toBe("translateX(-90px)");
      expect(element.style.visibility).toBe("visible");

      // Swipe 50% (200px)
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(200)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(-60px)");

      // Swipe 100% (400px) - behind should be at 0
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(400)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(0px)");
    });

    it("does not respond to negative displacement (swiping wrong direction)", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Swipe left (negative) should be clamped to 0
      rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(-100)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(0px)");
    });
  });

  describe("swipe release and snap-back", () => {
    it("returns to original position when swipe ends without navigation change", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Swipe in progress
      rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={createOperatingState(150)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(150px)");

      // Swipe released (back to idle) - animation starts
      rerender(
        <SwipeStackContent
          id="active"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Flush RAF within act() to complete the snap-back animation
      act(() => {
        flushRAF(0); // First flush starts the animation (sets startTime)
        flushRAF(400); // Second flush completes the animation (elapsed > duration)
      });

      // After animation completes, should be at 0
      expect(element.style.transform).toBe("translateX(0px)");
    });

    it("behind panel returns to hidden position when swipe is canceled", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Swipe in progress
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(200)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );
      expect(element.style.transform).toBe("translateX(-60px)");
      expect(element.style.visibility).toBe("visible");

      // Swipe canceled - animation starts
      rerender(
        <SwipeStackContent
          id="behind"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Flush RAF within act() to complete the snap-back animation
      act(() => {
        flushRAF(0); // First flush starts the animation (sets startTime)
        flushRAF(400); // Second flush completes the animation (elapsed > duration)
      });

      // After animation completes, should be at -120px
      expect(element.style.transform).toBe("translateX(-120px)");
    });
  });

  describe("button navigation (without swipe)", () => {
    it("animates behind panel to center when going back via button", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Initial: behind panel at -30% = -120px
      expect(element.style.transform).toBe("translateX(-120px)");

      // Button click triggers navigation change: depth 0 becomes active
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start: still at -120px immediately
      // (not snapping directly to 0)
      expect(element.style.transform).toBe("translateX(-120px)");

      // Flush RAF to complete animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation completes, should be at 0
      expect(element.style.transform).toBe("translateX(0px)");
    });

    it("animates active panel off-screen when going back via button", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Initial: active panel at 0
      expect(element.style.transform).toBe("translateX(0px)");

      // Button click triggers navigation change: depth 1 becomes hidden
      rerender(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start: still at 0px immediately
      // (not snapping directly to 400)
      expect(element.style.transform).toBe("translateX(0px)");

      // Flush RAF to complete animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation completes, should be at 400px (off-screen)
      expect(element.style.transform).toBe("translateX(400px)");
    });
  });

  describe("forward navigation (push)", () => {
    it("new panel animates in from off-screen when first mounted as active with animateOnMount", () => {
      // Scenario: Panel is mounted for the first time as active (push navigation)
      // This is what happens when visiblePanelIds changes to include the new panel
      const { container } = render(
        <SwipeStackContent
          id="newPanel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
          animateOnMount={true}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // On first mount as active with animateOnMount, panel should start at off-screen position
      // (not at 0, which would cause a jarring pop-in)
      expect(element.style.transform).toBe("translateX(400px)");

      // Flush RAF to complete the entrance animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: at center (0)
      expect(element.style.transform).toBe("translateX(0px)");
    });

    it("pre-existing hidden panel animates in when pushed", () => {
      // Scenario: Panel already exists but was hidden, then becomes active
      const { container, rerender } = render(
        <SwipeStackContent
          id="newPanel"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Hidden panel should be at containerSize (off-screen right)
      expect(element.style.transform).toBe("translateX(400px)");

      // Push navigation: panel becomes active
      rerender(
        <SwipeStackContent
          id="newPanel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start: still at 400px immediately (not snapping to 0)
      expect(element.style.transform).toBe("translateX(400px)");

      // Flush RAF to complete animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: at center (0)
      expect(element.style.transform).toBe("translateX(0px)");
    });

    it("behind panel animates to offset position when new panel is pushed", () => {
      // First render: panel at depth 0 is active
      const { container, rerender } = render(
        <SwipeStackContent
          id="currentPanel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Active panel at center
      expect(element.style.transform).toBe("translateX(0px)");

      // Push navigation: this panel becomes "behind"
      rerender(
        <SwipeStackContent
          id="currentPanel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start: still at 0px immediately (not snapping to -120px)
      expect(element.style.transform).toBe("translateX(0px)");

      // Flush RAF to complete animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: at behind offset (-30% = -120px)
      expect(element.style.transform).toBe("translateX(-120px)");
    });
  });

  describe("mount → push → back sequence", () => {
    it("panel animates from correct position after push then back", () => {
      // This test covers the bug where:
      // 1. Mount: root panel at depth 0, active
      // 2. Push: new panel at depth 1 is mounted with animateOnMount
      // 3. Back: the panel at depth 1 should animate from its current position (0) to off-screen

      // Step 1: Mount panel at depth 1 as active (simulating push navigation)
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
          animateOnMount={true}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Initially at off-screen (400px) due to animateOnMount
      expect(element.style.transform).toBe("translateX(400px)");

      // Complete the push animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After push animation: should be at center (0)
      expect(element.style.transform).toBe("translateX(0px)");

      // Step 2: Go back - navigation depth changes, panel becomes hidden
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
          animateOnMount={true}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start from current position (0px), not from initialPx (400px)
      // The bug is that it might jump to 400px immediately because of animateOnMount logic
      expect(element.style.transform).toBe("translateX(0px)");

      // Complete the back animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After back animation: should be off-screen (400px)
      expect(element.style.transform).toBe("translateX(400px)");
    });

    it("behind panel animates correctly in mount → push → back sequence", () => {
      // Track the behind panel (depth 0) through the sequence

      // Step 1: Mount as active
      const { container, rerender } = render(
        <SwipeStackContent
          id="rootPanel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(0px)");

      // Step 2: Push - this panel becomes "behind"
      rerender(
        <SwipeStackContent
          id="rootPanel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation starts from 0px
      expect(element.style.transform).toBe("translateX(0px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: at behind offset (-120px)
      expect(element.style.transform).toBe("translateX(-120px)");

      // Step 3: Back - this panel becomes active again
      rerender(
        <SwipeStackContent
          id="rootPanel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Animation should start from current position (-120px)
      expect(element.style.transform).toBe("translateX(-120px)");

      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: at center (0)
      expect(element.style.transform).toBe("translateX(0px)");
    });
  });

  describe("shadow effects", () => {
    it("shows shadow on active panel at depth > 0 by default", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.boxShadow).toBe("-5px 0 15px rgba(0, 0, 0, 0.1)");
    });

    it("does not show shadow on root panel (depth 0)", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.boxShadow).toBe("");
    });

    it("does not show shadow on behind panel", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.boxShadow).toBe("");
    });

    it("can disable shadow with showShadow=false", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
          showShadow={false}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.boxShadow).toBe("");
    });
  });

  describe("scale effects (stack displayMode)", () => {
    it("behind panel has scale < 1 in stack mode", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Transform should include scale(0.95) for 1 level behind
      expect(element.style.transform).toContain("scale(0.95)");
    });

    it("active panel has no scale in stack mode", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
          displayMode="stack"
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // Active panel should not have scale transform (or scale(1))
      expect(element.style.transform).not.toContain("scale(0.");
    });

    it("no scale effect in overlay mode", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
          displayMode="overlay"
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      // No scale in overlay mode
      expect(element.style.transform).not.toContain("scale");
    });
  });

  describe("dimming overlay", () => {
    it("shows dimming overlay on behind panel by default", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const overlay = container.querySelector("[data-dimming-overlay]");
      expect(overlay).toBeInTheDocument();
    });

    it("no dimming overlay on active panel", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const overlay = container.querySelector("[data-dimming-overlay]");
      expect(overlay).not.toBeInTheDocument();
    });

    it("dimming fades during swipe", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // At rest, should have dimming
      const initialOverlay = container.querySelector("[data-dimming-overlay]") as HTMLElement;
      expect(initialOverlay).toBeInTheDocument();

      // During swipe at 100% progress, dimming should be gone
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={createOperatingState(400)}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const overlayAfter = container.querySelector("[data-dimming-overlay]") as HTMLElement;
      // At 100% swipe, opacity should be 0 (no overlay)
      expect(overlayAfter).not.toBeInTheDocument();
    });

    it("can disable dimming with showDimming=false", () => {
      const { container } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
          showDimming={false}
        >
          Content
        </SwipeStackContent>,
      );

      const overlay = container.querySelector("[data-dimming-overlay]");
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe("navigation during animation", () => {
    it("handles push during back animation", () => {
      // Scenario: Panel is animating back (going from active to hidden)
      // User quickly clicks to push forward again
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(0px)");

      // Step 1: Go back - panel becomes hidden, starts animating to off-screen
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Start animation but don't complete it
      act(() => {
        flushRAF(0);
        flushRAF(100); // Partial animation
      });

      // Panel should be somewhere between 0 and 400
      const midAnimationTransform = element.style.transform;
      expect(midAnimationTransform).not.toBe("translateX(0px)");
      expect(midAnimationTransform).not.toBe("translateX(400px)");

      // Step 2: Push again - panel becomes active again DURING animation
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Complete all pending animations
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // Panel should end up at center (0), visible
      expect(element.style.transform).toBe("translateX(0px)");
      expect(element.style.visibility).toBe("visible");
    });

    it("handles back during push animation", () => {
      // Scenario: New panel is animating in from off-screen
      // User quickly clicks back before animation completes
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
          animateOnMount={true}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Panel starts off-screen
      expect(element.style.transform).toBe("translateX(400px)");

      // Start animation but don't complete it
      act(() => {
        flushRAF(0);
        flushRAF(100); // Partial animation
      });

      // Panel should be somewhere between 400 and 0
      const midAnimationTransform = element.style.transform;
      expect(midAnimationTransform).not.toBe("translateX(400px)");
      expect(midAnimationTransform).not.toBe("translateX(0px)");

      // Go back during animation
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
          animateOnMount={true}
        >
          Content
        </SwipeStackContent>,
      );

      // Complete all pending animations
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // Panel should end up off-screen (400), hidden
      expect(element.style.transform).toBe("translateX(400px)");
    });

    it("handles rapid back-push-back sequence during animations", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(0px)");

      // Back
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      act(() => {
        flushRAF(0);
        flushRAF(50);
      });

      // Push (before back animation completes)
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      act(() => {
        flushRAF(0);
        flushRAF(50);
      });

      // Back again (before push animation completes)
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Complete all animations
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // Final state: should be off-screen (hidden)
      expect(element.style.transform).toBe("translateX(400px)");
    });

    it("panel remains visible and usable after rapid navigation", () => {
      // This is the bug scenario: after rapid back-and-forth, panel becomes permanently hidden
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;

      // Rapid sequence without waiting for animations
      for (let i = 0; i < 5; i++) {
        // Go back
        rerender(
          <SwipeStackContent
            id="panel1"
            depth={1}
            navigationDepth={0}
            isActive={false}
            operationState={IDLE_STATE}
            containerSize={400}
          >
            Content
          </SwipeStackContent>,
        );

        act(() => {
          flushRAF(0);
          flushRAF(30);
        });

        // Push forward
        rerender(
          <SwipeStackContent
            id="panel1"
            depth={1}
            navigationDepth={1}
            isActive={true}
            operationState={IDLE_STATE}
            containerSize={400}
          >
            Content
          </SwipeStackContent>,
        );

        act(() => {
          flushRAF(0);
          flushRAF(30);
        });
      }

      // Final state: panel should be active
      rerender(
        <SwipeStackContent
          id="panel1"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Complete all animations
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // Panel should be visible at center
      expect(element.style.transform).toBe("translateX(0px)");
      expect(element.style.visibility).toBe("visible");
    });
  });

  describe("swipe commit (navigation changes)", () => {
    it("active panel moves off-screen when navigation depth decreases", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={1}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(0px)");

      // Navigation changed: depth 1 is no longer active (went back to depth 0)
      // Panel should animate to off-screen position (containerSize = 400)
      rerender(
        <SwipeStackContent
          id="panel"
          depth={1}
          navigationDepth={0}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Role changes to "hidden"
      expect(element.getAttribute("data-role")).toBe("hidden");

      // Flush RAF to complete animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: off-screen at containerSize
      expect(element.style.transform).toBe("translateX(400px)");
    });

    it("behind panel becomes active and moves to center when navigation commits", () => {
      const { container, rerender } = render(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={1}
          isActive={false}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toBe("translateX(-120px)");
      expect(element.getAttribute("data-role")).toBe("behind");

      // Navigation commits: panel at depth 0 becomes active
      rerender(
        <SwipeStackContent
          id="panel"
          depth={0}
          navigationDepth={0}
          isActive={true}
          operationState={IDLE_STATE}
          containerSize={400}
        >
          Content
        </SwipeStackContent>,
      );

      // Role changes to "active"
      expect(element.getAttribute("data-role")).toBe("active");

      // Flush RAF to complete animation
      act(() => {
        flushRAF(0);
        flushRAF(400);
      });

      // After animation: at center (0)
      expect(element.style.transform).toBe("translateX(0px)");
    });
  });
});
