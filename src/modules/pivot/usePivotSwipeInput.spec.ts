/**
 * @file Tests for usePivotSwipeInput hook.
 */
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { usePivotSwipeInput } from "./usePivotSwipeInput.js";
import type { UsePivotResult } from "./types.js";

describe("usePivotSwipeInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createRef = (): React.RefObject<HTMLDivElement> => {
    const element = document.createElement("div");
    return { current: element };
  };

  const createMockPivot = (): Pick<UsePivotResult, "go" | "canGo"> => ({
    go: vi.fn(),
    canGo: vi.fn().mockReturnValue(true),
  });

  describe("initialization", () => {
    it("starts with idle state", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

      const { result } = renderHook(() =>
        usePivotSwipeInput({ containerRef, pivot }),
      );

      expect(result.current.inputState.phase).toBe("idle");
    });

    it("provides container props with style", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

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
      const pivot = createMockPivot();

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
      expect(pivot.go).toHaveBeenCalledWith(1);
    });

    it("calls go(-1) when swiping right (to see previous)", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

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
      expect(pivot.go).toHaveBeenCalledWith(-1);
    });

    it("does not call go when canGo returns false", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();
      (pivot.canGo as ReturnType<typeof vi.fn>).mockReturnValue(false);

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

      expect(pivot.go).not.toHaveBeenCalled();
    });
  });

  describe("input state tracking", () => {
    it("updates inputState during swipe", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

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
      const pivot = createMockPivot();

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
      const pivot = createMockPivot();

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
      expect(pivot.go).toHaveBeenCalledWith(1);
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
      const pivot = createMockPivot();

      // コンテナ幅が400pxの場合、25%=100px未満はトリガーしないべき
      const containerWidth = 400;
      const smallDisplacement = containerWidth * 0.2; // 80px = 20%

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

      // 小さな移動 (80px left)
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
      expect(pivot.go).not.toHaveBeenCalled();
    });

    it("should trigger navigation with significant displacement (over 25% of container)", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

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
      expect(pivot.go).toHaveBeenCalledWith(1);
    });

    it("does NOT trigger with displacement under default threshold (100px)", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

      // デフォルト閾値: distanceThreshold: 100px, velocityThreshold: 0.5 px/ms
      const { result } = renderHook(() =>
        usePivotSwipeInput({
          containerRef,
          pivot,
          // デフォルト値を使用
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

      // 60pxは新しいデフォルト閾値(100px)未満
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
      expect(pivot.go).not.toHaveBeenCalled();
    });

    it("triggers with displacement over default threshold (100px)", () => {
      const containerRef = createRef();
      const pivot = createMockPivot();

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

      expect(pivot.go).toHaveBeenCalledWith(1);
    });
  });
});
