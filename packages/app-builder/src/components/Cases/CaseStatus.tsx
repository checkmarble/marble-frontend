import { type CaseStatus } from '@app-builder/models/cases';
import { cva, cx, type VariantProps } from 'class-variance-authority';
import { type ParseKeys } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export const caseStatusVariants = cva(undefined, {
  variants: {
    color: {
      red: 'text-red-100',
      blue: 'text-blue-100',
      grey: 'text-grey-50',
      green: 'text-green-100',
    },
    variant: {
      text: undefined,
      contained: undefined,
    },
  },
  compoundVariants: [
    {
      variant: 'contained',
      color: 'red',
      className: 'bg-red-10',
    },
    {
      variant: 'contained',
      color: 'blue',
      className: 'bg-blue-10',
    },
    {
      variant: 'contained',
      color: 'grey',
      className: 'bg-grey-10',
    },
    {
      variant: 'contained',
      color: 'green',
      className: 'bg-green-10',
    },
  ],
});

export function CaseStatus({ status }: { status: CaseStatus }) {
  const { t } = useTranslation(casesI18n);
  const { color, tKey } = caseStatusMapping[status];

  return (
    <Tooltip.Default content={t(tKey)}>
      <div
        className={cx(
          caseStatusVariants({ color, variant: 'contained' }),
          'text-s flex size-6 items-center justify-center rounded font-semibold capitalize',
        )}
      >
        {t(tKey)[0]}
      </div>
    </Tooltip.Default>
  );
}

export const caseStatusMapping = {
  open: {
    color: 'red',
    tKey: 'cases:case.status.open',
  },
  investigating: {
    color: 'blue',
    tKey: 'cases:case.status.investigating',
  },
  discarded: {
    color: 'grey',
    tKey: 'cases:case.status.discarded',
  },
  resolved: {
    color: 'green',
    tKey: 'cases:case.status.resolved',
  },
} satisfies Record<
  CaseStatus,
  {
    color: VariantProps<typeof caseStatusVariants>['color'];
    tKey: ParseKeys<['cases']>;
  }
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
    [t],
  );
}
