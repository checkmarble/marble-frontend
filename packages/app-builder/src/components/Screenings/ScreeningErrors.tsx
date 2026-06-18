import { type ScreeningError } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function ScreeningErrors({ screening }: { screening: ScreeningError }) {
  const { t } = useTranslation(['screenings']);

  return (
    <div className="text-s bg-red-background text-red-primary flex items-center gap-md rounded-sm p-md">
      <Icon icon="error" className="size-5 shrink-0" />
      <div className="flex flex-col">
        <span className="font-semibold">
          {t('screenings:error_label', {
            count: screening.errorCodes.length,
            name: screening.config.name,
          })}
        </span>
        {screening.errorCodes.map((errorCode) => (
          <div key={errorCode}>{t(`screenings:error.${errorCode}`)}</div>
        ))}
      </div>
    </div>
  );
}
