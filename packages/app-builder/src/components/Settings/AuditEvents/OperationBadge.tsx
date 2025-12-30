import { type AuditEventOperation } from '@app-builder/models/audit-event';
import clsx from 'clsx';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

interface OperationBadgeProps {
  operation: AuditEventOperation | null;
}

const operationToTranslationKey = {
  INSERT: 'settings:audit.operation.insert',
  UPDATE: 'settings:audit.operation.update',
  DELETE: 'settings:audit.operation.delete',
} as const;

export const OperationBadge: FunctionComponent<OperationBadgeProps> = ({ operation }) => {
  const { t } = useTranslation(['settings']);

  if (!operation) return <span className="text-grey-placeholder">-</span>;

  const colorClass = {
    INSERT: 'bg-green-94 text-green-38',
    UPDATE: 'bg-yellow-94 text-yellow-50',
    DELETE: 'bg-red-background text-red-primary',
  }[operation];

  return (
    <span className={clsx('rounded-sm px-2 py-0.5 text-xs font-medium', colorClass)}>
      {t(operationToTranslationKey[operation])}
    </span>
  );
};
