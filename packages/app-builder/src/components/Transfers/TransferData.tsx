import {
  formatDateTime,
  formatNumber,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { Trans, useTranslation } from 'react-i18next';

import { Callout } from '../Callout';
import { transfersI18n } from './transfers-i18n';

interface TransferDataProps {
  beneficiaryBic: string;
  beneficiaryIban: string;
  beneficiaryName: string;
  createdAt: string;
  currency: string;
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
                  className="border-grey-10 cursor-pointer select-none rounded-sm border px-1"
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
        <span className="text-grey-50 text-s">Label</span>
        <span className="text-grey-100 text-s">{props.label}</span>

        <span className="text-grey-50 text-s">Currency</span>
        <span className="text-grey-100 text-s">{props.currency}</span>

        <span className="text-grey-50 text-s">Value</span>
        <span className="text-grey-100 text-s">
          {formatNumber(props.value, { language })}
        </span>
      </div>

      <div className="grid w-full grid-cols-[max-content_1fr] gap-2">
        <span className="text-grey-50 text-s">requested at</span>
        <span className="text-grey-100 text-s">
          {formatDateTime(props.transferRequestedAt, {
            language,
            timeZone: props.timezone,
          })}
        </span>

        <span className="text-grey-50 text-s">created at</span>
        <span className="text-grey-100 text-s">
          {formatDateTime(props.createdAt, {
            language,
            timeZone: props.timezone,
          })}
        </span>

        <span className="text-grey-50 text-s">updated at</span>
        <span className="text-grey-100 text-s">
          {formatDateTime(props.updatedAt, {
            language,
            timeZone: props.timezone,
          })}
        </span>
      </div>

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
              Account ID
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.senderAccountId}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              Account Type
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.senderAccountType}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              BIC
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.senderBic}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              Device
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.senderDevice}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              IP
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.senderIp}
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
              BIC
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.beneficiaryBic}
            </td>
          </tr>
          <tr>
            <td className="text-grey-50 text-s border-grey-10 border-t p-4">
              Name
            </td>
            <td className="text-grey-100 text-s border-grey-10 border-t p-4">
              {props.beneficiaryName}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
