import type { SanctionCheckError } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function SanctionCheckErrors({ sanctionCheck }: { sanctionCheck: SanctionCheckError }) {
  const { t } = useTranslation(['sanctions']);

  return (
    <div className="text-s bg-red-95 text-red-47 flex items-center gap-4 rounded p-4">
      <Icon icon="error" className="size-5 shrink-0" />
      <div className="flex flex-col">
        <span className="font-semibold">
          {t('sanctions:error_label', {
            count: sanctionCheck.errorCodes.length,
          })}
        </span>
        {sanctionCheck.errorCodes.map((errorCode) => (
          <div key={errorCode}>{t(`sanctions:error.${errorCode}`)}</div>
        ))}
      </div>
    </div>
  );
}
