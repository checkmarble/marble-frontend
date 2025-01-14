import {
  transferAlerStatuses,
  type TransferAlertStatus,
} from '@app-builder/models/transfer-alert';
import { cva, cx, type VariantProps } from 'class-variance-authority';
import { type ParseKeys } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { alertsI18n } from './alerts-i18n';

export const alertStatusVariants = cva(undefined, {
  variants: {
    color: {
      red: 'text-red-47',
      blue: 'text-blue-58',
      grey: 'text-grey-50',
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
      className: 'bg-red-95',
    },
    {
      variant: 'contained',
      color: 'blue',
      className: 'bg-blue-96',
    },
    {
      variant: 'contained',
      color: 'grey',
      className: 'bg-grey-90',
    },
  ],
});

export function AlertStatus({
  status,
  className,
}: {
  status: TransferAlertStatus;
  className?: string;
}) {
  const { t } = useTranslation(alertsI18n);
  const { color, tKey } = alertStatusMapping[status];

  return (
    <Tooltip.Default content={t(tKey)}>
      <div
        className={cx(
          alertStatusVariants({ color, variant: 'contained' }),
          'text-s flex size-6 items-center justify-center rounded font-semibold capitalize',
          className,
        )}
      >
        {t(tKey)[0]}
      </div>
    </Tooltip.Default>
  );
}

export const alertStatusMapping = {
  pending: {
    color: 'red',
    tKey: 'transfercheck:alert_status.pending',
  },
  acknowledged: {
    color: 'blue',
    tKey: 'transfercheck:alert_status.acknowledged',
  },
  archived: {
    color: 'grey',
    tKey: 'transfercheck:alert_status.archived',
  },
} satisfies Record<
  TransferAlertStatus,
  {
    color: VariantProps<typeof alertStatusVariants>['color'];
    tKey: ParseKeys<['transfercheck']>;
  }
>;

export function useAlertStatuses() {
  const { t } = useTranslation(alertsI18n);

  return React.useMemo(
    () =>
      transferAlerStatuses.map((status) => ({
        value: status,
        label: t(alertStatusMapping[status].tKey),
      })),
    [t],
  );
}
