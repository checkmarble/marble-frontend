import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import clsx from 'clsx';
import { ComponentProps } from 'react';
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
  const language = useFormatLanguage();

  return (
    <span
      className={clsx(
        'text-s inline-flex h-10 flex-row items-center gap-1',
        className,
      )}
      {...props}
    >
      <Trans
        t={t}
        i18nKey={'common:from_to'}
        components={{ Date: <span className="font-semibold" /> }}
        values={{
          start_date: formatDateTime(new Date(+startDate), {
            language,
            timeStyle: undefined,
          }),
          end_date: formatDateTime(new Date(+endDate), {
            language,
            timeStyle: undefined,
          }),
        }}
      />
    </span>
  );
};
