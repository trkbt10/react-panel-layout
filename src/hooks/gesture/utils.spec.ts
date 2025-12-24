/**
 * @file Unit tests for gesture utility functions.
 */
import { calculateVelocity, determineDirection, mergeGestureContainerProps } from "./utils.js";
import type { GestureContainerProps } from "./utils.js";

describe("calculateVelocity", () => {
  it("returns 0 when elapsed time is 0", () => {
    const result = calculateVelocity(100, 1000, 1000);
    expect(result).toBe(0);
  });

  it("returns 0 when elapsed time is negative", () => {
    const result = calculateVelocity(100, 1000, 900);
    expect(result).toBe(0);
  });

  it("calculates positive velocity correctly", () => {
    // 100px in 50ms = 2 px/ms
    const result = calculateVelocity(100, 1000, 1050);
    expect(result).toBe(2);
  });

  it("calculates negative velocity correctly", () => {
    // -100px in 50ms = -2 px/ms
    const result = calculateVelocity(-100, 1000, 1050);
    expect(result).toBe(-2);
  });
});

describe("determineDirection", () => {
  it("returns 1 for positive displacement", () => {
    expect(determineDirection(10)).toBe(1);
    expect(determineDirection(0.1)).toBe(1);
  });

  it("returns -1 for negative displacement", () => {
    expect(determineDirection(-10)).toBe(-1);
    expect(determineDirection(-0.1)).toBe(-1);
  });

  it("returns 0 for zero displacement", () => {
    expect(determineDirection(0)).toBe(0);
  });
});

/**
 * Simple fake handler that tracks calls.
 */
const createFakeHandler = () => {
  const calls: Array<React.PointerEvent<HTMLElement>> = [];
  const handler = (event: React.PointerEvent<HTMLElement>) => {
    calls.push(event);
  };
  return { handler, calls };
};

describe("mergeGestureContainerProps", () => {
  it("merges styles from multiple props", () => {
    const props1: GestureContainerProps = {
      style: { touchAction: "pan-y" },
    };
    const props2: GestureContainerProps = {
      style: { userSelect: "none" },
    };

    const result = mergeGestureContainerProps(props1, props2);

    expect(result.style).toEqual({
      touchAction: "pan-y",
      userSelect: "none",
    });
  });

  it("later styles override earlier styles", () => {
    const props1: GestureContainerProps = {
      style: { touchAction: "pan-y" },
    };
    const props2: GestureContainerProps = {
      style: { touchAction: "none" },
    };

    const result = mergeGestureContainerProps(props1, props2);

    expect(result.style.touchAction).toBe("none");
  });

  it("chains onPointerDown handlers", () => {
    const fake1 = createFakeHandler();
    const fake2 = createFakeHandler();

    const props1: GestureContainerProps = {
      onPointerDown: fake1.handler,
      style: {},
    };
    const props2: GestureContainerProps = {
      onPointerDown: fake2.handler,
      style: {},
    };

    const result = mergeGestureContainerProps(props1, props2);
    const mockEvent = {} as React.PointerEvent<HTMLElement>;
    result.onPointerDown?.(mockEvent);

    expect(fake1.calls).toHaveLength(1);
    expect(fake1.calls[0]).toBe(mockEvent);
    expect(fake2.calls).toHaveLength(1);
    expect(fake2.calls[0]).toBe(mockEvent);
  });

  it("handles props without onPointerDown", () => {
    const fake = createFakeHandler();

    const props1: GestureContainerProps = {
      style: { touchAction: "pan-y" },
    };
    const props2: GestureContainerProps = {
      onPointerDown: fake.handler,
      style: {},
    };

    const result = mergeGestureContainerProps(props1, props2);
    const mockEvent = {} as React.PointerEvent<HTMLElement>;
    result.onPointerDown?.(mockEvent);

    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]).toBe(mockEvent);
  });

  it("handles empty props array", () => {
    const result = mergeGestureContainerProps();

    expect(result.style).toEqual({});
    expect(result.onPointerDown).toBeDefined();
  });

  it("handles single props", () => {
    const fake = createFakeHandler();
    const props: GestureContainerProps = {
      onPointerDown: fake.handler,
      style: { touchAction: "pan-y" },
    };

    const result = mergeGestureContainerProps(props);

    expect(result.style).toEqual({ touchAction: "pan-y" });
    const mockEvent = {} as React.PointerEvent<HTMLElement>;
    result.onPointerDown?.(mockEvent);
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]).toBe(mockEvent);
  });
});
