/**
 * @file Tests for drawerSwipeConfig utilities.
 */
import {
  parseSwipeGesturesConfig,
  resolvePlacement,
  shouldShowEdgeZone,
} from "./drawerSwipeConfig.js";

describe("drawerSwipeConfig", () => {
  describe("parseSwipeGesturesConfig", () => {
    it("returns disabled config for false", () => {
      const config = parseSwipeGesturesConfig(false);
      expect(config.enabled).toBe(false);
      expect(config.edgeSwipeOpen).toBe(false);
      expect(config.swipeClose).toBe(false);
    });

    it("returns disabled config for undefined", () => {
      const config = parseSwipeGesturesConfig(undefined);
      expect(config.enabled).toBe(false);
    });

    it("returns enabled defaults for true", () => {
      const config = parseSwipeGesturesConfig(true);
      expect(config.enabled).toBe(true);
      expect(config.edgeSwipeOpen).toBe(true);
      expect(config.swipeClose).toBe(true);
      expect(config.edgeWidth).toBe(20);
      expect(config.dismissThreshold).toBe(0.3);
    });

    it("parses object config with defaults", () => {
      const config = parseSwipeGesturesConfig({});
      expect(config.enabled).toBe(true);
      expect(config.edgeSwipeOpen).toBe(true);
      expect(config.swipeClose).toBe(true);
    });

    it("respects object config overrides", () => {
      const config = parseSwipeGesturesConfig({
        edgeSwipeOpen: false,
        swipeClose: true,
        edgeWidth: 40,
        dismissThreshold: 0.5,
      });
      expect(config.enabled).toBe(true);
      expect(config.edgeSwipeOpen).toBe(false);
      expect(config.swipeClose).toBe(true);
      expect(config.edgeWidth).toBe(40);
      expect(config.dismissThreshold).toBe(0.5);
    });
  });

  describe("resolvePlacement", () => {
    it("returns anchor if provided", () => {
      expect(resolvePlacement("left", undefined)).toBe("left");
      expect(resolvePlacement("right", { left: 0 })).toBe("right");
    });

    it("returns right as default when no anchor or position", () => {
      expect(resolvePlacement(undefined, undefined)).toBe("right");
    });

    it("infers left from position.left", () => {
      expect(resolvePlacement(undefined, { left: 0 })).toBe("left");
    });

    it("infers right from position.right", () => {
      expect(resolvePlacement(undefined, { right: 0 })).toBe("right");
    });

    it("infers top from position.top", () => {
      expect(resolvePlacement(undefined, { top: 0 })).toBe("top");
    });

    it("infers bottom from position.bottom", () => {
      expect(resolvePlacement(undefined, { bottom: 0 })).toBe("bottom");
    });

    it("prioritizes left over other positions", () => {
      expect(resolvePlacement(undefined, { left: 0, right: 0 })).toBe("left");
    });
  });

  describe("shouldShowEdgeZone", () => {
    const enabledConfig = {
      enabled: true,
      edgeSwipeOpen: true,
      swipeClose: true,
      edgeWidth: 20,
      dismissThreshold: 0.3,
    };

    const disabledConfig = {
      enabled: false,
      edgeSwipeOpen: false,
      swipeClose: false,
      edgeWidth: 20,
      dismissThreshold: 0.3,
    };

    const noEdgeSwipeConfig = {
      enabled: true,
      edgeSwipeOpen: false,
      swipeClose: true,
      edgeWidth: 20,
      dismissThreshold: 0.3,
    };

    it("returns false when config is disabled", () => {
      expect(shouldShowEdgeZone(disabledConfig, false, false)).toBe(false);
    });

    it("returns false when edgeSwipeOpen is disabled", () => {
      expect(shouldShowEdgeZone(noEdgeSwipeConfig, false, false)).toBe(false);
    });

    it("returns true when drawer is closed", () => {
      expect(shouldShowEdgeZone(enabledConfig, false, false)).toBe(true);
    });

    it("returns true when actively opening", () => {
      expect(shouldShowEdgeZone(enabledConfig, true, true)).toBe(true);
    });

    it("returns false when drawer is open and not opening", () => {
      expect(shouldShowEdgeZone(enabledConfig, true, false)).toBe(false);
    });
  });
});
