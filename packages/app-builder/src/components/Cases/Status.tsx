import { clsx } from 'clsx';
import { type ParseKeys } from 'i18next';
import { type CaseStatus } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export function Status({ status }: { status: CaseStatus }) {
  const { t } = useTranslation(casesI18n);
  const { color, tKey } = caseStatusMapping[status];

  return (
    <Tooltip.Default content={t(tKey)}>
      <div
        className={clsx(
          {
            'bg-red-10 text-red-100': color === 'red',
            'bg-blue-10 text-blue-100': color === 'blue',
            'bg-grey-10 text-grey-50': color === 'grey',
            'bg-green-10 text-green-100': color === 'green',
          },
          'flex h-6 w-6 items-center justify-center rounded font-semibold capitalize'
        )}
      >
        {t(tKey)[0]}
      </div>
    </Tooltip.Default>
  );
}

const caseStatusMapping = {
  open: { color: 'red', tKey: 'cases:case.status.open' },
  investigating: { color: 'blue', tKey: 'cases:case.status.investigating' },
  discarded: { color: 'grey', tKey: 'cases:case.status.discarded' },
  resolved: { color: 'green', tKey: 'cases:case.status.resolved' },
} satisfies Record<CaseStatus, { color: string; tKey: ParseKeys<['cases']> }>;

const statuses = [
  'discarded',
  'investigating',
  'open',
  'resolved',
] satisfies CaseStatus[];
export function useStatuses() {
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
