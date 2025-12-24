/**
 * @file Tests for StackContent component - animation behavior.
 *
 * TDD: Stackの戻るアニメーションが効かない問題を再現するテスト
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
      // 問題: 戻る際にpopアニメーションが設定されない、または見えない
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
      // アニメーションが設定されていること
      expect(wrapper?.style?.animation).toBe(STACK_ANIMATION_POP);
    });

    it("keeps panel visible during pop animation", () => {
      // 重要: popアニメーション中はパネルが見える必要がある
      // そうでないとアニメーションが見えない
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
      // popアニメーション中はvisibilityがvisibleであること
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
});
