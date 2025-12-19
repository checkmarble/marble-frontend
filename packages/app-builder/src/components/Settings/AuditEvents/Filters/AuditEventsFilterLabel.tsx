import type { AuditEventsFilterName } from '@app-builder/queries/audit-events/get-audit-events';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

type AuditEventsFilterLabelProps = { name: AuditEventsFilterName };

export const AuditEventsFilterLabel = ({ name }: AuditEventsFilterLabelProps): ReactNode => {
  const { t } = useTranslation(['settings']);

  // TODO: Add 'table' case when we have an endpoint to list available tables
  return match(name)
    .with('dateRange', () => t('settings:audit.filter.date_range'))
    .with('userId', () => t('settings:audit.filter.user'))
    .with('apiKeyId', () => t('settings:audit.filter.api_key'))
    .with('entityId', () => t('settings:audit.table.entity_id'))
    .exhaustive();
};
