/**
 * @file ContentRegistry tests - state persistence across tab switch, panel move, and split
 */
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { ContentRegistryProvider, useContentRegistry } from "./ContentRegistry";
import type { TabDefinition, PanelId, GroupId } from "../state/types";

// Counter component that maintains state
const CounterContent: React.FC<{ id: string }> = ({ id }) => {
  const [count, setCount] = React.useState(0);
  return (
    <div data-testid={`content-${id}`}>
      <span data-testid={`count-${id}`}>{count}</span>
      <button data-testid={`increment-${id}`} onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
};

// Test harness that simulates GroupContainer behavior
const GroupContent: React.FC<{ groupId: GroupId }> = ({ groupId }) => {
  const { registerContentContainer } = useContentRegistry();
  const ref = React.useCallback(
    (el: HTMLDivElement | null) => {
      registerContentContainer(groupId, el);
    },
    [groupId, registerContentContainer],
  );
  return <div ref={ref} data-testid={`container-${groupId}`} style={{ width: 100, height: 100 }} />;
};

type TestState = {
  panels: Record<PanelId, TabDefinition>;
  placements: Record<PanelId, { groupId: GroupId; isActive: boolean }>;
  groupIds: GroupId[];
};

const TestHarness: React.FC<{ state: TestState }> = ({ state }) => {
  return (
    <ContentRegistryProvider panels={state.panels} placements={state.placements}>
      {state.groupIds.map((gid) => (
        <GroupContent key={gid} groupId={gid} />
      ))}
    </ContentRegistryProvider>
  );
};

describe("ContentRegistry", () => {
  const defaultRect = {
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
  const originalPointerCapture = Element.prototype.setPointerCapture;
  const originalReleasePointerCapture = Element.prototype.releasePointerCapture;
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  const createPanel = (id: string): TabDefinition => ({
    id,
    title: `Panel ${id}`,
    render: (panelId) => <CounterContent key={panelId} id={panelId} />,
  });

  beforeEach(() => {
    // Mock ResizeObserver (polyfill provided in vitest.setup.ts)

    // Mock pointer capture methods
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = () => defaultRect;
  });

  afterEach(() => {
    // Clean up any portal containers
    document.querySelectorAll("[data-panel-content-root]").forEach((el) => el.remove());
    Element.prototype.setPointerCapture = originalPointerCapture;
    Element.prototype.releasePointerCapture = originalReleasePointerCapture;
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should render content inside the registered container element", () => {
    const panels = {
      "panel-1": createPanel("panel-1"),
    };

    const state: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
      },
      groupIds: ["group-1"],
    };

    render(<TestHarness state={state} />);

    // The content should be rendered
    const content = screen.getByTestId("content-panel-1");
    expect(content).toBeInTheDocument();

    // The container element should exist
    const container = screen.getByTestId("container-group-1");
    expect(container).toBeInTheDocument();

    // Content should be inside the container (not in a separate portal overlay)
    expect(container.contains(content)).toBe(true);
  });

  it("should preserve state when switching tabs", async () => {
    const panels = {
      "panel-1": createPanel("panel-1"),
      "panel-2": createPanel("panel-2"),
    };

    const initialState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
        "panel-2": { groupId: "group-1", isActive: false },
      },
      groupIds: ["group-1"],
    };

    const { rerender } = render(<TestHarness state={initialState} />);

    // Increment panel-1's counter
    const incrementBtn = screen.getByTestId("increment-panel-1");
    fireEvent.click(incrementBtn);
    expect(screen.getByTestId("count-panel-1").textContent).toBe("1");

    // Switch to panel-2 (make it active, panel-1 inactive)
    const switchedState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: false },
        "panel-2": { groupId: "group-1", isActive: true },
      },
      groupIds: ["group-1"],
    };
    rerender(<TestHarness state={switchedState} />);

    // Switch back to panel-1
    rerender(<TestHarness state={initialState} />);

    // panel-1's counter should still be 1
    expect(screen.getByTestId("count-panel-1").textContent).toBe("1");
  });

  it("should preserve state when moving panel to another group", async () => {
    const panels = {
      "panel-1": createPanel("panel-1"),
    };

    const initialState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
      },
      groupIds: ["group-1"],
    };

    const { rerender } = render(<TestHarness state={initialState} />);

    // Increment counter
    fireEvent.click(screen.getByTestId("increment-panel-1"));
    fireEvent.click(screen.getByTestId("increment-panel-1"));
    expect(screen.getByTestId("count-panel-1").textContent).toBe("2");

    // Move panel to group-2 (new group is created at the same time)
    const movedState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-2", isActive: true },
      },
      groupIds: ["group-1", "group-2"],
    };
    rerender(<TestHarness state={movedState} />);

    // Counter should still be 2
    expect(screen.getByTestId("count-panel-1").textContent).toBe("2");
  });

  it("should preserve state when splitting panel (adding new group)", async () => {
    const panels = {
      "panel-1": createPanel("panel-1"),
      "panel-2": createPanel("panel-2"),
    };

    // Initial: both panels in group-1
    const initialState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
        "panel-2": { groupId: "group-1", isActive: false },
      },
      groupIds: ["group-1"],
    };

    const { rerender } = render(<TestHarness state={initialState} />);

    // Increment panel-1's counter to 3
    fireEvent.click(screen.getByTestId("increment-panel-1"));
    fireEvent.click(screen.getByTestId("increment-panel-1"));
    fireEvent.click(screen.getByTestId("increment-panel-1"));
    expect(screen.getByTestId("count-panel-1").textContent).toBe("3");

    // Split: panel-2 moves to new group-2
    const splitState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
        "panel-2": { groupId: "group-2", isActive: true },
      },
      groupIds: ["group-1", "group-2"],
    };
    rerender(<TestHarness state={splitState} />);

    // panel-1's counter should still be 3
    expect(screen.getByTestId("count-panel-1").textContent).toBe("3");
  });

  it("should handle multiple panels in same group without wrapper conflicts", () => {
    const panels = {
      "panel-1": createPanel("panel-1"),
      "panel-2": createPanel("panel-2"),
      "panel-3": createPanel("panel-3"),
    };

    const state: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
        "panel-2": { groupId: "group-1", isActive: false },
        "panel-3": { groupId: "group-1", isActive: false },
      },
      groupIds: ["group-1"],
    };

    render(<TestHarness state={state} />);

    const container = screen.getByTestId("container-group-1");

    // All panel wrappers should be inside the container
    const wrappers = container.querySelectorAll("[data-panel-wrapper]");
    expect(wrappers.length).toBe(3);

    // Each wrapper should have unique panel id
    const wrapperIds = Array.from(wrappers).map((w) => w.getAttribute("data-panel-wrapper"));
    expect(wrapperIds).toContain("panel-1");
    expect(wrapperIds).toContain("panel-2");
    expect(wrapperIds).toContain("panel-3");

    // Active panel content should be visible
    expect(screen.getByTestId("content-panel-1")).toBeVisible();
  });

  it("should not have wrapper nesting issues when panels move between groups", () => {
    const panels = {
      "panel-1": createPanel("panel-1"),
      "panel-2": createPanel("panel-2"),
    };

    const initialState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
        "panel-2": { groupId: "group-1", isActive: false },
      },
      groupIds: ["group-1", "group-2"],
    };

    const { rerender } = render(<TestHarness state={initialState} />);

    // Initially both panels in group-1
    const container1 = screen.getByTestId("container-group-1");
    expect(container1.querySelectorAll("[data-panel-wrapper]").length).toBe(2);

    // Move panel-2 to group-2
    const movedState: TestState = {
      panels,
      placements: {
        "panel-1": { groupId: "group-1", isActive: true },
        "panel-2": { groupId: "group-2", isActive: true },
      },
      groupIds: ["group-1", "group-2"],
    };
    rerender(<TestHarness state={movedState} />);

    // Now each group should have exactly one wrapper
    const container1After = screen.getByTestId("container-group-1");
    const container2 = screen.getByTestId("container-group-2");

    expect(container1After.querySelectorAll("[data-panel-wrapper]").length).toBe(1);
    expect(container2.querySelectorAll("[data-panel-wrapper]").length).toBe(1);

    // Wrappers should not be nested inside each other
    const allWrappers = document.querySelectorAll("[data-panel-wrapper]");
    allWrappers.forEach((wrapper) => {
      const nestedWrappers = wrapper.querySelectorAll("[data-panel-wrapper]");
      expect(nestedWrappers.length).toBe(0);
    });
  });
});
