/**
 * @file Tests for useSwipeContentTransform hook.
 */
import { renderHook } from "@testing-library/react";
import { useSwipeContentTransform } from "./useSwipeContentTransform.js";

describe("useSwipeContentTransform", () => {
  const createMockElementRef = (): { element: HTMLDivElement; ref: React.RefObject<HTMLDivElement> } => {
    const element = document.createElement("div");
    return { element, ref: { current: element } };
  };

  it("returns initial state correctly", () => {
    const { ref } = createMockElementRef();
    const { result } = renderHook(() =>
      useSwipeContentTransform({
        elementRef: ref,
        targetPx: 0,
        displacement: 0,
        isOperating: false,
      }),
    );

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.currentPx).toBe(0);
  });

  it("updates element transform during swipe", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ displacement, isOperating }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx: 0,
          displacement,
          isOperating,
        }),
      {
        initialProps: { displacement: 0, isOperating: true },
      },
    );

    // Simulate swipe movement
    rerender({ displacement: 100, isOperating: true });

    expect(element.style.transform).toBe("translateX(100px)");
  });

  it("uses correct transform function for vertical axis", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ displacement, isOperating }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx: 0,
          displacement,
          isOperating,
          axis: "vertical",
        }),
      {
        initialProps: { displacement: 0, isOperating: true },
      },
    );

    rerender({ displacement: 50, isOperating: true });

    expect(element.style.transform).toBe("translateY(50px)");
  });

  it("applies target position with displacement", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ displacement, isOperating }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx: -300, // target is off-screen left
          displacement,
          isOperating,
        }),
      {
        initialProps: { displacement: 0, isOperating: true },
      },
    );

    // During swipe, position = targetPx + displacement
    rerender({ displacement: 100, isOperating: true });

    expect(element.style.transform).toBe("translateX(-200px)");
  });

  it("does not update transform when element ref is null", () => {
    const nullRef: React.RefObject<HTMLElement | null> = { current: null };

    const { rerender } = renderHook(
      ({ displacement, isOperating }) =>
        useSwipeContentTransform({
          elementRef: nullRef,
          targetPx: 0,
          displacement,
          isOperating,
        }),
      {
        initialProps: { displacement: 0, isOperating: true },
      },
    );

    // Should not throw
    expect(() => {
      rerender({ displacement: 100, isOperating: true });
    }).not.toThrow();
  });

  it("snaps to target when target changes and not swiping", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ targetPx }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx,
          displacement: 0,
          isOperating: false,
        }),
      {
        initialProps: { targetPx: 0 },
      },
    );

    // Change target without swiping - should snap
    rerender({ targetPx: 300 });

    expect(element.style.transform).toBe("translateX(300px)");
  });
});
