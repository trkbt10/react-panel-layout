/**
 * @file Generic CSS parsing and measurement utilities.
 */

export type ParsedGap = {
  rowGap: number;
  columnGap: number;
};

/**
 * Parses a CSS gap value string into row and column gap numbers.
 * Supports single value (applied to both) or two values (row column).
 * Only handles px units; other units return 0.
 */
export const parseGapValue = (gapValue?: string): ParsedGap => {
  if (!gapValue) {
    return { rowGap: 0, columnGap: 0 };
  }

  const tokens = gapValue
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const parseToken = (token: string): number => {
    const match = token.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (!match) {
      return 0;
    }
    return Number.parseFloat(match[1]);
  };

  if (tokens.length === 1) {
    const parsed = parseToken(tokens[0]);
    return { rowGap: parsed, columnGap: parsed };
  }

  return {
    rowGap: parseToken(tokens[0]),
    columnGap: parseToken(tokens[1]),
  };
};

export type GridDirection = "col" | "row";

/**
 * Measures actual rendered grid track sizes from computed style.
 * Returns pixel values parsed from gridTemplateColumns or gridTemplateRows.
 */
export const measureGridTrackSizes = (
  containerEl: HTMLElement | null,
  direction: GridDirection,
): number[] => {
  if (!containerEl) {
    return [];
  }
  const style = getComputedStyle(containerEl);
  const template = direction === "col" ? style.gridTemplateColumns : style.gridTemplateRows;

  // Computed style returns resolved pixel values like "370px 500px"
  return template
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((n) => !Number.isNaN(n));
};
