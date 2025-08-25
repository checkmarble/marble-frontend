import {
  formatCurrency,
  formatDateTimeWithoutPresets,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { type Currency } from 'dinero.js';
import { Trans, useTranslation } from 'react-i18next';

import { Callout } from '../Callout';
import { transfersI18n } from './transfers-i18n';

interface TransferDataProps {
  beneficiaryBic: string;
  beneficiaryIban: string;
  beneficiaryName: string;
  createdAt: string;
  currency: Currency<number>;
  label: string;
  senderAccountId: string;
  senderAccountType: string;
  senderBic: string;
  senderDevice: string;
  senderIp: string;
  timezone: string;
  partnerTransferId: string;
  transferRequestedAt: string;
  updatedAt: string;
  value: number;
}

export function TransferData(props: TransferDataProps) {
  const { t } = useTranslation(transfersI18n);
  const language = useFormatLanguage();
  const getCopyToClipboardProps = useGetCopyToClipboard();

  return (
    <div className="grid grid-cols-2 gap-8">
      <Callout className="col-span-2" variant="outlined">
        <span className="whitespace-pre text-balance">
          <Trans
            t={t}
            i18nKey="transfercheck:transfer_detail.transfer_data.description"
            components={{
              TransferIdLabel: <code className="select-none" />,
              TransferIdValue: (
                <code
                  className="border-grey-90 cursor-pointer select-none rounded-xs border px-1"
                  {...getCopyToClipboardProps(props.partnerTransferId)}
                />
              ),
            }}
            values={{
              transferId: props.partnerTransferId,
            }}
          />
        </span>
      </Callout>
      <div className="grid w-full grid-cols-[max-content_1fr] gap-2">
        <span className="text-grey-50 text-s first-letter:capitalize">
          {t('transfercheck:transfer_detail.transfer_data.label')}
        </span>
        <span className="text-grey-00 text-s">{props.label}</span>
        <span className="text-grey-50 text-s first-letter:capitalize">
          {t('transfercheck:transfer_detail.transfer_data.currency')}
        </span>
        <span className="text-grey-00 text-s">{props.currency.code}</span>
        <span className="text-grey-50 text-s first-letter:capitalize">
          {t('transfercheck:transfer_detail.transfer_data.value')}
        </span>
        <span className="text-grey-00 text-s">
          {formatCurrency(props.value, {
            language,
            currency: props.currency,
          })}
        </span>
      </div>

      <div className="grid w-full grid-cols-[max-content_1fr] gap-2">
        <span className="text-grey-50 text-s first-letter:capitalize">
          {t('transfercheck:transfer_detail.transfer_data.requested_at')}
        </span>
        <span className="text-grey-00 text-s">
          {formatDateTimeWithoutPresets(props.transferRequestedAt, {
            language,
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: props.timezone,
          })}
        </span>

        <span className="text-grey-50 text-s first-letter:capitalize">
          {t('transfercheck:transfer_detail.transfer_data.created_at')}
        </span>
        <span className="text-grey-00 text-s">
          {formatDateTimeWithoutPresets(props.createdAt, {
            language,
            timeZone: props.timezone,
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </span>

        <span className="text-grey-50 text-s first-letter:capitalize">
          {t('transfercheck:transfer_detail.transfer_data.updated_at')}
        </span>
        <span className="text-grey-00 text-s">
          {formatDateTimeWithoutPresets(props.updatedAt, {
            language,
            timeZone: props.timezone,
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </span>
      </div>

      <table className="border-grey-90 h-fit w-full table-auto border-separate border-spacing-0 overflow-hidden rounded-lg border">
        <thead>
          <tr>
            <th className="bg-grey-98 h-12 px-4 first-letter:capitalize" colSpan={2}>
              {t('transfercheck:transfer_detail.transfer_data.sender')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 first-letter:capitalize">
              {t('transfercheck:transfer_detail.transfer_data.account_id')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">
              {props.senderAccountId}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 first-letter:capitalize">
              {t('transfercheck:transfer_detail.transfer_data.account_type')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">
              {props.senderAccountType}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 capitalize">
              {t('transfercheck:transfer_detail.transfer_data.bic')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">{props.senderBic}</td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 first-letter:capitalize">
              {t('transfercheck:transfer_detail.transfer_data.device')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">
              {props.senderDevice}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 capitalize">
              {t('transfercheck:transfer_detail.transfer_data.ip')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">{props.senderIp}</td>
          </tr>
        </tbody>
      </table>

      <table className="border-grey-90 h-fit w-full table-auto border-separate border-spacing-0 overflow-hidden rounded-lg border">
        <thead>
          <tr>
            <th className="bg-grey-98 h-12 px-4 first-letter:capitalize" colSpan={2}>
              {t('transfercheck:transfer_detail.transfer_data.beneficiary')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 capitalize">
              {t('transfercheck:transfer_detail.transfer_data.bic')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">
              {props.beneficiaryBic}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-90 border-t p-4 first-letter:capitalize">
              {t('transfercheck:transfer_detail.transfer_data.name')}
            </td>
            <td className="text-grey-00 text-s border-grey-90 border-t p-4">
              {props.beneficiaryName}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
