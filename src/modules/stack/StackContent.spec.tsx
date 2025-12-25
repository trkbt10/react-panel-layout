/**
 * @file Tests for StackContent component - animation behavior.
 *
 * TDD: Tests to reproduce and prevent animation restart issues in production builds.
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { StackContent } from "./StackContent.js";
import { STACK_ANIMATION_PUSH, STACK_ANIMATION_POP } from "../../constants/styles.js";
import type { StackNavigationState } from "./types.js";

describe("StackContent", () => {
  const createNavigationState = (depth: number): StackNavigationState => ({
    stack: depth === 0 ? ["root"] : depth === 1 ? ["root", "detail"] : ["root", "detail", "edit"],
    depth,
    isRevealing: false,
    revealDepth: null,
  });

  describe("push animation (becoming active)", () => {
    it("applies push animation when becoming active", () => {
      const { rerender } = render(
        <StackContent
          id="panel"
          depth={1}
          isActive={false}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      // Panel becomes active (pushed onto stack)
      rerender(
        <StackContent
          id="panel"
          depth={1}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(1)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBe(STACK_ANIMATION_PUSH);
    });
  });

  describe("pop animation (becoming inactive)", () => {
    it("applies pop animation when becoming inactive", () => {
      const { rerender } = render(
        <StackContent
          id="panel"
          depth={1}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(1)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      // Panel becomes inactive (popped from stack)
      rerender(
        <StackContent
          id="panel"
          depth={1}
          isActive={false}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBe(STACK_ANIMATION_POP);
    });

    it("keeps panel visible during pop animation", () => {
      // Panel must remain visible during pop animation, otherwise animation won't be seen
      const { rerender } = render(
        <StackContent
          id="panel"
          depth={1}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(1)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      // Panel becomes inactive (pop)
      rerender(
        <StackContent
          id="panel"
          depth={1}
          isActive={false}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.visibility).toBe("visible");
    });
  });

  describe("no animation when transitionMode=none", () => {
    it("does not apply animation property", () => {
      render(
        <StackContent
          id="panel"
          depth={0}
          isActive={true}
          displayMode="overlay"
          transitionMode="none"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBeFalsy();
    });
  });

  describe("initial mount behavior (production animation issue)", () => {
    it("does NOT apply push animation on initial mount when isActive=true", () => {
      // No animation should be applied on initial mount
      render(
        <StackContent
          id="panel"
          depth={0}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBeFalsy();
    });

    it("does NOT re-trigger animation when parent re-renders without isActive change", () => {
      // Animation should not be re-triggered when isActive remains unchanged
      const { rerender } = render(
        <StackContent
          id="panel"
          depth={0}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBeFalsy();

      // Parent re-renders (e.g., containerWidth update), isActive unchanged
      rerender(
        <StackContent
          id="panel"
          depth={0}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Updated Content</div>
        </StackContent>,
      );

      expect(wrapper?.style?.animation).toBeFalsy();
    });

    it("does NOT apply animation for inactive panel on initial mount", () => {
      render(
        <StackContent
          id="panel"
          depth={1}
          isActive={false}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBeFalsy();
    });
  });

  describe("animation stability during re-renders", () => {
    it("should maintain animation value during re-renders when animating", () => {
      const { rerender } = render(
        <StackContent
          id="panel"
          depth={1}
          isActive={false}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(0)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      // pushでアクティブになる
      rerender(
        <StackContent
          id="panel"
          depth={1}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(1)}
        >
          <div data-testid="content">Content</div>
        </StackContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBe(STACK_ANIMATION_PUSH);

      // Animation value should be maintained after re-render
      rerender(
        <StackContent
          id="panel"
          depth={1}
          isActive={true}
          displayMode="overlay"
          transitionMode="css"
          navigationState={createNavigationState(1)}
        >
          <div data-testid="content">Updated</div>
        </StackContent>,
      );

      expect(wrapper?.style?.animation).toBe(STACK_ANIMATION_PUSH);
    });
  });
});
