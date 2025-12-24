/**
 * @file Tests for ThresholdValue type and parsing utilities.
 *
 * ThresholdValue allows specifying thresholds in multiple formats:
 * - Object: { value: 50, unit: "px" } or { value: 0.25, unit: "ratio" }
 * - String shorthand: "50px" or "25%"
 */
import {
  parseThresholdValue,
  resolveThreshold,
  type ThresholdValue,
} from "./thresholdValue.js";

describe("parseThresholdValue", () => {
  describe("object format", () => {
    it("passes through px object unchanged", () => {
      const input: ThresholdValue = { value: 50, unit: "px" };
      expect(parseThresholdValue(input)).toEqual({ value: 50, unit: "px" });
    });

    it("passes through ratio object unchanged", () => {
      const input: ThresholdValue = { value: 0.25, unit: "ratio" };
      expect(parseThresholdValue(input)).toEqual({ value: 0.25, unit: "ratio" });
    });
  });

  describe("string format - px", () => {
    it("parses '50px' to px object", () => {
      expect(parseThresholdValue("50px")).toEqual({ value: 50, unit: "px" });
    });

    it("parses '100px' to px object", () => {
      expect(parseThresholdValue("100px")).toEqual({ value: 100, unit: "px" });
    });

    it("parses decimal '50.5px' to px object", () => {
      expect(parseThresholdValue("50.5px")).toEqual({ value: 50.5, unit: "px" });
    });

    it("handles whitespace '50 px'", () => {
      expect(parseThresholdValue("50 px")).toEqual({ value: 50, unit: "px" });
    });
  });

  describe("string format - percentage/ratio", () => {
    it("parses '25%' to ratio object (0.25)", () => {
      expect(parseThresholdValue("25%")).toEqual({ value: 0.25, unit: "ratio" });
    });

    it("parses '33%' to ratio object (0.33)", () => {
      expect(parseThresholdValue("33%")).toEqual({ value: 0.33, unit: "ratio" });
    });

    it("parses '50%' to ratio object (0.5)", () => {
      expect(parseThresholdValue("50%")).toEqual({ value: 0.5, unit: "ratio" });
    });

    it("parses decimal '33.33%' to ratio object", () => {
      expect(parseThresholdValue("33.33%")).toEqual({ value: 0.3333, unit: "ratio" });
    });
  });

  describe("invalid input", () => {
    it("throws on invalid string format", () => {
      expect(() => parseThresholdValue("invalid")).toThrow();
    });

    it("throws on empty string", () => {
      expect(() => parseThresholdValue("")).toThrow();
    });

    it("throws on number-only string", () => {
      expect(() => parseThresholdValue("50")).toThrow();
    });
  });
});

describe("resolveThreshold", () => {
  describe("px values", () => {
    it("returns px value directly regardless of containerSize", () => {
      const threshold: ThresholdValue = { value: 100, unit: "px" };
      expect(resolveThreshold(threshold, 400)).toBe(100);
      expect(resolveThreshold(threshold, 300)).toBe(100);
    });

    it("resolves string px format", () => {
      expect(resolveThreshold("100px", 400)).toBe(100);
    });
  });

  describe("ratio values", () => {
    it("calculates px from ratio and containerSize", () => {
      const threshold: ThresholdValue = { value: 0.25, unit: "ratio" };
      expect(resolveThreshold(threshold, 400)).toBe(100); // 400 * 0.25
      expect(resolveThreshold(threshold, 300)).toBe(75);  // 300 * 0.25
    });

    it("resolves string percentage format", () => {
      expect(resolveThreshold("25%", 400)).toBe(100);
      expect(resolveThreshold("50%", 400)).toBe(200);
    });
  });
});
