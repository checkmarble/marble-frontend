export type TwoDimensionGridNavigationKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'Enter';

type GridPosition = {
  rowIndex: number;
  columnIndex: number;
};

type GetNavigationTargetArgs = GridPosition & {
  key: TwoDimensionGridNavigationKey;
  shiftKey: boolean;
  direction: 'ltr' | 'rtl';
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
