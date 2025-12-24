/**
 * @file Unit tests for computeStackContentState pure function.
 *
 * Tests the state computation logic for StackContent separated from React/CSS concerns.
 */
import {
  computeAnimationType,
  computeVisibility,
  computeStackContentState,
  type StackContentStateInput,
} from "./computeStackContentState.js";

describe("computeAnimationType", () => {
  describe("when transitionMode is 'none'", () => {
    it("returns null regardless of active state change", () => {
      expect(computeAnimationType({ wasActive: false, isActive: true, transitionMode: "none" })).toBe(null);
      expect(computeAnimationType({ wasActive: true, isActive: false, transitionMode: "none" })).toBe(null);
    });
  });

  describe("when transitionMode is 'css'", () => {
    it("returns 'push' when becoming active", () => {
      const result = computeAnimationType({ wasActive: false, isActive: true, transitionMode: "css" });
      expect(result).toBe("push");
    });

    it("returns 'pop' when becoming inactive", () => {
      const result = computeAnimationType({ wasActive: true, isActive: false, transitionMode: "css" });
      expect(result).toBe("pop");
    });

    it("returns null when active state has not changed", () => {
      expect(computeAnimationType({ wasActive: true, isActive: true, transitionMode: "css" })).toBe(null);
      expect(computeAnimationType({ wasActive: false, isActive: false, transitionMode: "css" })).toBe(null);
    });
  });
});

describe("computeVisibility", () => {
  describe("overlay displayMode", () => {
    const baseInput = {
      displayMode: "overlay" as const,
      depth: 1,
      navigationDepth: 2,
      isActive: false,
      isAnimatingOut: false,
      isRevealing: false,
      revealDepth: null as number | null,
    };

    it("returns 'visible' when panel is active", () => {
      const result = computeVisibility({ ...baseInput, isActive: true });
      expect(result).toBe("visible");
    });

    it("returns 'visible' when panel is animating out (pop)", () => {
      const result = computeVisibility({ ...baseInput, isAnimatingOut: true });
      expect(result).toBe("visible");
    });

    it("returns 'visible' when revealing and depth matches revealDepth", () => {
      const result = computeVisibility({
        ...baseInput,
        isRevealing: true,
        revealDepth: 1,
        depth: 1,
      });
      expect(result).toBe("visible");
    });

    it("returns 'hidden' when not active, not animating, not revealing", () => {
      const result = computeVisibility(baseInput);
      expect(result).toBe("hidden");
    });

    it("returns 'hidden' when revealing but depth does not match revealDepth", () => {
      const result = computeVisibility({
        ...baseInput,
        isRevealing: true,
        revealDepth: 0,
        depth: 1,
      });
      expect(result).toBe("hidden");
    });
  });

  describe("slide/stack displayMode", () => {
    const baseInput = {
      displayMode: "slide" as const,
      depth: 1,
      navigationDepth: 2,
      isActive: false,
      isAnimatingOut: false,
      isRevealing: false,
      revealDepth: null as number | null,
    };

    it("returns 'visible' when depth <= navigationDepth", () => {
      expect(computeVisibility({ ...baseInput, depth: 0, navigationDepth: 2 })).toBe("visible");
      expect(computeVisibility({ ...baseInput, depth: 1, navigationDepth: 2 })).toBe("visible");
      expect(computeVisibility({ ...baseInput, depth: 2, navigationDepth: 2 })).toBe("visible");
    });

    it("returns 'hidden' when depth > navigationDepth", () => {
      const result = computeVisibility({ ...baseInput, depth: 3, navigationDepth: 2 });
      expect(result).toBe("hidden");
    });

    it("returns 'visible' when animating out even if depth > navigationDepth", () => {
      const result = computeVisibility({
        ...baseInput,
        depth: 3,
        navigationDepth: 2,
        isAnimatingOut: true,
      });
      expect(result).toBe("visible");
    });

    it("works the same for 'stack' displayMode", () => {
      const stackInput = { ...baseInput, displayMode: "stack" as const };
      expect(computeVisibility({ ...stackInput, depth: 1, navigationDepth: 2 })).toBe("visible");
      expect(computeVisibility({ ...stackInput, depth: 3, navigationDepth: 2 })).toBe("hidden");
    });
  });
});

describe("computeStackContentState", () => {
  const baseInput: StackContentStateInput = {
    depth: 1,
    isActive: true,
    wasActive: true,
    currentAnimationType: null,
    displayMode: "overlay",
    transitionMode: "css",
    navigationState: {
      depth: 1,
      isRevealing: false,
      revealDepth: null,
    },
    swipeProgress: undefined,
  };

  describe("nextAnimationType computation", () => {
    it("computes push animation when becoming active", () => {
      const result = computeStackContentState({
        ...baseInput,
        wasActive: false,
        isActive: true,
      });
      expect(result.nextAnimationType).toBe("push");
    });

    it("computes pop animation when becoming inactive", () => {
      const result = computeStackContentState({
        ...baseInput,
        wasActive: true,
        isActive: false,
      });
      expect(result.nextAnimationType).toBe("pop");
    });

    it("preserves current animation type when no state change", () => {
      const result = computeStackContentState({
        ...baseInput,
        currentAnimationType: "push",
      });
      expect(result.nextAnimationType).toBe("push");
    });
  });

  describe("visibility computation", () => {
    it("sets visibility based on display mode and state", () => {
      const result = computeStackContentState({
        ...baseInput,
        isActive: false,
        wasActive: false,
        displayMode: "overlay",
      });
      expect(result.visibility).toBe("hidden");
    });

    it("keeps panel visible during pop animation", () => {
      const result = computeStackContentState({
        ...baseInput,
        isActive: false,
        wasActive: true,
        displayMode: "overlay",
      });
      // wasActive=true, isActive=false means pop animation is starting
      expect(result.nextAnimationType).toBe("pop");
      expect(result.visibility).toBe("visible");
    });
  });

  describe("transform computation", () => {
    it("returns translateX(0) for active panel", () => {
      const result = computeStackContentState(baseInput);
      expect(result.transform).toBe("translateX(0)");
    });

    it("applies swipe progress transform when swiping", () => {
      const result = computeStackContentState({
        ...baseInput,
        swipeProgress: 0.5,
      });
      expect(result.transform).toBe("translateX(50%)");
    });

    it("does not apply swipe progress to non-active panels", () => {
      const result = computeStackContentState({
        ...baseInput,
        isActive: false,
        wasActive: false,
        depth: 0,
        navigationState: { depth: 1, isRevealing: false, revealDepth: null },
        displayMode: "slide",
        swipeProgress: 0.5,
      });
      // Previous panel in slide mode has fixed transform
      expect(result.transform).toBe("translateX(-30%)");
    });
  });

  describe("animation and transition", () => {
    it("returns animation for push when becoming active", () => {
      const result = computeStackContentState({
        ...baseInput,
        wasActive: false,
        isActive: true,
      });
      expect(result.animation).toBeDefined();
      expect(result.animation).toContain("var(--rpl-stack-animation-push");
    });

    it("returns animation for pop when becoming inactive", () => {
      const result = computeStackContentState({
        ...baseInput,
        wasActive: true,
        isActive: false,
      });
      expect(result.animation).toBeDefined();
      expect(result.animation).toContain("var(--rpl-stack-animation-pop");
    });

    it("returns undefined animation when no animation type", () => {
      const result = computeStackContentState(baseInput);
      expect(result.animation).toBeUndefined();
    });

    it("returns transition when transitionMode is css", () => {
      const result = computeStackContentState(baseInput);
      expect(result.transition).toBeDefined();
      expect(result.transition).toContain("transform");
    });

    it("returns undefined transition when transitionMode is none", () => {
      const result = computeStackContentState({
        ...baseInput,
        transitionMode: "none",
      });
      expect(result.transition).toBeUndefined();
    });
  });

  describe("static properties", () => {
    it("sets zIndex to depth", () => {
      const result = computeStackContentState({ ...baseInput, depth: 5 });
      expect(result.zIndex).toBe(5);
    });

    it("sets pointerEvents to 'auto' when active", () => {
      const result = computeStackContentState({ ...baseInput, isActive: true });
      expect(result.pointerEvents).toBe("auto");
    });

    it("sets pointerEvents to 'none' when not active", () => {
      const result = computeStackContentState({ ...baseInput, isActive: false, wasActive: false });
      expect(result.pointerEvents).toBe("none");
    });
  });
});
