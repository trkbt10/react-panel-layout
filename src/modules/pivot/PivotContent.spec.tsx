/**
 * @file Tests for PivotContent component - animation behavior.
 *
 * TDD: Pivotのアニメーションが動作しない問題を再現するテスト
 *
 * 要件:
 * 1. アクティブなパネルのみ表示、非アクティブは display: none
 * 2. leaveアニメーション中は display: block を維持（アニメーション完了後に none）
 * 3. 非アクティブパネルはポインターイベントを受け付けない
 */
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { PivotContent } from "./PivotContent.js";
import { PIVOT_ANIMATION_ENTER, PIVOT_ANIMATION_LEAVE } from "../../constants/styles.js";

describe("PivotContent", () => {
  describe("display control", () => {
    it("shows active content (display: block)", () => {
      render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.display).toBe("block");
    });

    it("hides inactive content when initially inactive (display: none)", () => {
      render(
        <PivotContent id="test" isActive={false} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.display).toBe("none");
    });

    it("keeps content displayed during leave animation", () => {
      const { rerender } = render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.display).toBe("block");

      // 非アクティブに変更（leaveアニメーション開始）
      rerender(
        <PivotContent id="test" isActive={false} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      // leaveアニメーション中は display: block を維持
      expect(wrapper?.style?.display).toBe("block");
    });

    it("hides content after leave animation ends", () => {
      const { rerender } = render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement!;

      // 非アクティブに変更
      rerender(
        <PivotContent id="test" isActive={false} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      // アニメーション完了をシミュレート
      fireEvent.animationEnd(wrapper);

      // アニメーション完了後は display: none
      expect(wrapper.style.display).toBe("none");
    });
  });

  describe("animation when transitionMode=css", () => {
    it("applies enter animation when active", () => {
      render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBe(PIVOT_ANIMATION_ENTER);
    });

    it("applies leave animation when becoming inactive", () => {
      const { rerender } = render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      rerender(
        <PivotContent id="test" isActive={false} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBe(PIVOT_ANIMATION_LEAVE);
    });
  });

  describe("no animation when transitionMode=none", () => {
    it("does not apply animation property", () => {
      render(
        <PivotContent id="test" isActive={true} transitionMode="none">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.animation).toBeFalsy();
    });

    it("hides inactive content immediately (no animation)", () => {
      render(
        <PivotContent id="test" isActive={false} transitionMode="none">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.display).toBe("none");
    });
  });

  describe("pointer events", () => {
    it("enables pointer events for active content", () => {
      render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.pointerEvents).toBe("auto");
    });

    it("disables pointer events for inactive content", () => {
      render(
        <PivotContent id="test" isActive={false} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.pointerEvents).toBe("none");
    });

    it("disables pointer events during leave animation", () => {
      const { rerender } = render(
        <PivotContent id="test" isActive={true} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      rerender(
        <PivotContent id="test" isActive={false} transitionMode="css">
          <div data-testid="content">Content</div>
        </PivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper?.style?.pointerEvents).toBe("none");
    });
  });
});
