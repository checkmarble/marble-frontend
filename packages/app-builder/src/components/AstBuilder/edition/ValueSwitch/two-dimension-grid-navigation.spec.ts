import { describe, expect, it } from 'vitest';

import {
  getTwoDimensionGridNavigationTarget,
  scrollTwoDimensionGridCellIntoView,
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

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
  scrollWidth?: number;
  scrollHeight?: number;
};

function mockElementBox(element: HTMLElement, box: Box) {
  Object.defineProperties(element, {
    clientWidth: { configurable: true, get: () => box.width },
    clientHeight: { configurable: true, get: () => box.height },
    scrollWidth: { configurable: true, get: () => box.scrollWidth ?? box.width },
    scrollHeight: { configurable: true, get: () => box.scrollHeight ?? box.height },
  });
  element.getBoundingClientRect = () =>
    DOMRect.fromRect({ x: box.left, y: box.top, width: box.width, height: box.height });
}

function createScrollableGrid({
  cellRect,
  scrollLeft = 240,
  scrollTop = 180,
}: {
  cellRect: Box;
  scrollLeft?: number;
  scrollTop?: number;
}) {
  const container = document.createElement('div');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const row = document.createElement('tr');
  const rowHeader = document.createElement('th');
  const cell = document.createElement('td');
  row.append(rowHeader, cell);
  tbody.append(row);
  table.append(thead, tbody);
  container.append(table);
  container.scrollLeft = scrollLeft;
  container.scrollTop = scrollTop;
  mockElementBox(container, { left: 0, top: 0, width: 400, height: 300, scrollWidth: 1200, scrollHeight: 900 });
  mockElementBox(thead, { left: 0, top: 0, width: 400, height: 40 });
  mockElementBox(rowHeader, { left: 0, top: 40, width: 80, height: 40 });
  mockElementBox(cell, cellRect);
  return { container, cell };
}

function scrollCell(
  position: { rowIndex: number; columnIndex: number },
  cellRect: Box,
  scroll?: { scrollLeft?: number; scrollTop?: number },
) {
  const { container, cell } = createScrollableGrid({ cellRect, ...scroll });
  scrollTwoDimensionGridCellIntoView({
    cell,
    container,
    rowCount: 3,
    columnCount: 4,
    ...position,
  });
  return container;
}

describe('scrollTwoDimensionGridCellIntoView', () => {
  it('resets the scrollbar to the start on the first row and column', () => {
    const container = scrollCell({ rowIndex: 0, columnIndex: 0 }, { left: -200, top: -100, width: 80, height: 40 });

    expect(container.scrollLeft).toBe(0);
    expect(container.scrollTop).toBe(0);
  });

  it('resets the scrollbar to the end on the last row and column', () => {
    const container = scrollCell({ rowIndex: 2, columnIndex: 3 }, { left: 500, top: 400, width: 80, height: 40 });

    expect(container.scrollLeft).toBe(800);
    expect(container.scrollTop).toBe(600);
  });

  it('scrolls a clipped middle cell out from under the sticky header and column', () => {
    const container = scrollCell({ rowIndex: 1, columnIndex: 1 }, { left: 20, top: 10, width: 80, height: 40 });

    expect(container.scrollLeft).toBe(180);
    expect(container.scrollTop).toBe(150);
  });

  it('scrolls a middle cell clipped past the viewport edge into view', () => {
    const container = scrollCell({ rowIndex: 1, columnIndex: 2 }, { left: 360, top: 280, width: 80, height: 40 });

    expect(container.scrollLeft).toBe(280);
    expect(container.scrollTop).toBe(200);
  });

  it('leaves a fully visible middle cell in place', () => {
    const container = scrollCell({ rowIndex: 1, columnIndex: 1 }, { left: 120, top: 80, width: 80, height: 40 });

    expect(container.scrollLeft).toBe(240);
    expect(container.scrollTop).toBe(180);
  });

  it('snaps only the axis that landed on a first or last cell', () => {
    const wrappedToFirstColumn = scrollCell(
      { rowIndex: 1, columnIndex: 0 },
      { left: -160, top: 80, width: 80, height: 40 },
    );
    expect(wrappedToFirstColumn.scrollLeft).toBe(0);
    expect(wrappedToFirstColumn.scrollTop).toBe(180);

    const wrappedToLastColumn = scrollCell(
      { rowIndex: 1, columnIndex: 3 },
      { left: 500, top: 80, width: 80, height: 40 },
    );
    expect(wrappedToLastColumn.scrollLeft).toBe(800);
    expect(wrappedToLastColumn.scrollTop).toBe(180);
  });
});
