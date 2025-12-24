import { describe, it, expect } from "vitest";
import { computeAnimatedPanels, type AnimatedPanel } from "./useStackAnimationState.js";

describe("computeAnimatedPanels", () => {
  describe("initial state", () => {
    it("should mark all panels as active when there is no previous stack", () => {
      const prevPanels: AnimatedPanel[] = [];
      const prevStack: string[] = [];
      const currentStack = ["root"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([{ id: "root", depth: 0, phase: "active" }]);
    });

    it("should handle multiple initial panels", () => {
      const prevPanels: AnimatedPanel[] = [];
      const prevStack: string[] = [];
      const currentStack = ["root", "general"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
      ]);
    });
  });

  describe("push operation", () => {
    it("should mark new panel as entering when pushed", () => {
      const prevPanels: AnimatedPanel[] = [{ id: "root", depth: 0, phase: "active" }];
      const prevStack = ["root"];
      const currentStack = ["root", "general"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "entering" },
      ]);
    });

    it("should mark deeply nested push as entering", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
      ];
      const prevStack = ["root", "general"];
      const currentStack = ["root", "general", "about"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
        { id: "about", depth: 2, phase: "entering" },
      ]);
    });
  });

  describe("pop operation", () => {
    it("should mark popped panel as exiting", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
      ];
      const prevStack = ["root", "general"];
      const currentStack = ["root"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "exiting" },
      ]);
    });

    it("should handle multiple panels popped at once", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
        { id: "about", depth: 2, phase: "active" },
      ];
      const prevStack = ["root", "general", "about"];
      const currentStack = ["root"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "exiting" },
        { id: "about", depth: 2, phase: "exiting" },
      ]);
    });

    it("should preserve depth for exiting panels", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
        { id: "about", depth: 2, phase: "active" },
        { id: "name", depth: 3, phase: "active" },
      ];
      const prevStack = ["root", "general", "about", "name"];
      const currentStack = ["root", "general"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toContainEqual({ id: "about", depth: 2, phase: "exiting" });
      expect(result).toContainEqual({ id: "name", depth: 3, phase: "exiting" });
    });
  });

  describe("exiting panel persistence", () => {
    it("should keep already exiting panels", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "exiting" },
      ];
      const prevStack = ["root"];
      const currentStack = ["root"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toContainEqual({ id: "general", depth: 1, phase: "exiting" });
    });

    it("should keep multiple exiting panels", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "exiting" },
        { id: "about", depth: 2, phase: "exiting" },
      ];
      const prevStack = ["root"];
      const currentStack = ["root"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toContainEqual({ id: "general", depth: 1, phase: "exiting" });
      expect(result).toContainEqual({ id: "about", depth: 2, phase: "exiting" });
    });
  });

  describe("entering panel transition", () => {
    it("should keep entering phase on subsequent renders", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "entering" },
      ];
      const prevStack = ["root", "general"];
      const currentStack = ["root", "general"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "entering" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty stacks", () => {
      const prevPanels: AnimatedPanel[] = [];
      const prevStack: string[] = [];
      const currentStack: string[] = [];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual([]);
    });

    it("should handle no change in stack", () => {
      const prevPanels: AnimatedPanel[] = [
        { id: "root", depth: 0, phase: "active" },
        { id: "general", depth: 1, phase: "active" },
      ];
      const prevStack = ["root", "general"];
      const currentStack = ["root", "general"];

      const result = computeAnimatedPanels(prevPanels, prevStack, currentStack);

      expect(result).toEqual(prevPanels);
    });
  });
});
