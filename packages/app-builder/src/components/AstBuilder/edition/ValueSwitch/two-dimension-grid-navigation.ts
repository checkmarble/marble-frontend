export type TwoDimensionGridNavigationKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'Enter';

export const VALUE_SWITCH_GRID_CELL_ATTRIBUTE = 'data-value-switch-cell';

type GridPosition = {
  rowIndex: number;
  columnIndex: number;
};

export function getValueSwitchGridCellSelector(rowIndex: number, columnIndex: number) {
  return `[${VALUE_SWITCH_GRID_CELL_ATTRIBUTE}="${rowIndex}:${columnIndex}"]`;
}

function getValueSwitchGridCellFocusable(
  container: HTMLElement | null | undefined,
  rowIndex: number,
  columnIndex: number,
) {
  const cell = container?.querySelector(getValueSwitchGridCellSelector(rowIndex, columnIndex));
  if (!cell) return null;
  if (cell instanceof HTMLElement && cell.matches('input, button') && !cell.matches(':disabled, [readonly]')) {
    return cell;
  }
  return cell.querySelector<HTMLElement>('input:not(:disabled):not([readonly]), button:not(:disabled)');
}

/** Focus the first editable control in a marked grid cell. Used after adding a 1D row and when arrow-navigating. */
export function focusValueSwitchGridCell(
  container: HTMLElement | null | undefined,
  rowIndex: number,
  columnIndex: number,
) {
  const focusable = getValueSwitchGridCellFocusable(container, rowIndex, columnIndex);
  if (!focusable) return;
  focusable.focus();
  if (focusable instanceof HTMLInputElement) focusable.select();
}

type GridKeyDownEvent = Pick<
  KeyboardEvent,
  'key' | 'shiftKey' | 'metaKey' | 'ctrlKey' | 'altKey' | 'preventDefault' | 'target'
>;

/** Arrow/Enter navigation for the 1D value+score grid. Enter on a menu button still opens the menu. */
export function handleValueSwitchGridKeyDown(
  event: GridKeyDownEvent,
  {
    container,
    rowCount,
    columnCount,
    direction,
  }: {
    container: HTMLElement | null;
    rowCount: number;
    columnCount: number;
    direction: 'ltr' | 'rtl';
  },
) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Enter'].includes(event.key)) return;

  const target = event.target;
  if (!(target instanceof HTMLElement) || !container?.contains(target)) return;

  const cell = target.closest(`[${VALUE_SWITCH_GRID_CELL_ATTRIBUTE}]`);
  if (!(cell instanceof HTMLElement) || !container.contains(cell)) return;

  const isMenuButton = Boolean(target.closest('button'));
  if (isMenuButton && event.key === 'Enter') return;

  const [rowIndex, columnIndex] = (cell.getAttribute(VALUE_SWITCH_GRID_CELL_ATTRIBUTE) ?? '')
    .split(':')
    .map((part) => Number(part));
  if (rowIndex === undefined || columnIndex === undefined || Number.isNaN(rowIndex) || Number.isNaN(columnIndex)) {
    return;
  }

  const next = getTwoDimensionGridNavigationTarget({
    key: event.key as TwoDimensionGridNavigationKey,
    shiftKey: event.shiftKey,
    direction,
    rowIndex,
    columnIndex,
    rowCount,
    columnCount,
  });
  if (!next) return;

  event.preventDefault();
  focusValueSwitchGridCell(container, next.rowIndex, next.columnIndex);
}

type GetNavigationTargetArgs = GridPosition & {
  key: TwoDimensionGridNavigationKey;
  shiftKey: boolean;
  direction: 'ltr' | 'rtl';
  rowCount: number;
  columnCount: number;
};

type ScrollGridCellIntoViewArgs = GridPosition & {
  cell: HTMLElement;
  container: HTMLElement;
  rowCount: number;
  columnCount: number;
};

export function getTwoDimensionGridNavigationTarget({
  key,
  shiftKey,
  direction,
  rowIndex,
  columnIndex,
  rowCount,
  columnCount,
}: GetNavigationTargetArgs): GridPosition | null {
  if (rowCount === 0 || columnCount === 0) return null;

  if (key === 'ArrowUp' || (key === 'Enter' && shiftKey)) {
    return rowIndex > 0 ? { rowIndex: rowIndex - 1, columnIndex } : null;
  }

  if (key === 'ArrowDown' || key === 'Enter') {
    return rowIndex < rowCount - 1 ? { rowIndex: rowIndex + 1, columnIndex } : null;
  }

  const cellCount = rowCount * columnCount;
  const currentIndex = rowIndex * columnCount + columnIndex;
  const movesForward = (key === 'ArrowRight' && direction === 'ltr') || (key === 'ArrowLeft' && direction === 'rtl');
  const nextIndex = (currentIndex + (movesForward ? 1 : -1) + cellCount) % cellCount;

  return {
    rowIndex: Math.floor(nextIndex / columnCount),
    columnIndex: nextIndex % columnCount,
  };
}

export function scrollTwoDimensionGridCellIntoView({
  cell,
  container,
  rowIndex,
  columnIndex,
  rowCount,
  columnCount,
}: ScrollGridCellIntoViewArgs) {
  const cellElement = cell.closest('td') ?? cell;
  const cellRect = cellElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const stickyInsets = getStickyInsets(container);
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);

  container.scrollLeft = getSnappedOrAlignedScroll({
    currentScroll: container.scrollLeft,
    maxScroll: maxScrollLeft,
    index: columnIndex,
    count: columnCount,
    cellStart: cellRect.left,
    cellEnd: cellRect.right,
    viewportStart: containerRect.left + stickyInsets.left,
    viewportEnd: containerRect.right,
  });
  container.scrollTop = getSnappedOrAlignedScroll({
    currentScroll: container.scrollTop,
    maxScroll: maxScrollTop,
    index: rowIndex,
    count: rowCount,
    cellStart: cellRect.top,
    cellEnd: cellRect.bottom,
    viewportStart: containerRect.top + stickyInsets.top,
    viewportEnd: containerRect.bottom,
  });
}

function getStickyInsets(container: HTMLElement) {
  return {
    top: container.querySelector('thead')?.getBoundingClientRect().height ?? 0,
    left: container.querySelector('tbody th')?.getBoundingClientRect().width ?? 0,
  };
}

function getSnappedOrAlignedScroll({
  currentScroll,
  maxScroll,
  index,
  count,
  cellStart,
  cellEnd,
  viewportStart,
  viewportEnd,
}: {
  currentScroll: number;
  maxScroll: number;
  index: number;
  count: number;
  cellStart: number;
  cellEnd: number;
  viewportStart: number;
  viewportEnd: number;
}) {
  if (index <= 0) return 0;
  if (index >= count - 1) return maxScroll;

  let nextScroll = currentScroll;
  if (cellStart < viewportStart) {
    nextScroll -= viewportStart - cellStart;
  } else if (cellEnd > viewportEnd) {
    nextScroll += cellEnd - viewportEnd;
  }

  return Math.min(maxScroll, Math.max(0, nextScroll));
}
