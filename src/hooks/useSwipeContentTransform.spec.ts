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
        isSwiping: false,
      }),
    );

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.currentPx).toBe(0);
  });

  it("updates element transform during swipe", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ displacement, isSwiping }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx: 0,
          displacement,
          isSwiping,
        }),
      {
        initialProps: { displacement: 0, isSwiping: true },
      },
    );

    // Simulate swipe movement
    rerender({ displacement: 100, isSwiping: true });

    expect(element.style.transform).toBe("translateX(100px)");
  });

  it("uses correct transform function for vertical axis", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ displacement, isSwiping }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx: 0,
          displacement,
          isSwiping,
          axis: "vertical",
        }),
      {
        initialProps: { displacement: 0, isSwiping: true },
      },
    );

    rerender({ displacement: 50, isSwiping: true });

    expect(element.style.transform).toBe("translateY(50px)");
  });

  it("applies target position with displacement", () => {
    const { element, ref } = createMockElementRef();
    const { rerender } = renderHook(
      ({ displacement, isSwiping }) =>
        useSwipeContentTransform({
          elementRef: ref,
          targetPx: -300, // target is off-screen left
          displacement,
          isSwiping,
        }),
      {
        initialProps: { displacement: 0, isSwiping: true },
      },
    );

    // During swipe, position = targetPx + displacement
    rerender({ displacement: 100, isSwiping: true });

    expect(element.style.transform).toBe("translateX(-200px)");
  });

  it("does not update transform when element ref is null", () => {
    const nullRef: React.RefObject<HTMLElement | null> = { current: null };

    const { rerender } = renderHook(
      ({ displacement, isSwiping }) =>
        useSwipeContentTransform({
          elementRef: nullRef,
          targetPx: 0,
          displacement,
          isSwiping,
        }),
      {
        initialProps: { displacement: 0, isSwiping: true },
      },
    );

    // Should not throw
    expect(() => {
      rerender({ displacement: 100, isSwiping: true });
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
          isSwiping: false,
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
