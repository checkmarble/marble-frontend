import { type ScreeningError } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function ScreeningErrors({ screening }: { screening: ScreeningError }) {
  const { t } = useTranslation(['sanctions']);

  return (
    <div className="text-s bg-red-95 text-red-47 flex items-center gap-4 rounded-sm p-4">
      <Icon icon="error" className="size-5 shrink-0" />
      <div className="flex flex-col">
        <span className="font-semibold">
          {t('sanctions:error_label', {
            count: screening.errorCodes.length,
          })}
        </span>
        {screening.errorCodes.map((errorCode) => (
          <div key={errorCode}>{t(`sanctions:error.${errorCode}`)}</div>
        ))}
      </div>
    </div>
  );
}
