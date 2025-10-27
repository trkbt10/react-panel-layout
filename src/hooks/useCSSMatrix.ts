/**
 * @file useCSSMatrix - Efficient CSS matrix transformation hook with incremental updates
 */

import { useRef, useMemo } from 'react';
import { matrix, type CSSMatrix } from '../utils/CSSMatrix';

/**
 * Matrix operation types
 */
export type MatrixOperation =
  | ['translate', number?, number?, number?]
  | ['translate3d', number, number, number]
  | ['translateX', number]
  | ['translateY', number]
  | ['translateZ', number]
  | ['scale', number?, number?, number?]
  | ['scale3d', number, number, number]
  | ['scaleX', number]
  | ['scaleY', number]
  | ['scaleZ', number]
  | ['rotateX', number]
  | ['rotateY', number]
  | ['rotateZ', number]
  | ['rotate', number, number, number, number]
  | ['rotate3d', number, number, number, number]
  | ['skew', number?, number?]
  | ['skewX', number]
  | ['skewY', number]
  | ['perspective', number];

/**
 * Cache entry for computed matrices
 */
type CacheEntry = {
  operation: MatrixOperation;
  result: CSSMatrix;
};

/**
 * Apply a single operation to a matrix
 */
const applyOperation = (m: CSSMatrix, op: MatrixOperation): CSSMatrix => {
  const [name, ...params] = op;

  switch (name) {
    case 'translate':
      return m.translate(params[0], params[1], params[2]);
    case 'translate3d':
      return m.translate3d(params[0]!, params[1]!, params[2]!);
    case 'translateX':
      return m.translateX(params[0]!);
    case 'translateY':
      return m.translateY(params[0]!);
    case 'translateZ':
      return m.translateZ(params[0]!);
    case 'scale':
      return m.scale(params[0], params[1], params[2]);
    case 'scale3d':
      return m.scale3d(params[0]!, params[1]!, params[2]!);
    case 'scaleX':
      return m.scaleX(params[0]!);
    case 'scaleY':
      return m.scaleY(params[0]!);
    case 'scaleZ':
      return m.scaleZ(params[0]!);
    case 'rotateX':
      return m.rotateX(params[0]!);
    case 'rotateY':
      return m.rotateY(params[0]!);
    case 'rotateZ':
      return m.rotateZ(params[0]!);
    case 'rotate':
      return m.rotate(params[0]!, params[1]!, params[2]!, params[3]!);
    case 'rotate3d':
      return m.rotate3d(params[0]!, params[1]!, params[2]!, params[3]!);
    case 'skew':
      return m.skew(params[0], params[1]);
    case 'skewX':
      return m.skewX(params[0]!);
    case 'skewY':
      return m.skewY(params[0]!);
    case 'perspective':
      return m.perspective(params[0]!);
    default:
      return m;
  }
};

/**
 * Compare two operations for equality
 */
const operationsEqual = (a: MatrixOperation, b: MatrixOperation): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Find the first index where operations differ
 */
const findDiffIndex = (
  prev: MatrixOperation[],
  current: MatrixOperation[]
): number => {
  const minLength = Math.min(prev.length, current.length);
  for (let i = 0; i < minLength; i++) {
    if (!operationsEqual(prev[i]!, current[i]!)) {
      return i;
    }
  }
  // If all compared operations are equal, check length difference
  if (prev.length !== current.length) {
    return minLength;
  }
  return -1; // No difference
};

/**
 * Efficient CSS matrix transformation hook with incremental updates
 *
 * Constructs a computation tree and only recalculates from the point of change,
 * caching intermediate results for optimal performance.
 *
 * @param operations - Array of matrix operations to apply
 * @returns CSS transform string (matrix3d format)
 *
 * @example
 * ```tsx
 * const transform = useCSSMatrix([
 *   ['translate', 100, 50],
 *   ['rotateZ', angle],
 *   ['scale', 2, 2]
 * ]);
 * return <div style={{ transform }} />;
 * ```
 */
export const useCSSMatrix = (operations: MatrixOperation[]): string => {
  // Cache for intermediate computation results
  const cacheRef = useRef<CacheEntry[]>([]);
  const prevOperationsRef = useRef<MatrixOperation[]>([]);

  const result = useMemo(() => {
    const prevOps = prevOperationsRef.current;
    const cache = cacheRef.current;

    // Find where operations differ from previous render
    const diffIndex = findDiffIndex(prevOps, operations);

    // If no difference and lengths match, return cached result
    if (diffIndex === -1 && cache.length === operations.length) {
      return cache[cache.length - 1]?.result.toCSS() ?? matrix().toCSS();
    }

    // Start from the last valid cached result or identity matrix
    // eslint-disable-next-line no-restricted-syntax -- Performance: avoid function call overhead
    let currentMatrix: CSSMatrix;
    // eslint-disable-next-line no-restricted-syntax -- Performance: avoid function call overhead
    let startIndex: number;

    if (diffIndex > 0 && cache[diffIndex - 1]) {
      // Use cached result up to the point of change
      currentMatrix = cache[diffIndex - 1]!.result;
      startIndex = diffIndex;
    } else {
      // Start from identity matrix
      currentMatrix = matrix();
      startIndex = 0;
    }

    // Rebuild cache from the point of change
    const newCache: CacheEntry[] = cache.slice(0, startIndex);

    for (let i = startIndex; i < operations.length; i++) {
      const operation = operations[i]!;
      currentMatrix = applyOperation(currentMatrix, operation);
      newCache.push({
        operation,
        result: currentMatrix,
      });
    }

    // Update refs for next render
    cacheRef.current = newCache;
    prevOperationsRef.current = [...operations];

    return currentMatrix.toCSS();
  }, [operations]);

  return result;
};

/**
 * Hook variant that returns the CSSMatrix object instead of CSS string
 *
 * Useful when you need access to the raw matrix values or want to
 * apply additional operations.
 *
 * @param operations - Array of matrix operations to apply
 * @returns CSSMatrix object
 *
 * @example
 * ```tsx
 * const matrixObj = useCSSMatrixObject([
 *   ['translate', 100, 50],
 *   ['rotateZ', angle]
 * ]);
 * const values = matrixObj.toArray();
 * ```
 */
export const useCSSMatrixObject = (operations: MatrixOperation[]): CSSMatrix => {
  const cacheRef = useRef<CacheEntry[]>([]);
  const prevOperationsRef = useRef<MatrixOperation[]>([]);

  const result = useMemo(() => {
    const prevOps = prevOperationsRef.current;
    const cache = cacheRef.current;

    const diffIndex = findDiffIndex(prevOps, operations);

    if (diffIndex === -1 && cache.length === operations.length) {
      return cache[cache.length - 1]?.result ?? matrix();
    }

    // eslint-disable-next-line no-restricted-syntax -- Performance: avoid function call overhead
    let currentMatrix: CSSMatrix;
    // eslint-disable-next-line no-restricted-syntax -- Performance: avoid function call overhead
    let startIndex: number;

    if (diffIndex > 0 && cache[diffIndex - 1]) {
      currentMatrix = cache[diffIndex - 1]!.result;
      startIndex = diffIndex;
    } else {
      currentMatrix = matrix();
      startIndex = 0;
    }

    const newCache: CacheEntry[] = cache.slice(0, startIndex);

    for (let i = startIndex; i < operations.length; i++) {
      const operation = operations[i]!;
      currentMatrix = applyOperation(currentMatrix, operation);
      newCache.push({
        operation,
        result: currentMatrix,
      });
    }

    cacheRef.current = newCache;
    prevOperationsRef.current = [...operations];

    return currentMatrix;
  }, [operations]);

  return result;
};
