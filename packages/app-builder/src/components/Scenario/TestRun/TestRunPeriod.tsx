import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

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
      {t('common:from')}
      <span className="font-semibold">
        {formatDateTime(new Date(+startDate), {
          language,
          timeStyle: undefined,
        })}
      </span>
      {t('common:to')}
      <span className="font-semibold">
        {formatDateTime(new Date(+endDate), { language, timeStyle: undefined })}
      </span>
    </span>
  );
};
