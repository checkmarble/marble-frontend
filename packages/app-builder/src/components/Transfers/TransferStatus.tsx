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
  onChange?: (value: TransferStatus) => void;
  onBlur?: () => void;
}

const transferStatusRadioButtonVariants = cva(
  'border-grey-90 flex cursor-pointer rounded border p-4 font-medium transition peer-focus:outline peer-focus:outline-2 peer-focus:outline-purple-65',
  {
    variants: {
      status: {
        neutral: 'bg-green-94 hover:bg-green-94 text-green-38',
        suspected_fraud: 'bg-yellow-90 hover:bg-yellow-90 text-yellow-50',
        confirmed_fraud: 'bg-red-95 hover:bg-red-95 text-red-47',
      },
    },
  },
);

export function TransferStatusRadioButton({
  value,
  name,
  defaultChecked,
  onChange,
  onBlur,
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
        onChange={(e) => onChange?.(e.currentTarget.value as typeof value)}
        onBlur={onBlur}
        defaultChecked={defaultChecked}
      />
      <label htmlFor={value} className={transferStatusRadioButtonVariants({ status: value })}>
        {t(`transfercheck:transfer_detail.status.${value}`)}
      </label>
      <span className="peer-checked:border-purple-65 pointer-events-none absolute -inset-px rounded border-2 border-transparent transition-colors" />
      <Icon
        icon="tick"
        className="text-grey-100 bg-purple-65 absolute right-0 top-0 hidden size-4 -translate-y-1/2 translate-x-1/2 rounded-full peer-checked:block"
      />
    </div>
  );
}

interface TransferStatusAlertProps {
  alertId?: string;
  transferId: string;
  transferStatus: TransferStatus;
  beneficiaryInNetwork: boolean;
}

export function TransferStatusAlert({
  alertId,
  transferId,
  transferStatus,
  beneficiaryInNetwork,
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

  if (!beneficiaryInNetwork) {
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
