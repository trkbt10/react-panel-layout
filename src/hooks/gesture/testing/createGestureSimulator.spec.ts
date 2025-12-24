/**
 * @file Tests for gesture simulator utilities.
 */
/* eslint-disable no-restricted-globals, no-restricted-properties -- test utilities need vi for timing and mocks */
import {
  createGestureSimulator,
  createMockContainer,
  createMockContainerRef,
} from "./createGestureSimulator.js";

describe("createGestureSimulator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("pointerDown", () => {
    it("dispatches pointerdown event", () => {
      const simulator = createGestureSimulator();
      const handler = vi.fn();
      document.addEventListener("pointerdown", handler);

      simulator.pointerDown(100, 200);

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as PointerEvent;
      expect(event.clientX).toBe(100);
      expect(event.clientY).toBe(200);
      expect(event.pointerType).toBe("touch");
      expect(event.pointerId).toBe(1);

      document.removeEventListener("pointerdown", handler);
    });
  });

  describe("pointerMove", () => {
    it("dispatches pointermove event after pointerdown", () => {
      const simulator = createGestureSimulator();
      const handler = vi.fn();
      document.addEventListener("pointermove", handler);

      simulator.pointerDown(100, 100);
      simulator.pointerMove(150, 120);

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as PointerEvent;
      expect(event.clientX).toBe(150);
      expect(event.clientY).toBe(120);

      document.removeEventListener("pointermove", handler);
    });

    it("does not dispatch pointermove if pointer is not down", () => {
      const simulator = createGestureSimulator();
      const handler = vi.fn();
      document.addEventListener("pointermove", handler);

      simulator.pointerMove(150, 120);

      expect(handler).not.toHaveBeenCalled();

      document.removeEventListener("pointermove", handler);
    });
  });

  describe("pointerUp", () => {
    it("dispatches pointerup event", () => {
      const simulator = createGestureSimulator();
      const handler = vi.fn();
      document.addEventListener("pointerup", handler);

      simulator.pointerDown(100, 100);
      simulator.pointerUp();

      expect(handler).toHaveBeenCalledTimes(1);

      document.removeEventListener("pointerup", handler);
    });

    it("does not dispatch pointerup if pointer is not down", () => {
      const simulator = createGestureSimulator();
      const handler = vi.fn();
      document.addEventListener("pointerup", handler);

      simulator.pointerUp();

      expect(handler).not.toHaveBeenCalled();

      document.removeEventListener("pointerup", handler);
    });
  });

  describe("swipe", () => {
    it("dispatches complete swipe sequence", () => {
      const simulator = createGestureSimulator();
      const downHandler = vi.fn();
      const moveHandler = vi.fn();
      const upHandler = vi.fn();

      document.addEventListener("pointerdown", downHandler);
      document.addEventListener("pointermove", moveHandler);
      document.addEventListener("pointerup", upHandler);

      simulator.swipe({ x: 100, y: 100 }, { x: 200, y: 100 }, 5);

      expect(downHandler).toHaveBeenCalledTimes(1);
      expect(moveHandler).toHaveBeenCalledTimes(5); // 5 steps
      expect(upHandler).toHaveBeenCalledTimes(1);

      // Check intermediate positions
      const lastMove = moveHandler.mock.calls[4][0] as PointerEvent;
      expect(lastMove.clientX).toBe(200);
      expect(lastMove.clientY).toBe(100);

      document.removeEventListener("pointerdown", downHandler);
      document.removeEventListener("pointermove", moveHandler);
      document.removeEventListener("pointerup", upHandler);
    });
  });

  describe("edgeSwipe", () => {
    it("simulates left edge swipe", () => {
      const simulator = createGestureSimulator();
      const downHandler = vi.fn();
      const upHandler = vi.fn();

      document.addEventListener("pointerdown", downHandler);
      document.addEventListener("pointerup", upHandler);

      simulator.edgeSwipe("left", 100, 300);

      expect(downHandler).toHaveBeenCalledTimes(1);
      const downEvent = downHandler.mock.calls[0][0] as PointerEvent;
      expect(downEvent.clientX).toBe(10); // Edge offset
      expect(upHandler).toHaveBeenCalledTimes(1);

      document.removeEventListener("pointerdown", downHandler);
      document.removeEventListener("pointerup", upHandler);
    });

    it("simulates right edge swipe", () => {
      const simulator = createGestureSimulator();
      const downHandler = vi.fn();

      document.addEventListener("pointerdown", downHandler);

      simulator.edgeSwipe("right", 100, 300);

      const downEvent = downHandler.mock.calls[0][0] as PointerEvent;
      expect(downEvent.clientX).toBe(290); // containerSize - edgeOffset

      document.removeEventListener("pointerdown", downHandler);
    });
  });

  describe("createReactPointerEvent", () => {
    it("creates a React-compatible pointer event", () => {
      const simulator = createGestureSimulator();
      const event = simulator.createReactPointerEvent("pointerdown", 100, 200);

      expect(event.clientX).toBe(100);
      expect(event.clientY).toBe(200);
      expect(event.pointerId).toBe(1);
      expect(event.pointerType).toBe("touch");
      expect(event.isPrimary).toBe(true);
    });
  });

  describe("options", () => {
    it("respects custom pointer type", () => {
      const simulator = createGestureSimulator({ pointerType: "mouse" });
      const handler = vi.fn();
      document.addEventListener("pointerdown", handler);

      simulator.pointerDown(100, 100);

      const event = handler.mock.calls[0][0] as PointerEvent;
      expect(event.pointerType).toBe("mouse");

      document.removeEventListener("pointerdown", handler);
    });

    it("respects custom pointer ID", () => {
      const simulator = createGestureSimulator({ pointerId: 5 });
      const handler = vi.fn();
      document.addEventListener("pointerdown", handler);

      simulator.pointerDown(100, 100);

      const event = handler.mock.calls[0][0] as PointerEvent;
      expect(event.pointerId).toBe(5);

      document.removeEventListener("pointerdown", handler);
    });
  });
});

describe("createMockContainer", () => {
  it("creates container with default dimensions", () => {
    const container = createMockContainer();

    expect(container.clientWidth).toBe(300);
    expect(container.clientHeight).toBe(500);
  });

  it("creates container with custom dimensions", () => {
    const container = createMockContainer({ width: 400, height: 600 });

    expect(container.clientWidth).toBe(400);
    expect(container.clientHeight).toBe(600);
  });

  it("returns correct bounding rect", () => {
    const container = createMockContainer({ width: 300, height: 500, left: 50, top: 100 });
    const rect = container.getBoundingClientRect();

    expect(rect.left).toBe(50);
    expect(rect.top).toBe(100);
    expect(rect.right).toBe(350);
    expect(rect.bottom).toBe(600);
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(500);
  });
});

describe("createMockContainerRef", () => {
  it("creates ref with mock container", () => {
    const ref = createMockContainerRef({ width: 400, height: 600 });

    expect(ref.current).not.toBeNull();
    expect(ref.current?.clientWidth).toBe(400);
    expect(ref.current?.clientHeight).toBe(600);
  });
});
