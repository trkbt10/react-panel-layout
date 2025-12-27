/**
 * @file Tests for SwipePivotContent component.
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SwipePivotContent } from "./SwipePivotContent.js";
import type { SwipeInputState } from "../../hooks/gesture/types.js";

/**
 * Mock Animation that implements the full Animation interface.
 * Used to polyfill Web Animations API for JSDOM testing.
 */
class MockAnimation implements Animation {
  currentTime: number | null = 0;
  effect: AnimationEffect | null = null;
  id = "";
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => unknown) | null = null;
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => unknown) | null = null;
  onremove: ((this: Animation, ev: Event) => unknown) | null = null;
  pending = false;
  playState: AnimationPlayState = "running";
  playbackRate = 1;
  replaceState: AnimationReplaceState = "active";
  startTime: number | null = 0;
  timeline: AnimationTimeline | null = null;

  finished: Promise<Animation>;
  ready: Promise<Animation>;
  private resolveFinished!: (value: Animation) => void;

  constructor() {
    this.finished = new Promise((resolve) => {
      this.resolveFinished = resolve;
    });
    this.ready = Promise.resolve(this);
  }

  cancel(): void {
    this.playState = "idle";
  }

  finish(): void {
    this.playState = "finished";
    this.resolveFinished(this);
  }

  commitStyles(): void {}
  pause(): void {}
  persist(): void {}
  play(): void {}
  reverse(): void {}
  updatePlaybackRate(): void {}

  // EventTarget methods
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
}

describe("SwipePivotContent", () => {
  let originalAnimate: typeof Element.prototype.animate | undefined;

  beforeAll(() => {
    originalAnimate = Element.prototype.animate;
    Element.prototype.animate = function (): Animation {
      return new MockAnimation();
    };
  });

  afterAll(() => {
    if (originalAnimate) {
      Element.prototype.animate = originalAnimate;
    }
  });
  const idleState: SwipeInputState = {
    phase: "idle",
    displacement: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    direction: 0,
  };

  const swipingRightState: SwipeInputState = {
    phase: "swiping",
    displacement: { x: 50, y: 0 },
    velocity: { x: 0.5, y: 0 },
    direction: 1,
  };

  const swipingLeftState: SwipeInputState = {
    phase: "swiping",
    displacement: { x: -50, y: 0 },
    velocity: { x: -0.5, y: 0 },
    direction: -1,
  };

  describe("visibility", () => {
    it("shows active content during idle state", () => {
      render(
        <SwipePivotContent
          id="test"
          isActive={true}
          position={0}
          inputState={idleState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "visible" });
    });

    it("hides inactive content during idle state", () => {
      render(
        <SwipePivotContent
          id="test"
          isActive={false}
          position={-1}
          inputState={idleState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "hidden" });
    });

    it("shows previous content when swiping right", () => {
      render(
        <SwipePivotContent
          id="prev"
          isActive={false}
          position={-1}
          inputState={swipingRightState}
          containerSize={300}
        >
          <div data-testid="content">Previous</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "visible" });
    });

    it("shows next content when swiping left", () => {
      render(
        <SwipePivotContent
          id="next"
          isActive={false}
          position={1}
          inputState={swipingLeftState}
          containerSize={300}
        >
          <div data-testid="content">Next</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "visible" });
    });

    it("hides previous content when swiping left", () => {
      render(
        <SwipePivotContent
          id="prev"
          isActive={false}
          position={-1}
          inputState={swipingLeftState}
          containerSize={300}
        >
          <div data-testid="content">Previous</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "hidden" });
    });
  });

  describe("translation", () => {
    it("applies base translation based on position", () => {
      render(
        <SwipePivotContent
          id="test"
          isActive={false}
          position={1}
          inputState={idleState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ transform: "translateX(300px)" });
    });

    it("applies swipe displacement to translation", () => {
      render(
        <SwipePivotContent
          id="test"
          isActive={true}
          position={0}
          inputState={swipingRightState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      // Position 0 + 50px displacement = 50px
      expect(wrapper).toHaveStyle({ transform: "translateX(50px)" });
    });

    it("calculates correct translation for adjacent items during swipe", () => {
      render(
        <SwipePivotContent
          id="prev"
          isActive={false}
          position={-1}
          inputState={swipingRightState}
          containerSize={300}
        >
          <div data-testid="content">Previous</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      // Position -1 (-300px) + 50px displacement = -250px
      expect(wrapper).toHaveStyle({ transform: "translateX(-250px)" });
    });
  });

  describe("vertical axis", () => {
    it("applies vertical translation for vertical axis", () => {
      const verticalSwipe: SwipeInputState = {
        phase: "swiping",
        displacement: { x: 0, y: 50 },
        velocity: { x: 0, y: 0.5 },
        direction: 1,
      };

      render(
        <SwipePivotContent
          id="test"
          isActive={true}
          position={0}
          inputState={verticalSwipe}
          axis="vertical"
          containerSize={500}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ transform: "translateY(50px)" });
    });
  });

  describe("pointer events", () => {
    it("enables pointer events for active content", () => {
      render(
        <SwipePivotContent
          id="test"
          isActive={true}
          position={0}
          inputState={idleState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ pointerEvents: "auto" });
    });

    it("disables pointer events for inactive content", () => {
      render(
        <SwipePivotContent
          id="test"
          isActive={false}
          position={1}
          inputState={swipingLeftState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ pointerEvents: "none" });
    });
  });

  describe("boundary awareness", () => {
    it("hides previous content when swiping right but hasPrevious is false", () => {
      // BUG: Page 1で右スワイプするとPage 2,3が重なって表示される
      // 原因: canNavigate propがなく、存在しないページ方向へのスワイプでもコンテンツが表示される
      render(
        <SwipePivotContent
          id="prev"
          isActive={false}
          position={-1}
          inputState={swipingRightState}
          containerSize={300}
          canNavigate={false} // 前のページは存在しない
        >
          <div data-testid="content">Previous (should not show)</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      // canNavigate=falseなので、スワイプ方向に関わらず非表示であるべき
      expect(wrapper).toHaveStyle({ visibility: "hidden" });
    });

    it("hides next content when swiping left but hasNext is false", () => {
      // 最後のページで左スワイプしても次のコンテンツは表示されるべきではない
      render(
        <SwipePivotContent
          id="next"
          isActive={false}
          position={1}
          inputState={swipingLeftState}
          containerSize={300}
          canNavigate={false} // 次のページは存在しない
        >
          <div data-testid="content">Next (should not show)</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "hidden" });
    });

    it("shows previous content when swiping right and canNavigate is true", () => {
      render(
        <SwipePivotContent
          id="prev"
          isActive={false}
          position={-1}
          inputState={swipingRightState}
          containerSize={300}
          canNavigate={true}
        >
          <div data-testid="content">Previous</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "visible" });
    });

    it("defaults canNavigate to true for backward compatibility", () => {
      // canNavigateを指定しない場合は従来通りの動作
      render(
        <SwipePivotContent
          id="prev"
          isActive={false}
          position={-1}
          inputState={swipingRightState}
          containerSize={300}
        >
          <div data-testid="content">Previous</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveStyle({ visibility: "visible" });
    });
  });

  describe("data attributes", () => {
    it("sets correct data attributes", () => {
      render(
        <SwipePivotContent
          id="test-item"
          isActive={true}
          position={0}
          inputState={idleState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      expect(wrapper).toHaveAttribute("data-pivot-content", "test-item");
      expect(wrapper).toHaveAttribute("data-active", "true");
      expect(wrapper).toHaveAttribute("data-position", "0");
    });
  });

  describe("snap animation - TDD for 'bouncing back' issue", () => {
    /**
     * 問題の再現:
     * スワイプ終了時、コンテンツが一旦元の位置に戻ってから次のページに移動する。
     *
     * 原因:
     * - phase === "ended" のとき、calculateTranslation が basePosition を返す
     * - これによりスワイプ位置から即座に元の位置にジャンプする
     * - その後、activeが切り替わり、再度アニメーションが発生
     *
     * 期待動作:
     * - スワイプ終了時、最後のdisplacement位置を維持
     * - そこから目標位置へスムーズにアニメーション
     */

    it("should maintain last displacement when phase changes to ended", () => {
      // スワイプ中の状態: -150px移動 (左へスワイプ)
      const swipingState: SwipeInputState = {
        phase: "swiping",
        displacement: { x: -150, y: 0 },
        velocity: { x: -0.5, y: 0 },
        direction: -1,
      };

      const { rerender } = render(
        <SwipePivotContent
          id="test"
          isActive={true}
          position={0}
          inputState={swipingState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      // スワイプ中: position 0 + displacement -150 = -150px
      expect(wrapper).toHaveStyle({ transform: "translateX(-150px)" });

      // スワイプ終了: phase が ended に変化
      // この時、最後のdisplacementを維持すべき（一旦戻らない）
      const endedState: SwipeInputState = {
        phase: "ended",
        displacement: { x: -150, y: 0 }, // 最後のdisplacementを保持
        velocity: { x: -0.5, y: 0 },
        direction: -1,
      };

      rerender(
        <SwipePivotContent
          id="test"
          isActive={true}
          position={0}
          inputState={endedState}
          containerSize={300}
        >
          <div data-testid="content">Content</div>
        </SwipePivotContent>,
      );

      // 問題: 現在の実装では basePosition (0px) に戻ってしまう
      // 期待: 最後のdisplacement位置 (-150px) を維持してからアニメーション開始
      expect(wrapper).toHaveStyle({ transform: "translateX(-150px)" });
    });

    it("should animate from last displacement to target position, not from base position", () => {
      // スワイプ終了時、次のページへ遷移する場合を想定
      const endedState: SwipeInputState = {
        phase: "ended",
        displacement: { x: -150, y: 0 },
        velocity: { x: -0.5, y: 0 },
        direction: -1,
      };

      render(
        <SwipePivotContent
          id="next-page"
          isActive={false}
          position={1}
          inputState={endedState}
          containerSize={300}
        >
          <div data-testid="content">Next Page</div>
        </SwipePivotContent>,
      );

      const wrapper = screen.getByTestId("content").parentElement;
      // 次ページは position=1 (300px) + displacement (-150) = 150px にいるべき
      // 問題: 現在は position=1 の basePosition (300px) を返す
      expect(wrapper).toHaveStyle({ transform: "translateX(150px)" });
    });
  });
});
