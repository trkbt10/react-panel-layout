/**
 * @file Tests for GridLayout behaviour related to effects and drag handling.
 */
import * as React from "react";
import { render, cleanup, act, fireEvent } from "@testing-library/react";
import { GridLayout } from "./GridLayout";
import type { PanelLayoutConfig, LayerDefinition } from "../../../panels";

const ensurePointerEvent = () => {
  if (typeof window.PointerEvent === "function") {
    return;
  }

  Reflect.set(window, "PointerEvent", MouseEvent);
};

const ensureIntersectionObserver = () => {
  if (typeof window.IntersectionObserver === "function") {
    return;
  }

  const MockIntersectionObserver = function MockIntersectionObserver(this: unknown, callback: IntersectionObserverCallback): IntersectionObserver {
    const observe = (target: Element) => {
      const rect = target.getBoundingClientRect();
      const entry: IntersectionObserverEntry = {
        boundingClientRect: rect,
        intersectionRatio: 1,
        intersectionRect: rect,
        isIntersecting: true,
        rootBounds: null,
        target,
        time: Date.now(),
      };

      callback([entry], observerInstance);
    };

    const observerInstance: IntersectionObserver = {
      root: null,
      rootMargin: "0px",
      thresholds: [],
      observe,
      unobserve() {
        // noop for tests
      },
      disconnect() {
        // noop for tests
      },
      takeRecords() {
        return [];
      },
    };

    return observerInstance;
  };

  Reflect.set(window, "IntersectionObserver", MockIntersectionObserver);
};

describe("GridLayout", () => {
  beforeAll(() => {
    ensurePointerEvent();
    ensureIntersectionObserver();
  });

  afterEach(() => {
    cleanup();
  });

  const baseConfig: PanelLayoutConfig = {
    areas: [["sidebar", "main"]],
    columns: [
      { size: "250px" },
      { size: "1fr" },
    ],
    rows: [{ size: "100%" }],
  };

  const createLayers = (onPositionChange?: (pos: { x: number; y: number }) => void): LayerDefinition[] => {
    return [
      {
        id: "sidebar",
        gridArea: "sidebar",
        component: <div data-testid="sidebar" />,
      },
      {
        id: "layer-1",
        gridArea: "main",
        component: <div data-testid="layer" />,
        draggable: true,
        positionMode: "absolute",
        position: { left: 0, top: 0 },
        onPositionChange,
      },
    ];
  };

  it("does not call onPositionChange on initial render", () => {
    const recordedPositions: Array<{ x: number; y: number }> = [];

    render(
      <GridLayout
        config={baseConfig}
        layers={createLayers((position) => {
          recordedPositions.push(position);
        })}
      />,
    );

    expect(recordedPositions).toHaveLength(0);
  });

  it("emits onPositionChange exactly once when pointer moves", async () => {
    const recordedPositions: Array<{ x: number; y: number }> = [];
    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={createLayers((position) => {
          recordedPositions.push(position);
        })}
      />,
    );

    const draggableLayer = container.querySelector('[data-layer-id="layer-1"]');
    if (!draggableLayer) {
      throw new Error("Expected draggable layer to be rendered");
    }

    await act(async () => {
      fireEvent.pointerDown(draggableLayer, { clientX: 0, clientY: 0 });
    });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 20, clientY: 12, bubbles: true }));
    });

    expect(recordedPositions).toHaveLength(1);
    expect(recordedPositions[0]).toEqual({ x: 20, y: 12 });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true }));
    });
  });

  it("defaults gridArea from layer id when omitted", () => {
    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={[
          {
            id: "sidebar",
            component: <div data-testid="sidebar" />,
          },
          {
            id: "main",
            component: <div data-testid="main" />,
          },
        ]}
      />,
    );

    const sidebarLayer = container.querySelector('[data-layer-id="sidebar"]') as HTMLElement | null;
    const mainLayer = container.querySelector('[data-layer-id="main"]') as HTMLElement | null;

    if (!sidebarLayer || !mainLayer) {
      throw new Error("Expected both grid layers to be rendered");
    }

    expect(sidebarLayer.style.gridArea).toBe("sidebar");
    expect(sidebarLayer.style.gridRow).toBe("1 / 2");
    expect(sidebarLayer.style.gridColumn).toBe("1 / 2");
    expect(mainLayer.style.gridArea).toBe("main");
    expect(mainLayer.style.gridRow).toBe("1 / 2");
    expect(mainLayer.style.gridColumn).toBe("2 / 3");
  });

  it("maps multi-cell areas to grid row and column spans", () => {
    const complexConfig: PanelLayoutConfig = {
      areas: [
        ["header", "header", "header"],
        ["sidebar", "content", "content"],
        ["sidebar", "content", "content"],
      ],
      rows: [
        { size: "60px" },
        { size: "1fr" },
        { size: "1fr" },
      ],
      columns: [
        { size: "200px" },
        { size: "1fr" },
        { size: "1fr" },
      ],
      gap: "8px",
    };

    const { container } = render(
      <GridLayout
        config={complexConfig}
        layers={[
          { id: "header", component: <div data-testid="header" /> },
          { id: "sidebar", component: <div data-testid="sidebar" /> },
          { id: "content", component: <div data-testid="content" /> },
        ]}
      />,
    );

    const headerLayer = container.querySelector('[data-layer-id="header"]') as HTMLElement | null;
    const sidebarLayer = container.querySelector('[data-layer-id="sidebar"]') as HTMLElement | null;
    const contentLayer = container.querySelector('[data-layer-id="content"]') as HTMLElement | null;

    if (!headerLayer || !sidebarLayer || !contentLayer) {
      throw new Error("Expected all grid layers to be rendered");
    }

    expect(headerLayer.style.gridRow).toBe("1 / 2");
    expect(headerLayer.style.gridColumn).toBe("1 / 4");
    expect(sidebarLayer.style.gridRow).toBe("2 / 4");
    expect(sidebarLayer.style.gridColumn).toBe("1 / 2");
    expect(contentLayer.style.gridRow).toBe("2 / 4");
    expect(contentLayer.style.gridColumn).toBe("2 / 4");
  });

});
