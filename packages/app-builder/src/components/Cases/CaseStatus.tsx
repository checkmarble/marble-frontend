import { cva, cx } from 'class-variance-authority';
import { type ParseKeys } from 'i18next';
import { type CaseStatus } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

const caseStatusVariants = cva('', {
  variants: {
    color: {
      red: 'bg-red-10 text-red-100',
      blue: 'bg-blue-10 text-blue-100',
      grey: 'bg-grey-10 text-grey-50',
      green: 'bg-green-10 text-green-100',
    },
  },
});

export function CaseStatus({ status }: { status: CaseStatus }) {
  const { t } = useTranslation(casesI18n);
  const { caseStatusVariant, tKey } = caseStatusMapping[status];

  return (
    <Tooltip.Default content={t(tKey)}>
      <div
        className={cx(
          caseStatusVariant,
          'text-s flex h-6 w-6 items-center justify-center rounded font-semibold capitalize'
        )}
      >
        {t(tKey)[0]}
      </div>
    </Tooltip.Default>
  );
}

export const caseStatusMapping = {
  open: {
    caseStatusVariant: caseStatusVariants({ color: 'red' }),
    tKey: 'cases:case.status.open',
  },
  investigating: {
    caseStatusVariant: caseStatusVariants({ color: 'blue' }),
    tKey: 'cases:case.status.investigating',
  },
  discarded: {
    caseStatusVariant: caseStatusVariants({ color: 'grey' }),
    tKey: 'cases:case.status.discarded',
  },
  resolved: {
    caseStatusVariant: caseStatusVariants({ color: 'green' }),
    tKey: 'cases:case.status.resolved',
  },
} satisfies Record<
  CaseStatus,
  { caseStatusVariant: string; tKey: ParseKeys<['cases']> }
>;

const statuses = [
  'discarded',
  'investigating',
  'open',
  'resolved',
] satisfies CaseStatus[];
export function useCaseStatuses() {
  const { t } = useTranslation(casesI18n);

  return useMemo(
    () =>
      statuses.map((status) => ({
        value: status,
        label: t(caseStatusMapping[status].tKey),
      })),
    [t]
  );
}
