/**
 * @file Tests for gesture simulator utilities.
 */
import {
  createGestureSimulator,
  createMockContainer,
  createMockContainerRef,
} from "./createGestureSimulator.js";

type EventTracker = {
  calls: ReadonlyArray<PointerEvent>;
  handler: (event: Event) => void;
};

const createEventTracker = (): EventTracker => {
  const calls: PointerEvent[] = [];
  const handler = (event: Event): void => {
    calls.push(event as PointerEvent);
  };
  return { calls, handler };
};

describe("createGestureSimulator", () => {
  describe("pointerDown", () => {
    it("dispatches pointerdown event", () => {
      const simulator = createGestureSimulator();
      const tracker = createEventTracker();
      document.addEventListener("pointerdown", tracker.handler);

      simulator.pointerDown(100, 200);

      expect(tracker.calls).toHaveLength(1);
      const event = tracker.calls[0] as PointerEvent;
      expect(event.clientX).toBe(100);
      expect(event.clientY).toBe(200);
      expect(event.pointerType).toBe("touch");
      expect(event.pointerId).toBe(1);

      document.removeEventListener("pointerdown", tracker.handler);
    });
  });

  describe("pointerMove", () => {
    it("dispatches pointermove event after pointerdown", () => {
      const simulator = createGestureSimulator();
      const tracker = createEventTracker();
      document.addEventListener("pointermove", tracker.handler);

      simulator.pointerDown(100, 100);
      simulator.pointerMove(150, 120);

      expect(tracker.calls).toHaveLength(1);
      const event = tracker.calls[0] as PointerEvent;
      expect(event.clientX).toBe(150);
      expect(event.clientY).toBe(120);

      document.removeEventListener("pointermove", tracker.handler);
    });

    it("does not dispatch pointermove if pointer is not down", () => {
      const simulator = createGestureSimulator();
      const tracker = createEventTracker();
      document.addEventListener("pointermove", tracker.handler);

      simulator.pointerMove(150, 120);

      expect(tracker.calls).toHaveLength(0);

      document.removeEventListener("pointermove", tracker.handler);
    });
  });

  describe("pointerUp", () => {
    it("dispatches pointerup event", () => {
      const simulator = createGestureSimulator();
      const tracker = createEventTracker();
      document.addEventListener("pointerup", tracker.handler);

      simulator.pointerDown(100, 100);
      simulator.pointerUp();

      expect(tracker.calls).toHaveLength(1);

      document.removeEventListener("pointerup", tracker.handler);
    });

    it("does not dispatch pointerup if pointer is not down", () => {
      const simulator = createGestureSimulator();
      const tracker = createEventTracker();
      document.addEventListener("pointerup", tracker.handler);

      simulator.pointerUp();

      expect(tracker.calls).toHaveLength(0);

      document.removeEventListener("pointerup", tracker.handler);
    });
  });

  describe("swipe", () => {
    it("dispatches complete swipe sequence", () => {
      const simulator = createGestureSimulator();
      const downTracker = createEventTracker();
      const moveTracker = createEventTracker();
      const upTracker = createEventTracker();

      document.addEventListener("pointerdown", downTracker.handler);
      document.addEventListener("pointermove", moveTracker.handler);
      document.addEventListener("pointerup", upTracker.handler);

      simulator.swipe({ x: 100, y: 100 }, { x: 200, y: 100 }, 5);

      expect(downTracker.calls).toHaveLength(1);
      expect(moveTracker.calls).toHaveLength(5); // 5 steps
      expect(upTracker.calls).toHaveLength(1);

      // Check intermediate positions
      const lastMove = moveTracker.calls[4] as PointerEvent;
      expect(lastMove.clientX).toBe(200);
      expect(lastMove.clientY).toBe(100);

      document.removeEventListener("pointerdown", downTracker.handler);
      document.removeEventListener("pointermove", moveTracker.handler);
      document.removeEventListener("pointerup", upTracker.handler);
    });
  });

  describe("edgeSwipe", () => {
    it("simulates left edge swipe", () => {
      const simulator = createGestureSimulator();
      const downTracker = createEventTracker();
      const upTracker = createEventTracker();

      document.addEventListener("pointerdown", downTracker.handler);
      document.addEventListener("pointerup", upTracker.handler);

      simulator.edgeSwipe("left", 100, 300);

      expect(downTracker.calls).toHaveLength(1);
      const downEvent = downTracker.calls[0] as PointerEvent;
      expect(downEvent.clientX).toBe(10); // Edge offset
      expect(upTracker.calls).toHaveLength(1);

      document.removeEventListener("pointerdown", downTracker.handler);
      document.removeEventListener("pointerup", upTracker.handler);
    });

    it("simulates right edge swipe", () => {
      const simulator = createGestureSimulator();
      const downTracker = createEventTracker();

      document.addEventListener("pointerdown", downTracker.handler);

      simulator.edgeSwipe("right", 100, 300);

      const downEvent = downTracker.calls[0] as PointerEvent;
      expect(downEvent.clientX).toBe(290); // containerSize - edgeOffset

      document.removeEventListener("pointerdown", downTracker.handler);
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
      const tracker = createEventTracker();
      document.addEventListener("pointerdown", tracker.handler);

      simulator.pointerDown(100, 100);

      const event = tracker.calls[0] as PointerEvent;
      expect(event.pointerType).toBe("mouse");

      document.removeEventListener("pointerdown", tracker.handler);
    });

    it("respects custom pointer ID", () => {
      const simulator = createGestureSimulator({ pointerId: 5 });
      const tracker = createEventTracker();
      document.addEventListener("pointerdown", tracker.handler);

      simulator.pointerDown(100, 100);

      const event = tracker.calls[0] as PointerEvent;
      expect(event.pointerId).toBe(5);

      document.removeEventListener("pointerdown", tracker.handler);
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
