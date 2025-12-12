import { type AuditEventOperation } from '@app-builder/models/audit-event';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface OperationBadgeProps {
  operation: AuditEventOperation | null;
}

const operationToTranslationKey = {
  INSERT: 'settings:activity_follow_up.operation.insert',
  UPDATE: 'settings:activity_follow_up.operation.update',
  DELETE: 'settings:activity_follow_up.operation.delete',
} as const;

export function OperationBadge({ operation }: OperationBadgeProps) {
  const { t } = useTranslation(['settings']);

  if (!operation) return <span className="text-grey-50">-</span>;

  const colorClass = {
    INSERT: 'bg-green-94 text-green-38',
    UPDATE: 'bg-yellow-94 text-yellow-50',
    DELETE: 'bg-red-95 text-red-47',
  }[operation];

  return (
    <span className={clsx('rounded-sm px-2 py-0.5 text-xs font-medium', colorClass)}>
      {t(operationToTranslationKey[operation])}
    </span>
  );
}
