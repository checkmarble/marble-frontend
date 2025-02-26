import { type CaseStatus } from '@app-builder/models/cases';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ParseKeys } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export const caseStatusVariants = cva('inline-flex items-center justify-center rounded shrink-0', {
  variants: {
    color: {
      red: 'text-red-47 bg-red-95',
      blue: 'text-blue-58 bg-blue-96',
      grey: 'text-grey-50 bg-grey-90',
      green: 'text-green-38 bg-green-94',
    },
    size: {
      small: undefined,
      big: undefined,
    },
    type: {
      'first-letter': 'isolate capitalize text-s font-medium',
      full: 'px-2 w-fit capitalize text-s font-semibold',
    },
  },
  compoundVariants: [
    {
      size: 'small',
      type: 'full',
      className: 'h-6',
    },
    {
      size: 'big',
      type: 'full',
      className: 'h-10',
    },
    {
      size: 'small',
      type: 'first-letter',
      className: 'size-6',
    },
    {
      size: 'big',
      type: 'first-letter',
      className: 'size-8',
    },
  ],
});

export function CaseStatus({
  status,
  size,
  type,
}: {
  status: CaseStatus;
  size?: VariantProps<typeof caseStatusVariants>['size'];
  type?: VariantProps<typeof caseStatusVariants>['type'];
}) {
  const { t } = useTranslation(casesI18n);
  const { color, tKey } = caseStatusMapping[status];
  const caseStatusLetter = t(tKey);

  if (type === 'full') {
    return (
      <div className={caseStatusVariants({ color, size, type: 'full' })}>{caseStatusLetter}</div>
    );
  }

  return (
    <Tooltip.Default
      content={
        <div className={caseStatusVariants({ color, size: 'big', type: 'full' })}>
          {caseStatusLetter}
        </div>
      }
    >
      <div className={caseStatusVariants({ color, size, type: 'first-letter' })}>
        {caseStatusLetter[0]}
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

const statuses = ['discarded', 'investigating', 'open', 'resolved'] satisfies CaseStatus[];
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
