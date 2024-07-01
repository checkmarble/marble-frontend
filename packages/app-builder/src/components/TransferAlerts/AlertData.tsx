import { type TransferAlert } from '@app-builder/models/transfer-alert';
import {
  formatDateRelative,
  formatDateTime,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { Trans, useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { Callout } from '../Callout';
import { alertsI18n } from './alerts-i18n';

interface AlertDataProps {
  alert: TransferAlert;
}

//TODO(alert): choose one of the two components below and add translation keys
export function AlertData({ alert }: AlertDataProps) {
  const { t } = useTranslation(alertsI18n);
  const language = useFormatLanguage();
  const getCopyToClipboardProps = useGetCopyToClipboard();

  return (
    <div className="grid grid-cols-2 gap-8">
      <Callout className="col-span-2" variant="outlined" color="red">
        <div className="flex flex-col gap-2">
          <Tooltip.Default
            content={
              <span className="text-grey-100 text-s">
                {formatDateTime(alert.createdAt, {
                  language,
                })}
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

      <table className="border-grey-10 h-fit w-full table-auto border-separate border-spacing-0 overflow-hidden rounded-lg border">
        <thead>
          <tr>
            <th className="bg-grey-02 h-12 px-4" colSpan={2}>
              Sender
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              IBAN
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {alert.beneficiaryIban}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="border-grey-10 h-fit w-full table-auto border-separate border-spacing-0 overflow-hidden rounded-lg border">
        <thead>
          <tr>
            <th className="bg-grey-02 h-12 px-4" colSpan={2}>
              Beneficiary
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              IBAN
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {alert.beneficiaryIban}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="col-span-2 whitespace-pre-wrap">
        <Trans
          t={t}
          i18nKey="transfercheck:alert_detail.alert_data.transfer_id"
          components={{
            TransferIdValue: (
              <code
                className="border-grey-10 cursor-pointer select-none rounded-sm border px-1"
                {...getCopyToClipboardProps(alert.transferEndToEndId)}
              />
            ),
          }}
          values={{
            transferEndToEndId: alert.transferEndToEndId,
          }}
        />
      </p>
    </div>
  );
}

export function AlertData2({ alert }: AlertDataProps) {
  const language = useFormatLanguage();

  return (
    <div className="flex flex-col gap-8">
      <Callout variant="outlined" color="red">
        <div className="flex flex-col gap-2">
          <Tooltip.Default
            content={
              <span className="text-grey-100 text-s">
                {formatDateTime(alert.createdAt, {
                  language,
                })}
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
        <span className="text-grey-50 text-s">Transfer end to end ID</span>
        <span className="text-grey-100 text-s">{alert.transferEndToEndId}</span>

        <span className="text-grey-50 text-s">Sender IBAN</span>
        <span className="text-grey-100 text-s">{alert.senderIban}</span>

        <span className="text-grey-50 text-s">Beneficiary IBAN</span>
        <span className="text-grey-100 text-s">{alert.beneficiaryIban}</span>
      </div>
    </div>
  );
}
