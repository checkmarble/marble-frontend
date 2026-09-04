import { getPivotObjectKey, type PivotObject } from '@app-builder/models/cases';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

type PivotTabsProps = {
  /** Pivots to render a tab for. Nothing renders when there is only one. */
  pivots: PivotObject[];
  /**
   * Pivot list the tab numbers come from. Pass the case's full list when `pivots`
   * is a subset, so a client and its links tab carry the same number.
   */
  numberedFrom?: PivotObject[];
  to: './clients/$pivotValue' | './links/$pivotValue';
};

/** The "Client 1 / Client 2" strip above a pivot-scoped case tab. */
export function PivotTabs({ pivots, numberedFrom = pivots, to }: PivotTabsProps) {
  const { t } = useTranslation(['cases']);

  if (pivots.length <= 1) return null;

  const orderedKeys = numberedFrom.map(getPivotObjectKey);

  return (
    <div className="mb-lg flex shrink-0 gap-sm">
      {pivots.map((pivot) => {
        const pivotValue = getPivotObjectKey(pivot);
        return (
          <Link
            key={pivotValue}
            className="px-sm h-8 rounded-md border border-grey-border flex items-center aria-[current=page]:border-purple-primary"
            from="/cases/s/$caseId/"
            to={to}
            params={{ pivotValue }}
          >
            {t('cases:case_manager.client_panel.label', { index: orderedKeys.indexOf(pivotValue) + 1 })}
          </Link>
        );
      })}
    </div>
  );
}
