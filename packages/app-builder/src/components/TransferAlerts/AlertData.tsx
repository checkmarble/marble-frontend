import { type TransferAlertStatus } from '@app-builder/models/transfer-alert';
import {
  formatDateRelative,
  useFormatDateTimeString,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { Callout } from '../Callout';
import { alertsI18n } from './alerts-i18n';

interface AlertDataProps {
  alert: {
    createdAt: string;
    status: TransferAlertStatus;
    message: string;
    transferEndToEndId: string;
    beneficiaryIban: string;
    senderIban: string;
  };
}

export function AlertData({ alert }: AlertDataProps) {
  const { t } = useTranslation(alertsI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTimeString();

  return (
    <div className="flex flex-col gap-8">
      <Callout variant="outlined" color="red">
        <div className="flex flex-col gap-2">
          <Tooltip.Default
            content={
              <span className="text-grey-00 text-s">
                {formatDateTime(alert.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            }
          >
            <span className="text-grey-50 text-s w-fit first-letter:capitalize">
              {formatDateRelative(alert.createdAt, {
                language,
              })}
            </span>
          </Tooltip.Default>

          <span className="whitespace-pre-wrap">{alert.message}</span>
        </div>
      </Callout>

      <div className="grid w-full grid-cols-[max-content_1fr] gap-x-8 gap-y-2">
        <span className="text-grey-50 text-s">
          {t('transfercheck:alert.transfer_end_to_end_id')}
        </span>
        <span className="text-grey-00 text-s">{alert.transferEndToEndId}</span>

        <span className="text-grey-50 text-s">{t('transfercheck:alert.sender_iban')}</span>
        <span className="text-grey-00 text-s">{alert.senderIban}</span>

        <span className="text-grey-50 text-s">{t('transfercheck:alert.beneficiary_iban')}</span>
        <span className="text-grey-00 text-s">{alert.beneficiaryIban}</span>
      </div>
    </div>
  );
}
