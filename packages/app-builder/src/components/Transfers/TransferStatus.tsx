import { type TransferStatus } from '@app-builder/models/transfer';
import { CreateAlert } from '@app-builder/routes/transfercheck+/ressources+/alert.create';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { Callout } from '../Callout';
import { linkClasses } from '../ExternalLink';
import { transfersI18n } from './transfers-i18n';

interface TransferStatusButtonProps {
  value: TransferStatus;
  name: string;
  defaultChecked: boolean;
}

const transferStatusRadioButtonVariants = cva(
  'border-grey-10 flex cursor-pointer rounded border p-4 font-medium transition peer-focus:outline peer-focus:outline-2 peer-focus:outline-purple-100',
  {
    variants: {
      status: {
        neutral: 'bg-green-10 hover:bg-green-05 text-green-100',
        suspected_fraud: 'bg-yellow-10 hover:bg-yellow-05 text-yellow-100',
        confirmed_fraud: 'bg-red-10 hover:bg-red-05 text-red-100',
      },
    },
  },
);

export function TransferStatusRadioButton({
  value,
  name,
  defaultChecked,
}: TransferStatusButtonProps) {
  const { t } = useTranslation(transfersI18n);

  return (
    <div className="relative flex">
      <input
        id={value}
        className="peer appearance-none"
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
      />
      <label
        htmlFor={value}
        className={transferStatusRadioButtonVariants({ status: value })}
      >
        {t(`transfercheck:transfer_detail.status.${value}`)}
      </label>
      <span className="pointer-events-none absolute -inset-px rounded border-2 border-transparent transition-colors peer-checked:border-purple-100" />
      <Icon
        icon="tick"
        className="text-grey-00 absolute right-0 top-0 hidden size-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-purple-100 peer-checked:block"
      />
    </div>
  );
}

interface TransferStatusAlertProps {
  alertId?: string;
  transferId: string;
  transferStatus: TransferStatus;
  isBeneficiaryPartner: boolean;
}

export function TransferStatusAlert({
  alertId,
  transferId,
  transferStatus,
  isBeneficiaryPartner,
}: TransferStatusAlertProps) {
  const { t } = useTranslation(transfersI18n);

  if (alertId) {
    return (
      <Callout variant="outlined" className="w-fit">
        <div className="whitespace-pre-wrap">
          <Trans
            t={t}
            i18nKey="transfercheck:transfer_detail.transfer_status.alert_exists"
            components={{
              AlertLink: (
                <Link
                  to={getRoute('/transfercheck/alerts/sent/:alertId', {
                    alertId,
                  })}
                  className={linkClasses}
                />
              ),
            }}
          />
        </div>
      </Callout>
    );
  }

  if (!isBeneficiaryPartner) {
    return (
      <Callout variant="outlined" className="w-fit">
        {t('transfercheck:transfer_detail.transfer_status.alert_not_partner')}
      </Callout>
    );
  }

  switch (transferStatus) {
    case 'neutral':
      return (
        <Callout variant="outlined" className="w-fit">
          {t('transfercheck:transfer_detail.transfer_status.neutral')}
        </Callout>
      );
    case 'suspected_fraud':
    case 'confirmed_fraud':
      return (
        <Callout variant="outlined" className="w-fit">
          <div className="whitespace-pre-wrap">
            <Trans
              t={t}
              i18nKey="transfercheck:transfer_detail.transfer_status.create_alert"
              components={{
                CreateAlert: <CreateAlertButton transferId={transferId} />,
              }}
            />
          </div>
        </Callout>
      );
  }
}

interface CreateAlertButtonProps {
  transferId: string;
  children?: React.ReactElement;
}

function CreateAlertButton({ transferId, children }: CreateAlertButtonProps) {
  return (
    <CreateAlert defaultValue={{ transferId }}>
      <button className={linkClasses}>{children}</button>
    </CreateAlert>
  );
}
