/**
 * @file InteractionsContext integration tests
 */
/* eslint-disable no-restricted-imports, no-restricted-properties, no-restricted-syntax -- integration test requires vitest APIs for timer/pointer mocks */
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as React from "react";
import { InteractionsProvider, usePanelInteractions } from "./InteractionsContext";
import { DomRegistryProvider, useDomRegistry } from "../dom/DomRegistry";

// Mock components to test interactions
const TestComponent = () => {
    const { onStartContentDrag, dragPointer, suggest } = usePanelInteractions();
    const { setGroupEl, setContentEl } = useDomRegistry();

    const groupRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (groupRef.current) {
            setGroupEl("group-1", groupRef.current);
        }
        if (contentRef.current) {
            setContentEl("group-1", contentRef.current);
        }
        return () => {
            setGroupEl("group-1", null);
            setContentEl("group-1", null);
        };
    }, [setGroupEl, setContentEl]);

    return (
        <div
            data-testid="container"
            style={{ width: 800, height: 600, position: "relative" }}
        >
            <div
                ref={groupRef}
                data-testid="group"
                style={{
                    position: "absolute",
                    left: 100,
                    top: 100,
                    width: 200,
                    height: 200,
                    background: "red",
                }}
            >
                <div
                    ref={contentRef}
                    data-testid="content"
                    style={{ width: "100%", height: "100%" }}
                    onPointerDown={(e) => onStartContentDrag("group-1", "tab-1", e)}
                >
                    Content
                </div>
            </div>
            {dragPointer ? <div data-testid="drag-pointer">Dragging</div> : null}
            {suggest ? <div data-testid="suggest">Suggest: {suggest.zone}</div> : null}
        </div>
    );
};

const noopContentDrop = (): void => {
    // no-op fake
};
const noopTabDrop = (): void => {
    // no-op fake
};

const Wrapper = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    return (
        <DomRegistryProvider>
            <div ref={containerRef}>
                <InteractionsProvider
                    containerRef={containerRef}
                    dragThresholdPx={5}
                    onCommitContentDrop={noopContentDrop}
                    onCommitTabDrop={noopTabDrop}
                >
                    <TestComponent />
                </InteractionsProvider>
            </div>
        </DomRegistryProvider>
    );
};

// Tab drag test component
const TabDragTestComponent = () => {
    const { onStartTabDrag, dragPointer, suggest, isTabDragging } = usePanelInteractions();
    const { setGroupEl, setContentEl, setTabbarEl } = useDomRegistry();

    const groupRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const tabbarRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (groupRef.current) {
            setGroupEl("group-1", groupRef.current);
        }
        if (contentRef.current) {
            setContentEl("group-1", contentRef.current);
        }
        if (tabbarRef.current) {
            setTabbarEl("group-1", tabbarRef.current);
        }
        return () => {
            setGroupEl("group-1", null);
            setContentEl("group-1", null);
            setTabbarEl("group-1", null);
        };
    }, [setGroupEl, setContentEl, setTabbarEl]);

    return (
        <div
            data-testid="container"
            style={{ width: 800, height: 600, position: "relative" }}
        >
            <div
                ref={groupRef}
                data-testid="group"
                style={{
                    position: "absolute",
                    left: 100,
                    top: 100,
                    width: 200,
                    height: 200,
                    background: "red",
                }}
            >
                <div
                    ref={tabbarRef}
                    data-testid="tabbar"
                    role="tablist"
                    style={{ width: "100%", height: 30 }}
                >
                    <button
                        role="tab"
                        data-testid="tab"
                        style={{ width: 80, height: 30 }}
                        onPointerDown={(e) => onStartTabDrag("tab-1", "group-1", e)}
                    >
                        Tab 1
                    </button>
                </div>
                <div
                    ref={contentRef}
                    data-testid="content"
                    style={{ width: "100%", height: 170 }}
                >
                    Content
                </div>
            </div>
            {isTabDragging ? <div data-testid="is-tab-dragging">isTabDragging</div> : null}
            {dragPointer ? <div data-testid="drag-pointer">Dragging</div> : null}
            {suggest ? <div data-testid="suggest">Suggest: {suggest.zone}</div> : null}
        </div>
    );
};

const TabDragWrapper = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    return (
        <DomRegistryProvider>
            <div ref={containerRef}>
                <InteractionsProvider
                    containerRef={containerRef}
                    dragThresholdPx={5}
                    onCommitContentDrop={noopContentDrop}
                    onCommitTabDrop={noopTabDrop}
                >
                    <TabDragTestComponent />
                </InteractionsProvider>
            </div>
        </DomRegistryProvider>
    );
};

describe("InteractionsContext", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Mock pointer capture methods which are not available in JSDOM
        Element.prototype.setPointerCapture = vi.fn();
        Element.prototype.releasePointerCapture = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should NOT show suggest when tab drag has not exceeded threshold", () => {
        render(<TabDragWrapper />);

        const tab = screen.getByTestId("tab");

        // Mock getBoundingClientRect
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            right: 300,
            bottom: 300,
            x: 100,
            y: 100,
            toJSON: () => { },
        });

        // Start tab drag (pointerDown)
        fireEvent.pointerDown(tab, { clientX: 150, clientY: 115, button: 0, pointerId: 1 });

        // Move within threshold (less than 5px)
        act(() => {
            const moveEvent = new Event("pointermove");
            Object.assign(moveEvent, { clientX: 152, clientY: 117 });
            window.dispatchEvent(moveEvent);
        });

        // suggest should NOT be visible because we haven't exceeded threshold
        expect(screen.queryByTestId("suggest")).not.toBeInTheDocument();
        // dragPointer should NOT be visible
        expect(screen.queryByTestId("drag-pointer")).not.toBeInTheDocument();
    });

    it("should show suggest when tab drag exceeds threshold", () => {
        render(<TabDragWrapper />);

        const tab = screen.getByTestId("tab");

        // Mock getBoundingClientRect
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            right: 300,
            bottom: 300,
            x: 100,
            y: 100,
            toJSON: () => { },
        });

        // Start tab drag (pointerDown)
        fireEvent.pointerDown(tab, { clientX: 150, clientY: 115, button: 0, pointerId: 1 });

        // Move past threshold (more than 5px)
        act(() => {
            const moveEvent = new Event("pointermove");
            Object.assign(moveEvent, { clientX: 160, clientY: 160 });
            window.dispatchEvent(moveEvent);
        });

        // suggest should be visible because we exceeded threshold
        expect(screen.getByTestId("suggest")).toBeInTheDocument();
        expect(screen.getByTestId("drag-pointer")).toBeInTheDocument();
    });

    it("should start drag and update pointer", () => {
        render(<Wrapper />);

        const content = screen.getByTestId("content");

        // Mock getBoundingClientRect
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            right: 300,
            bottom: 300,
            x: 100,
            y: 100,
            toJSON: () => { },
        });

        // Start drag
        fireEvent.pointerDown(content, { clientX: 150, clientY: 150, button: 0, pointerId: 1 });

        // Move past threshold
        act(() => {
            const moveEvent = new Event("pointermove");
            Object.assign(moveEvent, { clientX: 160, clientY: 160 });
            window.dispatchEvent(moveEvent);
        });

        expect(screen.getByTestId("drag-pointer")).toBeInTheDocument();
    });

    it("should reset on pointer cancel", () => {
        render(<Wrapper />);

        const content = screen.getByTestId("content");

        // Mock getBoundingClientRect
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            right: 300,
            bottom: 300,
            x: 100,
            y: 100,
            toJSON: () => { },
        });

        // Start drag
        fireEvent.pointerDown(content, { clientX: 150, clientY: 150, button: 0, pointerId: 1 });

        // Move past threshold
        act(() => {
            const moveEvent = new Event("pointermove");
            Object.assign(moveEvent, { clientX: 160, clientY: 160 });
            window.dispatchEvent(moveEvent);
        });

        expect(screen.getByTestId("drag-pointer")).toBeInTheDocument();

        // Cancel drag
        act(() => {
            const cancelEvent = new Event("pointercancel");
            window.dispatchEvent(cancelEvent);
        });

        expect(screen.queryByTestId("drag-pointer")).not.toBeInTheDocument();
    });
});
