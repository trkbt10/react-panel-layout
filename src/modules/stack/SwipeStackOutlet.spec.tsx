/**
 * @file Tests for SwipeStackOutlet component.
 */
import { render } from "@testing-library/react";
import { SwipeStackOutlet } from "./SwipeStackOutlet.js";
import type { ContinuousOperationState } from "../../hooks/gesture/types.js";
import type { StackPanel, StackNavigationState } from "./types.js";

const IDLE_STATE: ContinuousOperationState = {
  phase: "idle",
  displacement: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
};

const createOperatingState = (displacementX: number): ContinuousOperationState => ({
  phase: "operating",
  displacement: { x: displacementX, y: 0 },
  velocity: { x: 0.5, y: 0 },
});

const createPanels = (): StackPanel[] => [
  { id: "home", title: "Home", content: <div>Home Content</div> },
  { id: "list", title: "List", content: <div>List Content</div> },
  { id: "detail", title: "Detail", content: <div>Detail Content</div> },
];

describe("SwipeStackOutlet", () => {
  describe("rendering", () => {
    it("renders container with correct attributes", () => {
      const navigationState: StackNavigationState = {
        stack: ["home"],
        depth: 0,
        isRevealing: false,
        revealDepth: null,
      };

      const { container } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
        />,
      );

      const stackContainer = container.querySelector("[data-swipe-stack-container]");
      expect(stackContainer).toBeInTheDocument();
    });

    it("renders only active panel at root depth", () => {
      const navigationState: StackNavigationState = {
        stack: ["home"],
        depth: 0,
        isRevealing: false,
        revealDepth: null,
      };

      const { container, getByText } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
        />,
      );

      expect(getByText("Home Content")).toBeInTheDocument();

      // Should only have one SwipeStackContent
      const stackContents = container.querySelectorAll("[data-stack-content]");
      expect(stackContents).toHaveLength(1);
    });

    it("renders active and behind panels when depth > 0", () => {
      const navigationState: StackNavigationState = {
        stack: ["home", "list"],
        depth: 1,
        isRevealing: false,
        revealDepth: null,
      };

      const { container, getByText } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
        />,
      );

      expect(getByText("Home Content")).toBeInTheDocument();
      expect(getByText("List Content")).toBeInTheDocument();

      const stackContents = container.querySelectorAll("[data-stack-content]");
      expect(stackContents).toHaveLength(2);
    });

    it("assigns correct roles to panels", () => {
      const navigationState: StackNavigationState = {
        stack: ["home", "list"],
        depth: 1,
        isRevealing: false,
        revealDepth: null,
      };

      const { container } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
        />,
      );

      const homePanel = container.querySelector('[data-stack-content="home"]');
      const listPanel = container.querySelector('[data-stack-content="list"]');

      expect(homePanel?.getAttribute("data-role")).toBe("behind");
      expect(listPanel?.getAttribute("data-role")).toBe("active");
    });
  });

  describe("swipe behavior", () => {
    it("passes input state to panels during swipe", () => {
      const navigationState: StackNavigationState = {
        stack: ["home", "list"],
        depth: 1,
        isRevealing: false,
        revealDepth: null,
      };

      const swipeState = createOperatingState(200);

      const { container, rerender } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
        />,
      );

      // Start swiping
      rerender(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={swipeState}
          containerSize={400}
        />,
      );

      const listPanel = container.querySelector('[data-stack-content="list"]') as HTMLElement;
      const homePanel = container.querySelector('[data-stack-content="home"]') as HTMLElement;

      // Active panel should be at displacement position
      expect(listPanel.style.transform).toBe("translateX(200px)");

      // Behind panel should be at parallax position (-60px, halfway from -120 to 0)
      expect(homePanel.style.transform).toBe("translateX(-60px)");
    });
  });

  describe("cached content", () => {
    it("uses getCachedContent when provided", () => {
      const navigationState: StackNavigationState = {
        stack: ["home"],
        depth: 0,
        isRevealing: false,
        revealDepth: null,
      };

      const calledWith: string[] = [];
      const getCachedContent = (panelId: string): React.ReactNode => {
        calledWith.push(panelId);
        if (panelId === "home") {
          return <div>Cached Home Content</div>;
        }
        return null;
      };

      const { getByText, queryByText } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
          getCachedContent={getCachedContent}
        />,
      );

      expect(getByText("Cached Home Content")).toBeInTheDocument();
      expect(queryByText("Home Content")).not.toBeInTheDocument();
      expect(calledWith).toContain("home");
    });

    it("falls back to panel content when getCachedContent returns null", () => {
      const navigationState: StackNavigationState = {
        stack: ["home"],
        depth: 0,
        isRevealing: false,
        revealDepth: null,
      };

      const getCachedContent = (): React.ReactNode => null;

      const { getByText } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
          getCachedContent={getCachedContent}
        />,
      );

      expect(getByText("Home Content")).toBeInTheDocument();
    });
  });

  describe("deep navigation", () => {
    it("only renders active and behind panels, not deeper ones", () => {
      const navigationState: StackNavigationState = {
        stack: ["home", "list", "detail"],
        depth: 2,
        isRevealing: false,
        revealDepth: null,
      };

      const { container, getByText, queryByText } = render(
        <SwipeStackOutlet
          panels={createPanels()}
          navigationState={navigationState}
          operationState={IDLE_STATE}
          containerSize={400}
        />,
      );

      // Should render detail (active) and list (behind)
      expect(getByText("Detail Content")).toBeInTheDocument();
      expect(getByText("List Content")).toBeInTheDocument();

      // Should NOT render home (too deep)
      expect(queryByText("Home Content")).not.toBeInTheDocument();

      const stackContents = container.querySelectorAll("[data-stack-content]");
      expect(stackContents).toHaveLength(2);
    });
  });
});
