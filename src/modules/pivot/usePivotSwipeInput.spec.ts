/**
 * @file Tests for usePivotSwipeInput hook.
 */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { usePivotSwipeInput } from "./usePivotSwipeInput.js";
import type { UsePivotResult } from "./types.js";

type CallTracker = {
  calls: ReadonlyArray<ReadonlyArray<unknown>>;
  fn: (...args: ReadonlyArray<unknown>) => void;
};

const createCallTracker = (): CallTracker => {
  const calls: Array<ReadonlyArray<unknown>> = [];
  const fn = (...args: ReadonlyArray<unknown>): void => {
    calls.push(args);
  };
  return { calls, fn };
};

type MockPivotState = {
  pivot: Pick<UsePivotResult, "go" | "canGo">;
  calls: {
    go: CallTracker;
    canGo: CallTracker;
  };
};

describe("usePivotSwipeInput", () => {

  const createRef = (): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    return { current: element };
  };

  const createMockPivot = (canGoResult: boolean = true): MockPivotState => {
    const go = createCallTracker();
    const canGo = createCallTracker();
    const canGoFn = (direction: number): boolean => {
      canGo.fn(direction);
      return canGoResult;
    };
    return {
      pivot: {
        go: go.fn,
        canGo: canGoFn,
      },
      calls: {
        go,
        canGo,
      },
    };
  };

  describe("initialization", () => {
    it("starts with idle state", () => {
      const containerRef = createRef();
      const { pivot } = createMockPivot(true);

      const { result } = renderHook(() =>
        usePivotSwipeInput({ containerRef, pivot }),
      );

      expect(result.current.inputState.phase).toBe("idle");
    });

    it("provides container props with style", () => {
      const containerRef = createRef();
      const { pivot } = createMockPivot(true);

      const { result } = renderHook(() =>
        usePivotSwipeInput({ containerRef, pivot }),
      );

      expect(result.current.containerProps.style).toBeDefined();
      expect(result.current.containerProps.style.touchAction).toBe("pan-y pinch-zoom");
    });
  });

  describe("swipe to navigate", () => {
    it("calls go(1) when swiping left (to see next)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot(true);

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Swipe left (negative X direction)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 100, // -100px (swipe left)
        clientY: 105,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      // Swipe left (-1 direction) should call go(1) to show next
      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(1);
    });

    it("calls go(-1) when swiping right (to see previous)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot(true);

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Swipe right (positive X direction)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 200, // +100px (swipe right)
        clientY: 105,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      // Swipe right (1 direction) should call go(-1) to show previous
      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(-1);
    });

    it("does not call go when canGo returns false", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot(false);

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Swipe left
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 100,
        clientY: 105,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      expect(calls.go.calls).toHaveLength(0);
    });
  });

  describe("input state tracking", () => {
    it("updates inputState during swipe", () => {
      const containerRef = createRef();
      const { pivot } = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({ containerRef, pivot }),
      );

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.inputState.phase).toBe("tracking");

      // Move past lock threshold
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 130, // 30px horizontal
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(result.current.inputState.phase).toBe("swiping");
      expect(result.current.inputState.displacement.x).toBe(30);
    });
  });

  describe("disabled state", () => {
    it("does not track when disabled", () => {
      const containerRef = createRef();
      const { pivot } = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({ containerRef, pivot, enabled: false }),
      );

      const downEvent = {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      expect(result.current.inputState.phase).toBe("idle");
    });
  });

  describe("vertical axis", () => {
    it("supports vertical swipe when axis is vertical", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          axis: "vertical",
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
        }),
      );

      expect(result.current.containerProps.style.touchAction).toBe("pan-x pinch-zoom");

      // Pointer down
      const downEvent = {
        clientX: 100,
        clientY: 200,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Swipe up (negative Y direction)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 102,
        clientY: 100, // -100px vertical
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Pointer up
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      // Swipe up (-1 direction) should call go(1) to show next
      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(1);
    });
  });

  describe("threshold sensitivity - TDD for 'too sensitive' issue", () => {
    /**
     * 問題の再現:
     * ページ送り実行までのめくり量の閾値が過敏すぎる。
     * 少しでも捲ろうものなら移動されてしまう。
     *
     * 原因:
     * - distanceThreshold: 50px は一般的なスマホ画面幅(375px)の約13%
     * - velocityThreshold: 0.3 px/ms = 300px/s は低すぎる
     * - これらが「OR」で評価されるため、どちらか一方でもトリガー
     *
     * 期待動作:
     * - 画面幅の少なくとも25-33%程度移動しないとページ送りされない
     * - または十分な速度でスワイプしないとトリガーされない
     */

    it("should NOT trigger navigation with small displacement (under 25% of container)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      // コンテナ幅が400pxの場合、25%=100px未満はトリガーしないべき
      const containerWidth = 400;
      const smallDisplacement = containerWidth * 0.2; // 80px = 20%

      // Mock performance.now() to control velocity calculation
      // 80px / 200ms = 0.4 px/ms (under 0.5 threshold)
      let mockTime = 0;
      const originalPerformanceNow = performance.now;
      performance.now = () => mockTime;

      try {
        const { result } = renderHook(() =>
          usePivotSwipeInput({
            containerRef,
            pivot,
            // 推奨閾値: コンテナ幅の25%程度
            thresholds: {
              distanceThreshold: containerWidth * 0.25, // 100px
              velocityThreshold: 0.5, // より高い閾値
              lockThreshold: 10,
            },
          }),
        );

        // Pointer down at time 0
        mockTime = 0;
        const downEvent = {
          clientX: 200,
          clientY: 100,
          pointerId: 1,
          isPrimary: true,
          pointerType: "touch",
          button: 0,
        } as React.PointerEvent<HTMLElement>;

        act(() => {
          result.current.containerProps.onPointerDown?.(downEvent);
        });

        // 小さな移動 (80px left) at time 200ms
        // velocity = 80px / 200ms = 0.4 px/ms (under 0.5 threshold)
        mockTime = 200;
        const moveEvent = new PointerEvent("pointermove", {
          clientX: 200 - smallDisplacement,
          clientY: 102,
          pointerId: 1,
        });

        act(() => {
          document.dispatchEvent(moveEvent);
        });

        // Pointer up
        const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

        act(() => {
          document.dispatchEvent(upEvent);
        });

        // 閾値未満の移動ではナビゲーションされないべき
        expect(calls.go.calls).toHaveLength(0);
      } finally {
        performance.now = originalPerformanceNow;
      }
    });

    it("should trigger navigation with significant displacement (over 25% of container)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      const containerWidth = 400;
      const significantDisplacement = containerWidth * 0.3; // 120px = 30%

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          thresholds: {
            distanceThreshold: containerWidth * 0.25, // 100px
            velocityThreshold: 0.5,
            lockThreshold: 10,
          },
        }),
      );

      const downEvent = {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // 十分な移動 (120px left)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 200 - significantDisplacement,
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      // 閾値を超えた移動ではナビゲーションされる
      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(1);
    });

    it("does NOT trigger with displacement under default threshold (100px)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      // Mock performance.now() to control velocity calculation
      // 60px / 200ms = 0.3 px/ms (under 0.5 threshold)
      let mockTime = 0;
      const originalPerformanceNow = performance.now;
      performance.now = () => mockTime;

      try {
        // デフォルト閾値: distanceThreshold: 100px, velocityThreshold: 0.5 px/ms
        const { result } = renderHook(() =>
          usePivotSwipeInput({
            containerRef,
            pivot,
            // デフォルト値を使用
          }),
        );

        mockTime = 0;
        const downEvent = {
          clientX: 200,
          clientY: 100,
          pointerId: 1,
          isPrimary: true,
          pointerType: "touch",
          button: 0,
        } as React.PointerEvent<HTMLElement>;

        act(() => {
          result.current.containerProps.onPointerDown?.(downEvent);
        });

        // 60pxは新しいデフォルト閾値(100px)未満
        // velocity = 60px / 200ms = 0.3 px/ms (under 0.5 threshold)
        mockTime = 200;
        const moveEvent = new PointerEvent("pointermove", {
          clientX: 140, // -60px (< 100px threshold)
          clientY: 102,
          pointerId: 1,
        });

        act(() => {
          document.dispatchEvent(moveEvent);
        });

        const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

        act(() => {
          document.dispatchEvent(upEvent);
        });

        // 閾値未満なのでトリガーされない
        expect(calls.go.calls).toHaveLength(0);
      } finally {
        performance.now = originalPerformanceNow;
      }
    });

    it("triggers with displacement over default threshold (100px)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
        }),
      );

      const downEvent = {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // 120pxは新しいデフォルト閾値(100px)以上
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 80, // -120px (> 100px threshold)
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(1);
    });
  });

  describe("pointercancel - TDD for 'navigation confirmed while finger still down' issue", () => {
    /**
     * 問題の再現:
     * 指を離していないのに移動が確定してしまう。
     *
     * 原因の仮説:
     * - ブラウザがネイティブスクロールやジェスチャーを検出するとpointercancelが発火
     * - 現在の実装ではpointercancelでもpointerupと同様にナビゲーションがトリガーされる
     * - ユーザーは指を離していないにもかかわらず、ページ遷移が確定してしまう
     *
     * 期待動作:
     * - pointercancelが発火した場合は、ナビゲーションをトリガーしない（キャンセル扱い）
     * - 正常なpointerup時のみナビゲーションを実行
     */

    it("should NOT trigger navigation when pointercancel fires (finger still down)", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Swipe left past threshold (100px > 50px threshold)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 100, // -100px
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Browser fires pointercancel (e.g., native scroll detected)
      // User's finger is still on the screen!
      const cancelEvent = new PointerEvent("pointercancel", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(cancelEvent);
      });

      // Navigation should NOT be triggered - the swipe was canceled, not completed
      expect(calls.go.calls).toHaveLength(0);
    });

    it("should trigger navigation normally on pointerup", () => {
      const containerRef = createRef();
      const { pivot, calls } = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          thresholds: { distanceThreshold: 50, velocityThreshold: 0.3, lockThreshold: 10 },
        }),
      );

      // Pointer down
      const downEvent = {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      } as React.PointerEvent<HTMLElement>;

      act(() => {
        result.current.containerProps.onPointerDown?.(downEvent);
      });

      // Swipe left past threshold
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 100,
        clientY: 102,
        pointerId: 1,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // User lifts finger normally
      const upEvent = new PointerEvent("pointerup", { pointerId: 1 });

      act(() => {
        document.dispatchEvent(upEvent);
      });

      // Navigation SHOULD be triggered
      expect(calls.go.calls).toHaveLength(1);
      expect(calls.go.calls[0]?.[0]).toBe(1);
    });
  });
});
