/**
 * @file Tests for useResizeObserver hook.
 *
 * These tests define the contract that useResizeObserver must fulfill.
 * The key requirement is that consuming components can rely on containerSize
 * being available when their animation logic runs.
 */
/* eslint-disable no-restricted-syntax -- Dynamic imports needed for isolated module testing */
import { render, act } from "@testing-library/react";
import * as React from "react";

// We'll import the hook after defining what it should do
// import { useResizeObserver } from "./useResizeObserver.js";

/**
 * Mock ResizeObserver
 */
class MockResizeObserver implements ResizeObserver {
  private static instances: MockResizeObserver[] = [];
  private callback: ResizeObserverCallback;
  private observed = new Set<Element>();

  static getInstances(): MockResizeObserver[] {
    return this.instances;
  }

  static clearInstances(): void {
    this.instances = [];
  }

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Required for interface compatibility
  observe(target: Element, options?: ResizeObserverOptions): void {
    this.observed.add(target);
    // Real ResizeObserver fires callback asynchronously after observe
    // We simulate immediate callback for testing
    const entry = this.createEntry(target, 400, 300);
    this.callback([entry], this);
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
  }

  triggerResize(target: Element, width: number, height: number): void {
    if (this.observed.has(target)) {
      const entry = this.createEntry(target, width, height);
      this.callback([entry], this);
    }
  }

  private createEntry(target: Element, width: number, height: number): ResizeObserverEntry {
    return {
      target,
      contentRect: new DOMRect(0, 0, width, height),
      borderBoxSize: [{ inlineSize: width, blockSize: height }],
      contentBoxSize: [{ inlineSize: width, blockSize: height }],
      devicePixelContentBoxSize: [],
    };
  }
}

const originalResizeObserver = globalThis.ResizeObserver;

describe("useResizeObserver contract", () => {
  beforeEach(() => {
    MockResizeObserver.clearInstances();
    globalThis.ResizeObserver = MockResizeObserver;

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      return new DOMRect(0, 0, 400, 300);
    };
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  describe("timing requirements", () => {
    /**
     * This is the critical test case.
     *
     * In the real use case (StackTablet -> SwipeStackContent):
     * 1. StackTablet renders, calls useResizeObserver
     * 2. StackTablet passes containerSize to SwipeStackContent
     * 3. SwipeStackContent uses containerSize in its first useLayoutEffect
     *
     * The question: Can containerSize be > 0 when SwipeStackContent's
     * useLayoutEffect runs for the first time?
     *
     * Answer: This depends on React's effect execution order.
     * - Effects run in order of hook registration
     * - Parent's effects run before children's effects? NO.
     * - Actually, React runs effects bottom-up (children first, then parents)
     *
     * So when SwipeStackContent's useLayoutEffect runs:
     * - It's the FIRST effect to run (child before parent)
     * - useResizeObserver's useLayoutEffect hasn't run yet
     * - Therefore containerSize is still 0
     *
     * This means we MUST handle containerSize=0 in SwipeStackContent.
     * The question is: how to abstract this properly?
     */
    it("documents React effect execution order", () => {
      const executionOrder: string[] = [];

      const Child: React.FC<{ size: number }> = ({ size }) => {
        React.useLayoutEffect(() => {
          executionOrder.push(`child-layout-effect: size=${size}`);
        }, []);

        return <div>Child: {size}</div>;
      };

      const Parent: React.FC = () => {
        const ref = React.useRef<HTMLDivElement>(null);
        const [size, setSize] = React.useState(0);

        React.useLayoutEffect(() => {
          executionOrder.push("parent-layout-effect: measuring");
          if (ref.current) {
            setSize(ref.current.getBoundingClientRect().width);
          }
        }, []);

        executionOrder.push(`parent-render: size=${size}`);

        return (
          <div ref={ref}>
            <Child size={size} />
          </div>
        );
      };

      render(<Parent />);

      // This documents the actual execution order
      // Parent renders first with size=0
      // Child renders with size=0
      // Child's useLayoutEffect runs (sees size=0)
      // Parent's useLayoutEffect runs (sets size=400)
      // Re-render with size=400
      expect(executionOrder).toContain("child-layout-effect: size=0");
    });

    /**
     * Given the above, the proper abstraction is:
     *
     * useResizeObserver should provide a way for consumers to know
     * when the size is "ready" (first valid measurement complete).
     *
     * Consumers that depend on size for animation should:
     * - Not start animation until size is ready
     * - OR use a hook that handles this internally
     */
    it("should indicate when size is ready", async () => {
      // Import dynamically to test the implementation
      const { useResizeObserver } = await import("./useResizeObserver.js");

      const results: Array<{ width: number; isReady: boolean }> = [];

      const TestComponent: React.FC = () => {
        const ref = React.useRef<HTMLDivElement>(null);
        const { rect } = useResizeObserver(ref, { box: "border-box" });

        const width = rect?.width ?? 0;
        const isReady = rect !== null;

        React.useEffect(() => {
          results.push({ width, isReady });
        }, [width, isReady]);

        return <div ref={ref} style={{ width: 400, height: 300 }} />;
      };

      render(<TestComponent />);

      // After effects run, size should be available
      await act(async () => {});

      const lastResult = results[results.length - 1];
      expect(lastResult.isReady).toBe(true);
      expect(lastResult.width).toBe(400);
    });
  });

  describe("memory efficiency", () => {
    it("shares ResizeObserver instances for same box option", async () => {
      const { useResizeObserver, clearObserverCache } = await import("./useResizeObserver.js");
      clearObserverCache();
      MockResizeObserver.clearInstances();

      const TestComponent: React.FC = () => {
        const ref1 = React.useRef<HTMLDivElement>(null);
        const ref2 = React.useRef<HTMLDivElement>(null);
        const ref3 = React.useRef<HTMLDivElement>(null);

        useResizeObserver(ref1, { box: "border-box" });
        useResizeObserver(ref2, { box: "border-box" });
        useResizeObserver(ref3, { box: "border-box" });

        return (
          <>
            <div ref={ref1} />
            <div ref={ref2} />
            <div ref={ref3} />
          </>
        );
      };

      render(<TestComponent />);

      expect(MockResizeObserver.getInstances().length).toBe(1);
    });
  });

  describe("resize updates", () => {
    it("updates when element size changes", async () => {
      const { useResizeObserver, clearObserverCache } = await import("./useResizeObserver.js");
      clearObserverCache();
      MockResizeObserver.clearInstances();

      const widths: number[] = [];

      const TestComponent: React.FC = () => {
        const ref = React.useRef<HTMLDivElement>(null);
        const { rect } = useResizeObserver(ref, { box: "border-box" });

        React.useEffect(() => {
          if (rect) {
            widths.push(rect.width);
          }
        }, [rect]);

        return <div ref={ref} data-testid="target" />;
      };

      const { getByTestId } = render(<TestComponent />);

      await act(async () => {});

      const element = getByTestId("target");
      const observer = MockResizeObserver.getInstances()[0];

      act(() => {
        observer.triggerResize(element, 800, 600);
      });

      expect(widths).toContain(400); // Initial
      expect(widths).toContain(800); // After resize
    });
  });
});

/**
 * Based on the tests above, the conclusion is:
 *
 * 1. React's effect execution order means child effects run before parent effects
 * 2. Therefore, on first render, child components will see containerSize=0
 * 3. This is a fundamental React constraint, not a bug in useResizeObserver
 *
 * The proper abstraction for SwipeStackContent is:
 * - Check if containerSize > 0 before consuming isFirstMount
 * - This is NOT a workaround, it's the correct pattern for this React constraint
 *
 * Alternatively, create a higher-level hook like useAnimatedStack that
 * encapsulates both the size observation and the "ready" state.
 */
