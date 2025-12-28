/**
 * @file Tests for drawerStyles utilities.
 */
import {
  getPlacementStyle,
  getOpenTransform,
  getClosedTransform,
  computeTransitionValue,
  computeBackdropTransition,
  isHorizontalPlacement,
  formatDimension,
  computeEdgeZoneStyle,
} from "./drawerStyles.js";

describe("drawerStyles", () => {
  describe("getPlacementStyle", () => {
    it("returns correct style for left placement", () => {
      const style = getPlacementStyle("left");
      expect(style.left).toBe(0);
      expect(style.top).toBe(0);
      expect(style.bottom).toBe(0);
      expect(style.transform).toBe("translateX(-100%)");
    });

    it("returns correct style for right placement", () => {
      const style = getPlacementStyle("right");
      expect(style.right).toBe(0);
      expect(style.top).toBe(0);
      expect(style.bottom).toBe(0);
      expect(style.transform).toBe("translateX(100%)");
    });

    it("returns correct style for top placement", () => {
      const style = getPlacementStyle("top");
      expect(style.top).toBe(0);
      expect(style.left).toBe(0);
      expect(style.right).toBe(0);
      expect(style.transform).toBe("translateY(-100%)");
    });

    it("returns correct style for bottom placement", () => {
      const style = getPlacementStyle("bottom");
      expect(style.bottom).toBe(0);
      expect(style.left).toBe(0);
      expect(style.right).toBe(0);
      expect(style.transform).toBe("translateY(100%)");
    });
  });

  describe("getOpenTransform", () => {
    it("returns translateX(0) for horizontal placements", () => {
      expect(getOpenTransform("left")).toBe("translateX(0)");
      expect(getOpenTransform("right")).toBe("translateX(0)");
    });

    it("returns translateY(0) for vertical placements", () => {
      expect(getOpenTransform("top")).toBe("translateY(0)");
      expect(getOpenTransform("bottom")).toBe("translateY(0)");
    });
  });

  describe("getClosedTransform", () => {
    it("returns correct closed transform for each placement", () => {
      expect(getClosedTransform("left")).toBe("translateX(-100%)");
      expect(getClosedTransform("right")).toBe("translateX(100%)");
      expect(getClosedTransform("top")).toBe("translateY(-100%)");
      expect(getClosedTransform("bottom")).toBe("translateY(100%)");
    });
  });

  describe("computeTransitionValue", () => {
    it("returns undefined when mode is none", () => {
      expect(computeTransitionValue("none", undefined, undefined)).toBeUndefined();
    });

    it("returns transition with defaults when no values provided", () => {
      const result = computeTransitionValue(undefined, undefined, undefined);
      expect(result).toContain("transform");
    });

    it("uses provided duration and easing", () => {
      const result = computeTransitionValue("css", "300ms", "ease-in-out");
      expect(result).toBe("transform 300ms ease-in-out");
    });
  });

  describe("computeBackdropTransition", () => {
    it("returns undefined when mode is none", () => {
      expect(computeBackdropTransition("none", undefined)).toBeUndefined();
    });

    it("returns opacity transition with defaults", () => {
      const result = computeBackdropTransition(undefined, undefined);
      expect(result).toContain("opacity");
      expect(result).toContain("220ms");
    });

    it("uses provided duration", () => {
      const result = computeBackdropTransition("css", "400ms");
      expect(result).toBe("opacity 400ms ease");
    });
  });

  describe("isHorizontalPlacement", () => {
    it("returns true for left and right", () => {
      expect(isHorizontalPlacement("left")).toBe(true);
      expect(isHorizontalPlacement("right")).toBe(true);
    });

    it("returns false for top and bottom", () => {
      expect(isHorizontalPlacement("top")).toBe(false);
      expect(isHorizontalPlacement("bottom")).toBe(false);
    });
  });

  describe("formatDimension", () => {
    it("returns undefined for undefined input", () => {
      expect(formatDimension(undefined)).toBeUndefined();
    });

    it("returns number with px suffix", () => {
      expect(formatDimension(100)).toBe("100px");
      expect(formatDimension(0)).toBe("0px");
    });

    it("returns string as-is", () => {
      expect(formatDimension("50%")).toBe("50%");
      expect(formatDimension("auto")).toBe("auto");
    });
  });

  describe("computeEdgeZoneStyle", () => {
    describe("positioning context", () => {
      it("uses fixed positioning when inline is false", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: false,
          edgeWidth: 20,
          zIndex: 1000,
        });
        expect(style.position).toBe("fixed");
      });

      it("uses absolute positioning when inline is true", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: true,
          edgeWidth: 20,
          zIndex: 1000,
        });
        expect(style.position).toBe("absolute");
      });
    });

    describe("left placement", () => {
      it("positions at left edge with correct dimensions", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: false,
          edgeWidth: 20,
          zIndex: 1000,
        });
        expect(style.left).toBe(0);
        expect(style.top).toBe(0);
        expect(style.bottom).toBe(0);
        expect(style.width).toBe(20);
        expect(style.right).toBeUndefined();
      });
    });

    describe("right placement", () => {
      it("positions at right edge with correct dimensions", () => {
        const style = computeEdgeZoneStyle({
          placement: "right",
          inline: false,
          edgeWidth: 30,
          zIndex: 2000,
        });
        expect(style.right).toBe(0);
        expect(style.top).toBe(0);
        expect(style.bottom).toBe(0);
        expect(style.width).toBe(30);
        expect(style.left).toBeUndefined();
      });
    });

    describe("top placement", () => {
      it("positions at top edge with correct dimensions", () => {
        const style = computeEdgeZoneStyle({
          placement: "top",
          inline: false,
          edgeWidth: 25,
          zIndex: 1000,
        });
        expect(style.top).toBe(0);
        expect(style.left).toBe(0);
        expect(style.right).toBe(0);
        expect(style.height).toBe(25);
        expect(style.bottom).toBeUndefined();
      });
    });

    describe("bottom placement", () => {
      it("positions at bottom edge with correct dimensions", () => {
        const style = computeEdgeZoneStyle({
          placement: "bottom",
          inline: false,
          edgeWidth: 40,
          zIndex: 1000,
        });
        expect(style.bottom).toBe(0);
        expect(style.left).toBe(0);
        expect(style.right).toBe(0);
        expect(style.height).toBe(40);
        expect(style.top).toBeUndefined();
      });
    });

    describe("zIndex handling", () => {
      it("sets zIndex to provided value minus 2", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: false,
          edgeWidth: 20,
          zIndex: 1000,
        });
        expect(style.zIndex).toBe(998);
      });

      it("uses default zIndex of 1000 when zIndex is undefined", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: false,
          edgeWidth: 20,
          zIndex: undefined,
        });
        expect(style.zIndex).toBe(1000);
      });
    });

    describe("common properties", () => {
      it("has transparent background", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: false,
          edgeWidth: 20,
          zIndex: 1000,
        });
        expect(style.background).toBe("transparent");
      });

      it("has pointer events enabled", () => {
        const style = computeEdgeZoneStyle({
          placement: "left",
          inline: false,
          edgeWidth: 20,
          zIndex: 1000,
        });
        expect(style.pointerEvents).toBe("auto");
      });
    });
  });
});
