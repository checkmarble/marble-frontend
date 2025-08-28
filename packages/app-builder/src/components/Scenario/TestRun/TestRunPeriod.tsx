import { useFormatDateTimeString } from '@app-builder/utils/format';
import clsx from 'clsx';
import { type ComponentProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const TestRunPeriod = ({
  startDate,
  endDate,
  className,
  ...props
}: {
  startDate: string;
  endDate: string;
} & ComponentProps<'span'>) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const formatDateTime = useFormatDateTimeString();

  return (
    <span
      className={clsx('text-s inline-flex h-10 flex-row items-center gap-1', className)}
      {...props}
    >
      <Trans
        t={t}
        i18nKey={'common:from_to'}
        components={{
          // Hack because remix cannot handle properly hydratation of Date
          Date: <time suppressHydrationWarning className="font-semibold" />,
        }}
        values={{
          start_date: formatDateTime(startDate, { dateStyle: 'short' }),
          end_date: formatDateTime(endDate, { dateStyle: 'short' }),
        }}
      />
    </span>
  );
};
