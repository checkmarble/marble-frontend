import { type AuditEventOperation } from '@app-builder/models/audit-event';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, TagProps } from 'ui-design-system';

interface OperationBadgeProps {
  operation: AuditEventOperation | null;
}

const operationToTranslationKey: Record<AuditEventOperation, string> = {
  INSERT: 'settings:audit.operation.insert',
  UPDATE: 'settings:audit.operation.update',
  DELETE: 'settings:audit.operation.delete',
} as const;

const OperationColor: Record<AuditEventOperation, TagProps['color']> = {
  INSERT: 'green',
  UPDATE: 'yellow',
  DELETE: 'red',
} as const;

export const OperationBadge: FunctionComponent<OperationBadgeProps> = ({ operation }) => {
  const { t } = useTranslation(['settings']);

  if (!operation) return <Tag color="grey">-</Tag>;

  return <Tag color={OperationColor[operation]}>{t(operationToTranslationKey[operation])}</Tag>;
};
