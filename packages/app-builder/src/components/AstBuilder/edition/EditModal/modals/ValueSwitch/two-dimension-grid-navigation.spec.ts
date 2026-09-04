import { describe, expect, it } from 'vitest';

import {
  getTwoDimensionGridNavigationTarget,
  type TwoDimensionGridNavigationKey,
} from './two-dimension-grid-navigation';

function navigate({
  key,
  rowIndex = 1,
  columnIndex = 1,
  direction = 'ltr',
  shiftKey = false,
}: {
  key: TwoDimensionGridNavigationKey;
  rowIndex?: number;
  columnIndex?: number;
  direction?: 'ltr' | 'rtl';
  shiftKey?: boolean;
}) {
  return getTwoDimensionGridNavigationTarget({
    key,
    shiftKey,
    direction,
    rowIndex,
    columnIndex,
    rowCount: 3,
    columnCount: 4,
  });
}

describe('getTwoDimensionGridNavigationTarget', () => {
  it('moves vertically without wrapping at the first or last row', () => {
    expect(navigate({ key: 'ArrowUp' })).toEqual({ rowIndex: 0, columnIndex: 1 });
    expect(navigate({ key: 'ArrowDown' })).toEqual({ rowIndex: 2, columnIndex: 1 });
    expect(navigate({ key: 'ArrowUp', rowIndex: 0 })).toBeNull();
    expect(navigate({ key: 'ArrowDown', rowIndex: 2 })).toBeNull();
  });

  it('uses Enter and Shift+Enter for vertical navigation', () => {
    expect(navigate({ key: 'Enter' })).toEqual({ rowIndex: 2, columnIndex: 1 });
    expect(navigate({ key: 'Enter', shiftKey: true })).toEqual({ rowIndex: 0, columnIndex: 1 });
    expect(navigate({ key: 'Enter', rowIndex: 2 })).toBeNull();
    expect(navigate({ key: 'Enter', rowIndex: 0, shiftKey: true })).toBeNull();
  });

  it('wraps left and right across rows and around the entire grid', () => {
    expect(navigate({ key: 'ArrowRight', rowIndex: 0, columnIndex: 3 })).toEqual({ rowIndex: 1, columnIndex: 0 });
    expect(navigate({ key: 'ArrowLeft', rowIndex: 1, columnIndex: 0 })).toEqual({ rowIndex: 0, columnIndex: 3 });
    expect(navigate({ key: 'ArrowRight', rowIndex: 2, columnIndex: 3 })).toEqual({ rowIndex: 0, columnIndex: 0 });
    expect(navigate({ key: 'ArrowLeft', rowIndex: 0, columnIndex: 0 })).toEqual({ rowIndex: 2, columnIndex: 3 });
  });

  it('reverses horizontal navigation in right-to-left layouts', () => {
    expect(navigate({ key: 'ArrowRight', direction: 'rtl' })).toEqual({ rowIndex: 1, columnIndex: 0 });
    expect(navigate({ key: 'ArrowLeft', direction: 'rtl' })).toEqual({ rowIndex: 1, columnIndex: 2 });
    expect(navigate({ key: 'ArrowRight', direction: 'rtl', rowIndex: 0, columnIndex: 0 })).toEqual({
      rowIndex: 2,
      columnIndex: 3,
    });
  });
});
