/**
 * @file Tests for useCSSMatrix hook
 */

import { renderHook } from '@testing-library/react';
import { useCSSMatrix, useCSSMatrixObject, type MatrixOperation } from './useCSSMatrix';
import { matrix } from '../utils/CSSMatrix';

describe('useCSSMatrix', () => {
  it('should return identity matrix CSS for empty operations', () => {
    const { result } = renderHook(() => useCSSMatrix([]));
    expect(result.current).toBe(matrix().toCSS());
  });

  it('should apply single translation', () => {
    const operations: MatrixOperation[] = [['translate', 100, 50]];
    const { result } = renderHook(() => useCSSMatrix(operations));

    const expected = matrix().translate(100, 50).toCSS();
    expect(result.current).toBe(expected);
  });

  it('should apply multiple operations in sequence', () => {
    const operations: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
      ['scale', 2, 2],
    ];
    const { result } = renderHook(() => useCSSMatrix(operations));

    const expected = matrix()
      .translate(100, 50)
      .rotateZ(Math.PI / 4)
      .scale(2, 2)
      .toCSS();
    expect(result.current).toBe(expected);
  });

  it('should handle 3D operations', () => {
    const operations: MatrixOperation[] = [
      ['perspective', 1000],
      ['translate3d', 0, 0, -500],
      ['rotateY', Math.PI / 6],
    ];
    const { result } = renderHook(() => useCSSMatrix(operations));

    const expected = matrix()
      .perspective(1000)
      .translate3d(0, 0, -500)
      .rotateY(Math.PI / 6)
      .toCSS();
    expect(result.current).toBe(expected);
  });

  it('should efficiently update when operations change at the end', () => {
    const operations1: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', 0],
    ];
    const operations2: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
    ];

    const { result, rerender } = renderHook(
      ({ ops }) => useCSSMatrix(ops),
      { initialProps: { ops: operations1 } }
    );

    const result1 = result.current;

    // Change only the last operation
    rerender({ ops: operations2 });
    const result2 = result.current;

    // Results should be different
    expect(result1).not.toBe(result2);

    // Result should match expected
    const expected = matrix()
      .translate(100, 50)
      .rotateZ(Math.PI / 4)
      .toCSS();
    expect(result2).toBe(expected);
  });

  it('should efficiently update when operations change at the beginning', () => {
    const operations1: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
    ];
    const operations2: MatrixOperation[] = [
      ['translate', 200, 100],
      ['rotateZ', Math.PI / 4],
    ];

    const { result, rerender } = renderHook(
      ({ ops }) => useCSSMatrix(ops),
      { initialProps: { ops: operations1 } }
    );

    const result1 = result.current;

    // Change the first operation
    rerender({ ops: operations2 });
    const result2 = result.current;

    expect(result1).not.toBe(result2);

    const expected = matrix()
      .translate(200, 100)
      .rotateZ(Math.PI / 4)
      .toCSS();
    expect(result2).toBe(expected);
  });

  it('should handle adding operations', () => {
    const operations1: MatrixOperation[] = [
      ['translate', 100, 50],
    ];
    const operations2: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
    ];

    const { result, rerender } = renderHook(
      ({ ops }) => useCSSMatrix(ops),
      { initialProps: { ops: operations1 } }
    );

    rerender({ ops: operations2 });

    const expected = matrix()
      .translate(100, 50)
      .rotateZ(Math.PI / 4)
      .toCSS();
    expect(result.current).toBe(expected);
  });

  it('should handle removing operations', () => {
    const operations1: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
      ['scale', 2, 2],
    ];
    const operations2: MatrixOperation[] = [
      ['translate', 100, 50],
    ];

    const { result, rerender } = renderHook(
      ({ ops }) => useCSSMatrix(ops),
      { initialProps: { ops: operations1 } }
    );

    rerender({ ops: operations2 });

    const expected = matrix().translate(100, 50).toCSS();
    expect(result.current).toBe(expected);
  });

  it('should not recompute when operations array reference changes but content is same', () => {
    const operations1: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
    ];
    const operations2: MatrixOperation[] = [
      ['translate', 100, 50],
      ['rotateZ', Math.PI / 4],
    ];

    const { result, rerender } = renderHook(
      ({ ops }) => useCSSMatrix(ops),
      { initialProps: { ops: operations1 } }
    );

    const result1 = result.current;

    // Different array reference, same content
    rerender({ ops: operations2 });
    const result2 = result.current;

    // Should return same result due to memoization
    expect(result1).toBe(result2);
  });
});

describe('useCSSMatrixObject', () => {
  it('should return CSSMatrix object', () => {
    const operations: MatrixOperation[] = [['translate', 100, 50]];
    const { result } = renderHook(() => useCSSMatrixObject(operations));

    expect(result.current).toBeDefined();
    expect(typeof result.current.toCSS).toBe('function');
    expect(typeof result.current.toArray).toBe('function');
  });

  it('should return correct matrix values', () => {
    const operations: MatrixOperation[] = [['translate', 100, 50]];
    const { result } = renderHook(() => useCSSMatrixObject(operations));

    const expected = matrix().translate(100, 50);
    expect(result.current.toCSS()).toBe(expected.toCSS());
  });

  it('should allow chaining additional operations', () => {
    const operations: MatrixOperation[] = [['translate', 100, 50]];
    const { result } = renderHook(() => useCSSMatrixObject(operations));

    const final = result.current.rotateZ(Math.PI / 4);
    const expected = matrix().translate(100, 50).rotateZ(Math.PI / 4);

    expect(final.toCSS()).toBe(expected.toCSS());
  });
});
