/**
 * @file Tests for GridLayout behaviour related to effects and drag handling.
 */
import * as React from "react";
import { render, cleanup, act, fireEvent } from "@testing-library/react";
import { GridLayout } from "./GridLayout";
import type { PanelLayoutConfig, LayerDefinition, WindowPosition, WindowSize } from "../../types";
import { useLayerDragHandle } from "../../modules/grid/useLayerDragHandle";

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

  const createLayers = (onMove?: (position: WindowPosition) => void): LayerDefinition[] => {
    return [
      {
        id: "sidebar",
        gridArea: "sidebar",
        component: <div data-testid="sidebar" />,
      },
      {
        id: "layer-1",
        gridArea: "main",
        component: (
          <div>
            <div data-testid="drag-handle" data-drag-handle="true" />
            <div data-testid="layer" />
          </div>
        ),
        position: { left: 0, top: 0 },
        width: 180,
        height: 180,
        floating: {
          draggable: true,
          onMove,
        },
      },
    ];
  };

  it("does not call onMove on initial render", () => {
    const recordedPositions: WindowPosition[] = [];

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

  it("emits onMove exactly once when pointer moves", async () => {
    const recordedPositions: WindowPosition[] = [];
    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={createLayers((position) => {
          recordedPositions.push(position);
        })}
      />,
    );

    const dragHandle = container.querySelector('[data-testid="drag-handle"]');
    if (!dragHandle) {
      throw new Error("Expected drag handle to be rendered");
    }

    await act(async () => {
      fireEvent.pointerDown(dragHandle, { clientX: 0, clientY: 0 });
    });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 20, clientY: 12, bubbles: true }));
    });

    expect(recordedPositions).toHaveLength(1);
    expect(recordedPositions[0]).toEqual({ left: 20, top: 12 });

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

  it("renders corner and edge resize handles for floating resizable layers", () => {
    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={[
          {
            id: "sidebar",
            gridArea: "sidebar",
            component: <div />,
          },
          {
            id: "floating",
            component: (
              <div>
                <div data-testid="drag-handle" data-drag-handle="true">
                  Title
                </div>
                <div>Content</div>
              </div>
            ),
            position: { left: 0, top: 0 },
            width: 200,
            height: 160,
            floating: {
              draggable: true,
              resizable: true,
            },
          },
        ]}
      />,
    );

    const cornerHandles = container.querySelectorAll('[data-resize-corner]');
    const edgeHandles = container.querySelectorAll('[data-resize-edge]');
    expect(cornerHandles).toHaveLength(4);
    expect(edgeHandles).toHaveLength(4);
  });

  it("requires drag gestures to originate from declared handles on floating layers", async () => {
    const recordedPositions: WindowPosition[] = [];
    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={[
          {
            id: "sidebar",
            gridArea: "sidebar",
            component: <div />,
          },
          {
            id: "floating",
            component: (
              <div>
                <div data-testid="drag-handle" data-drag-handle="true">
                  Title
                </div>
                <div data-testid="content">Content</div>
              </div>
            ),
            position: { left: 0, top: 0 },
            width: 200,
            height: 160,
            floating: {
              draggable: true,
              resizable: true,
              onMove: (position) => {
                recordedPositions.push(position);
              },
            },
          },
        ]}
      />,
    );

    const content = container.querySelector('[data-testid="content"]');
    if (!content) {
      throw new Error("Expected content element to be rendered");
    }

    await act(async () => {
      fireEvent.pointerDown(content, { clientX: 0, clientY: 0 });
    });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 25, clientY: 30, bubbles: true }));
    });

    expect(recordedPositions).toHaveLength(0);

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true }));
    });
  });

  it("supports drag handles provided via the context hook", async () => {
    const recordedPositions: WindowPosition[] = [];

    const HandleComponent: React.FC = () => {
      const handleProps = useLayerDragHandle();
      return (
        <div>
          <div data-testid="drag-handle" {...handleProps}>
            Header
          </div>
          <div data-testid="content">Content</div>
        </div>
      );
    };

    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={[
          {
            id: "sidebar",
            gridArea: "sidebar",
            component: <div />,
          },
          {
            id: "floating",
            component: <HandleComponent />,
            position: { left: 0, top: 0 },
            width: 200,
            height: 160,
            floating: {
              draggable: true,
              resizable: true,
              onMove: (position) => {
                recordedPositions.push(position);
              },
            },
          },
        ]}
      />,
    );

    const handle = container.querySelector('[data-testid="drag-handle"]');
    if (!handle) {
      throw new Error("Expected drag handle to be rendered");
    }

    await act(async () => {
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0, pointerId: 1 });
    });

    await act(async () => {
      document.dispatchEvent(
        new window.PointerEvent("pointermove", { clientX: 30, clientY: 45, bubbles: true, pointerId: 1 }),
      );
    });

    expect(recordedPositions).not.toHaveLength(0);

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
    });
  });

  it("resizes floating panels from the bottom-right handle", async () => {
    const recordedSizes: WindowSize[] = [];
    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={[
          {
            id: "sidebar",
            gridArea: "sidebar",
            component: <div />,
          },
          {
            id: "floating",
            component: (
              <div>
                <div data-drag-handle="true">Title</div>
                <div>Content</div>
              </div>
            ),
            position: { left: 0, top: 0 },
            width: 200,
            height: 160,
            floating: {
              draggable: true,
              resizable: true,
              onResize: (size) => {
                recordedSizes.push(size);
              },
            },
          },
        ]}
      />,
    );

    const resizeHandle = container.querySelector('[data-resize-corner="bottom-right"]');
    const layerElement = container.querySelector('[data-layer-id="floating"]') as HTMLElement | null;

    if (!resizeHandle || !layerElement) {
      throw new Error("Expected resizable layer and handle to be rendered");
    }

    await act(async () => {
      fireEvent.pointerDown(resizeHandle, { clientX: 200, clientY: 160 });
    });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 240, clientY: 210, bubbles: true }));
    });

    expect(layerElement.style.width).toBe("240px");
    expect(layerElement.style.height).toBe("210px");
    const lastRecordedSize = recordedSizes[recordedSizes.length - 1];
    expect(lastRecordedSize).toEqual({ width: 240, height: 210 });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true }));
    });
  });

  it("resizes floating panels from the left edge handle", async () => {
    const recordedPositions: WindowPosition[] = [];

    const { container } = render(
      <GridLayout
        config={baseConfig}
        layers={[
          {
            id: "sidebar",
            gridArea: "sidebar",
            component: <div />,
          },
          {
            id: "floating",
            component: (
              <div>
                <div data-drag-handle="true">Title</div>
                <div>Content</div>
              </div>
            ),
            position: { left: 0, top: 0 },
            width: 200,
            height: 160,
            floating: {
              draggable: true,
              resizable: true,
              onMove: (position) => {
                recordedPositions.push(position);
              },
            },
          },
        ]}
      />,
    );

    const resizeHandle = container.querySelector('[data-resize-edge="left"]');
    const layerElement = container.querySelector('[data-layer-id="floating"]') as HTMLElement | null;

    if (!resizeHandle || !layerElement) {
      throw new Error("Expected resizable layer and left edge handle to be rendered");
    }

    await act(async () => {
      fireEvent.pointerDown(resizeHandle, { clientX: 0, clientY: 80 });
    });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 40, clientY: 100, bubbles: true }));
    });

    expect(layerElement.style.width).toBe("160px");
    expect(layerElement.style.height).toBe("160px");
    expect(layerElement.style.transform).toBe("translate(40px, 0px)");
    expect(recordedPositions).not.toHaveLength(0);
    const lastRecordedPosition = recordedPositions[recordedPositions.length - 1];
    expect(lastRecordedPosition).toEqual({ left: 40, top: 0 });

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true }));
    });
  });

  it("opens floating layers in a popup window when configured", async () => {
    const state = {
      openCallCount: 0,
      capturedName: undefined as string | undefined,
      capturedFeatures: undefined as string | undefined,
      moveCalls: [] as Array<[number, number]>,
      resizeCalls: [] as Array<[number, number]>,
      focusCount: 0,
      closeCount: 0,
      removeEventListenerCalled: false,
      document: null as Document | null,
    };

    const registeredListeners = new Map<string, EventListenerOrEventListenerObject>();

    try {
      render(
        <GridLayout
          config={baseConfig}
          layers={[
            {
              id: "sidebar",
              gridArea: "sidebar",
              component: <div />,
            },
            {
              id: "popup-layer",
              component: <div>Popup Content</div>,
              position: { left: 120, top: 80 },
              width: 320,
              height: 260,
              floating: {
                mode: "popup",
                popup: {
                  name: "popup-layer",
                  createWindow: (config) => {
                    state.openCallCount += 1;
                    state.capturedName = config.name;
                    state.capturedFeatures = config.features;
                    const stubWindow = Object.create(window);
                    const popupDocument = document.implementation.createHTMLDocument(config.name);
                    stubWindow.document = popupDocument;
                    stubWindow.moveTo = (x: number, y: number) => {
                      state.moveCalls.push([x, y]);
                    };
                    stubWindow.resizeTo = (width: number, height: number) => {
                      state.resizeCalls.push([width, height]);
                    };
                    stubWindow.focus = () => {
                      state.focusCount += 1;
                    };
                    stubWindow.close = () => {
                      state.closeCount += 1;
                    };
                    stubWindow.addEventListener = (type: string, listener: EventListenerOrEventListenerObject) => {
                      registeredListeners.set(type, listener);
                    };
                    stubWindow.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject) => {
                      const registered = registeredListeners.get(type);
                      if (registered === listener) {
                        state.removeEventListenerCalled = true;
                        registeredListeners.delete(type);
                      }
                    };
                    state.document = popupDocument;
                    return stubWindow;
                  },
                },
              },
            },
          ]}
        />,
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(state.openCallCount).toBe(1);
      expect(state.capturedName).toBe("popup-layer");
      expect(state.capturedFeatures?.includes("left=120")).toBe(true);
      expect(state.capturedFeatures?.includes("top=80")).toBe(true);
      expect(state.capturedFeatures?.includes("width=320")).toBe(true);
      expect(state.capturedFeatures?.includes("height=260")).toBe(true);
      expect(state.moveCalls).toContainEqual([120, 80]);
      expect(state.resizeCalls).toContainEqual([320, 260]);
      expect(state.focusCount).toBe(1);
      const popupDoc = state.document;
      if (!popupDoc) {
        throw new Error("Popup document was not captured");
      }
      const popupContainer = popupDoc.body.querySelector('[data-layer-id="popup-layer"]');
      expect(popupContainer).not.toBeNull();
      expect(popupDoc.body.textContent).toContain("Popup Content");

      cleanup();
      expect(state.removeEventListenerCalled).toBe(true);
      expect(state.closeCount).toBe(1);
    } finally {
      registeredListeners.clear();
    }
  });

  it("wraps grid resize handles with directional metadata", () => {
    const resizableConfig: PanelLayoutConfig = {
      areas: [["left", "right"]],
      columns: [
        { size: "200px", resizable: true },
        { size: "1fr" },
      ],
      rows: [
        { size: "240px", resizable: true },
      ],
    };

    const { container } = render(
      <GridLayout
        config={resizableConfig}
        layers={[
          { id: "left", component: <div /> },
          { id: "right", component: <div /> },
        ]}
      />,
    );

    const handles = Array.from(container.querySelectorAll('[role="separator"]')) as HTMLElement[];
    expect(handles).toHaveLength(2);
    expect(handles.some((el) => el.getAttribute("aria-orientation") === "vertical")).toBe(true);
    expect(handles.some((el) => el.getAttribute("aria-orientation") === "horizontal")).toBe(true);
  });

  it("increases the width of the targeted column when dragging the vertical handle to the right", async () => {
    const resizableConfig: PanelLayoutConfig = {
      areas: [["left", "middle", "right"]],
      columns: [
        { size: "200px", resizable: true },
        { size: "1fr" },
        { size: "260px" },
      ],
      rows: [{ size: "1fr" }],
      gap: "0",
    };

    const { container } = render(
      <GridLayout
        config={resizableConfig}
        layers={[
          { id: "left", component: <div /> },
          { id: "middle", component: <div /> },
          { id: "right", component: <div /> },
        ]}
      />,
    );

    const gridElement = container.querySelector('[data-visible]') as HTMLElement | null;
    const handles = container.querySelectorAll('[role="separator"][aria-orientation="vertical"]');

    if (!gridElement || handles.length === 0) {
      throw new Error("Expected grid element and vertical handle to exist");
    }

    const firstHandle = handles[0] as HTMLElement;
    Object.assign(firstHandle, {
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
    });

    await act(async () => {
      firstHandle.dispatchEvent(
        new window.PointerEvent("pointerdown", { clientX: 0, clientY: 0, pointerId: 1, bubbles: true }),
      );
    });

    await act(async () => {
      document.dispatchEvent(
        new window.PointerEvent("pointermove", { clientX: 40, clientY: 0, bubbles: true, pointerId: 1 }),
      );
    });

    expect(gridElement.style.gridTemplateColumns).toBe("240px 1fr 260px");

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
    });
  });

  it("updates the width of the trailing column when dragging the second vertical handle to the left", async () => {
    const resizableConfig: PanelLayoutConfig = {
      areas: [["left", "middle", "right"]],
      columns: [
        { size: "250px" },
        { size: "1fr" },
        { size: "300px", resizable: true },
      ],
      rows: [{ size: "1fr" }],
      gap: "0",
    };

    const { container } = render(
      <GridLayout
        config={resizableConfig}
        layers={[
          { id: "left", component: <div /> },
          { id: "middle", component: <div /> },
          { id: "right", component: <div /> },
        ]}
      />,
    );

    const gridElement = container.querySelector('[data-visible]') as HTMLElement | null;
    const handles = container.querySelectorAll('[role="separator"][aria-orientation="vertical"]');

    if (!gridElement || handles.length < 1) {
      throw new Error("Expected grid element and vertical handles to exist");
    }

    const lastHandle = handles[handles.length - 1] as HTMLElement;
    Object.assign(lastHandle, {
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
    });

    await act(async () => {
      lastHandle.dispatchEvent(
        new window.PointerEvent("pointerdown", { clientX: 0, clientY: 0, pointerId: 2, bubbles: true }),
      );
    });

    await act(async () => {
      document.dispatchEvent(
        new window.PointerEvent("pointermove", { clientX: -40, clientY: 0, bubbles: true, pointerId: 2 }),
      );
    });

    expect(gridElement.style.gridTemplateColumns).toBe("250px 1fr 260px");

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, pointerId: 2 }));
    });
  });

  it("adjusts row heights when dragging a horizontal handle downward", async () => {
    const resizableConfig: PanelLayoutConfig = {
      areas: [["top"], ["bottom"]],
      columns: [{ size: "1fr" }],
      rows: [
        { size: "120px", resizable: true },
        { size: "1fr" },
      ],
      gap: "0",
    };

    const { container } = render(
      <GridLayout
        config={resizableConfig}
        layers={[
          { id: "top", component: <div /> },
          { id: "bottom", component: <div /> },
        ]}
      />,
    );

    const gridElement = container.querySelector('[data-visible]') as HTMLElement | null;
    const horizontalHandle = container.querySelector('[role="separator"][aria-orientation="horizontal"]') as HTMLElement | null;

    if (!gridElement || !horizontalHandle) {
      throw new Error("Expected grid element and horizontal handle to exist");
    }

    Object.assign(horizontalHandle, {
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
    });

    await act(async () => {
      horizontalHandle.dispatchEvent(
        new window.PointerEvent("pointerdown", { clientX: 0, clientY: 0, pointerId: 3, bubbles: true }),
      );
    });

    await act(async () => {
      document.dispatchEvent(
        new window.PointerEvent("pointermove", { clientX: 0, clientY: 30, bubbles: true, pointerId: 3 }),
      );
    });

    expect(gridElement.style.gridTemplateRows).toBe("150px 1fr");

    await act(async () => {
      document.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, pointerId: 3 }));
    });
  });

});
