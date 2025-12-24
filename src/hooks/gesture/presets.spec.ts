/**
 * @file Tests for swipe gesture presets.
 *
 * TDD: スワイプの閾値が過敏すぎるため、プラットフォーム固有のプリセットを提供する
 */
import {
  SWIPE_PRESETS,
  getSwipePreset,
} from "./presets.js";

describe("swipe gesture presets", () => {
  describe("SWIPE_PRESETS", () => {
    it("provides iOS preset with appropriate thresholds", () => {
      // iOS: 高速で滑らかなスワイプ、適度な閾値
      expect(SWIPE_PRESETS.ios).toBeDefined();
      expect(SWIPE_PRESETS.ios.distanceThreshold).toBeGreaterThanOrEqual(50);
      expect(SWIPE_PRESETS.ios.velocityThreshold).toBeGreaterThanOrEqual(0.3);
      expect(SWIPE_PRESETS.ios.lockThreshold).toBeDefined();
    });

    it("provides Android preset with appropriate thresholds", () => {
      // Android: より寛容な閾値（多様なデバイスに対応）
      expect(SWIPE_PRESETS.android).toBeDefined();
      expect(SWIPE_PRESETS.android.distanceThreshold).toBeGreaterThanOrEqual(60);
      expect(SWIPE_PRESETS.android.velocityThreshold).toBeGreaterThanOrEqual(0.25);
    });

    it("provides desktop preset with larger thresholds", () => {
      // デスクトップ: マウス操作のため、より大きな閾値が必要
      expect(SWIPE_PRESETS.desktop).toBeDefined();
      expect(SWIPE_PRESETS.desktop.distanceThreshold).toBeGreaterThan(
        SWIPE_PRESETS.ios.distanceThreshold
      );
    });

    it("provides relaxed preset for less sensitive detection", () => {
      // Relaxed: 誤操作防止のため高い閾値
      expect(SWIPE_PRESETS.relaxed).toBeDefined();
      expect(SWIPE_PRESETS.relaxed.distanceThreshold).toBeGreaterThanOrEqual(80);
      expect(SWIPE_PRESETS.relaxed.velocityThreshold).toBeGreaterThanOrEqual(0.5);
    });

    it("all presets have required threshold properties", () => {
      const requiredProps = ["distanceThreshold", "velocityThreshold", "lockThreshold"];

      for (const preset of Object.values(SWIPE_PRESETS)) {
        for (const prop of requiredProps) {
          expect(preset).toHaveProperty(prop);
          expect(typeof (preset as Record<string, unknown>)[prop]).toBe("number");
        }
      }
    });
  });

  describe("getSwipePreset", () => {
    it("returns iOS preset for iOS user agent", () => {
      const preset = getSwipePreset("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
      expect(preset).toEqual(SWIPE_PRESETS.ios);
    });

    it("returns iOS preset for iPad user agent", () => {
      const preset = getSwipePreset("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)");
      expect(preset).toEqual(SWIPE_PRESETS.ios);
    });

    it("returns Android preset for Android user agent", () => {
      const preset = getSwipePreset("Mozilla/5.0 (Linux; Android 14; Pixel 8)");
      expect(preset).toEqual(SWIPE_PRESETS.android);
    });

    it("returns desktop preset for Chrome on Windows", () => {
      const preset = getSwipePreset("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
      expect(preset).toEqual(SWIPE_PRESETS.desktop);
    });

    it("returns desktop preset for Chrome on Mac", () => {
      const preset = getSwipePreset("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36");
      expect(preset).toEqual(SWIPE_PRESETS.desktop);
    });

    it("falls back to ios preset for unknown user agent", () => {
      const preset = getSwipePreset("Unknown Browser/1.0");
      expect(preset).toEqual(SWIPE_PRESETS.ios);
    });
  });
});
