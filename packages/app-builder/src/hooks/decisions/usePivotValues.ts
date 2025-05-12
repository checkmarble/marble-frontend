import type { Pivot } from '@app-builder/models';
import type { CaseDetail } from '@app-builder/models/cases';
import { useMemo } from 'react';
import * as R from 'remeda';

type PivotValues = CaseDetail['decisions'][number]['pivotValues'];

export function usePivotValues(pivotValues: PivotValues, pivots: Pivot[]) {
  const value = useMemo(() => {
    return R.pipe(
      pivotValues,
      R.map(({ id, value }) => {
        const pivot = pivots.find((p) => p.id === id);
        if (!pivot || !value) {
          return null;
        }

        return { pivot, value };
      }),
      R.filter(R.isNonNullish),
    );
  }, [pivotValues, pivots]);

  return value;
}
