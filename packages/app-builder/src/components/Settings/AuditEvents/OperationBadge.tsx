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

  if (!operation) return <span className="text-grey-secondary">-</span>;

  const colorClass = {
    INSERT:
      'bg-green-background-light text-green-primary dark:bg-transparent dark:border-green-light dark:text-green-light',
    UPDATE:
      'bg-yellow-background-light text-yellow-primary dark:bg-transparent dark:border-yellow-light dark:text-yellow-light',
    DELETE: 'bg-red-background-light text-red-primary dark:bg-transparent dark:border-red-light dark:text-red-light',
  }[operation];

  return (
    <span className={clsx('rounded-sm px-2 py-0.5 text-xs font-medium dark:border', colorClass)}>
      {t(operationToTranslationKey[operation])}
    </span>
  );
};
