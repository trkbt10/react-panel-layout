/**
 * @file CSSMatrix - Immutable 4x4 matrix for CSS 3D transforms
 *
 * Each operation returns a new instance, preserving the original matrix.
 *
 * @example
 * const mtrx = matrix().translate(0, 10);
 * const a = mtrx.rotateX(Math.PI / 2);
 * const b = mtrx.rotateY(Math.PI);
 * // a and b are independent transformations from mtrx
 */

/**
 * Matrix type with transformation methods
 */
export type CSSMatrix = {
  readonly translate: (x?: number, y?: number, z?: number) => CSSMatrix;
  readonly translate3d: (x: number, y: number, z: number) => CSSMatrix;
  readonly translateX: (x: number) => CSSMatrix;
  readonly translateY: (y: number) => CSSMatrix;
  readonly translateZ: (z: number) => CSSMatrix;
  readonly scale: (x?: number, y?: number, z?: number) => CSSMatrix;
  readonly scale3d: (x: number, y: number, z: number) => CSSMatrix;
  readonly scaleX: (x: number) => CSSMatrix;
  readonly scaleY: (y: number) => CSSMatrix;
  readonly scaleZ: (z: number) => CSSMatrix;
  readonly rotateX: (angle: number) => CSSMatrix;
  readonly rotateY: (angle: number) => CSSMatrix;
  readonly rotateZ: (angle: number) => CSSMatrix;
  readonly rotate: (angle: number, x: number, y: number, z: number) => CSSMatrix;
  readonly rotate3d: (x: number, y: number, z: number, angle: number) => CSSMatrix;
  readonly skew: (angleX?: number, angleY?: number) => CSSMatrix;
  readonly skewX: (angle: number) => CSSMatrix;
  readonly skewY: (angle: number) => CSSMatrix;
  readonly perspective: (distance: number) => CSSMatrix;
  readonly toCSS: () => string;
  readonly toArray: () => readonly number[];
  readonly toString: () => string;
};

/**
 * Multiply two 4x4 matrices (a * b)
 * Matrices are in column-major order
 */
const multiplyMatrices = (a: readonly number[], b: readonly number[]): number[] => {
  const result = new Array(16);

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      result[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }

  return result;
};

/**
 * Create a CSSMatrix object from raw values
 * Values are stored in column-major order (OpenGL/CSS convention)
 */
const createMatrix = (values: readonly number[]): CSSMatrix => {
  if (values.length !== 16) {
    throw new Error('Matrix must have exactly 16 values');
  }

  // Freeze the values to ensure immutability
  const m = Object.freeze([...values]);

  /**
   * Helper to create a new matrix by multiplying with a transform matrix
   */
  const applyTransform = (transformValues: number[]): CSSMatrix => {
    const result = multiplyMatrices(m, transformValues);
    return createMatrix(result);
  };

  return Object.freeze({
    translate: (x = 0, y = 0, z = 0) => {
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
      ]);
    },

    translate3d: (x, y, z) => {
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
      ]);
    },

    translateX: (x) => {
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, 0, 0, 1,
      ]);
    },

    translateY: (y) => {
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, y, 0, 1,
      ]);
    },

    translateZ: (z) => {
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, z, 1,
      ]);
    },

    scale: (x = 1, y = 1, z = 1) => {
      return applyTransform([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
      ]);
    },

    scale3d: (x, y, z) => {
      return applyTransform([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
      ]);
    },

    scaleX: (x) => {
      return applyTransform([
        x, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    },

    scaleY: (y) => {
      return applyTransform([
        1, 0, 0, 0,
        0, y, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    },

    scaleZ: (z) => {
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
      ]);
    },

    rotateX: (angle) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return applyTransform([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ]);
    },

    rotateY: (angle) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return applyTransform([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ]);
    },

    rotateZ: (angle) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return applyTransform([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    },

    rotate: (angle, x, y, z) => {
      // Normalize the axis
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len === 0) {
        return createMatrix(m);
      }

      x /= len;
      y /= len;
      z /= len;

      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const t = 1 - c;

      return applyTransform([
        t * x * x + c,     t * x * y + s * z, t * x * z - s * y, 0,
        t * x * y - s * z, t * y * y + c,     t * y * z + s * x, 0,
        t * x * z + s * y, t * y * z - s * x, t * z * z + c,     0,
        0,                 0,                 0,                 1,
      ]);
    },

    rotate3d: (x, y, z, angle) => {
      // Normalize the axis
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len === 0) {
        return createMatrix(m);
      }

      x /= len;
      y /= len;
      z /= len;

      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const t = 1 - c;

      return applyTransform([
        t * x * x + c,     t * x * y + s * z, t * x * z - s * y, 0,
        t * x * y - s * z, t * y * y + c,     t * y * z + s * x, 0,
        t * x * z + s * y, t * y * z - s * x, t * z * z + c,     0,
        0,                 0,                 0,                 1,
      ]);
    },

    skew: (angleX = 0, angleY = 0) => {
      const tanX = Math.tan(angleX);
      const tanY = Math.tan(angleY);
      return applyTransform([
        1, tanY, 0, 0,
        tanX, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    },

    skewX: (angle) => {
      const tanX = Math.tan(angle);
      return applyTransform([
        1, 0, 0, 0,
        tanX, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    },

    skewY: (angle) => {
      const tanY = Math.tan(angle);
      return applyTransform([
        1, tanY, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    },

    perspective: (distance) => {
      if (distance === 0) {
        throw new Error('Perspective distance cannot be zero');
      }
      return applyTransform([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, -1 / distance,
        0, 0, 0, 1,
      ]);
    },

    toCSS: () => {
      return `matrix3d(${m.join(', ')})`;
    },

    toArray: () => m,

    toString: () => {
      return [
        `[${m[0]}, ${m[4]}, ${m[8]}, ${m[12]}]`,
        `[${m[1]}, ${m[5]}, ${m[9]}, ${m[13]}]`,
        `[${m[2]}, ${m[6]}, ${m[10]}, ${m[14]}]`,
        `[${m[3]}, ${m[7]}, ${m[11]}, ${m[15]}]`,
      ].join('\n');
    },
  });
};

/**
 * Factory function to create a new identity matrix
 */
export const matrix = (): CSSMatrix => {
  return createMatrix([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
};
