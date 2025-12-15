import type { AuditEventsFilterName } from '@app-builder/queries/audit-events/get-audit-events';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

type AuditEventsFilterLabelProps = { name: AuditEventsFilterName };

export const AuditEventsFilterLabel = ({ name }: AuditEventsFilterLabelProps): ReactNode => {
  const { t } = useTranslation(['settings']);

  // TODO: Add 'table' case when we have an endpoint to list available tables
  return match(name)
    .with('dateRange', () => t('settings:activity_follow_up.filter.date_range'))
    .with('userId', () => t('settings:activity_follow_up.filter.user'))
    .with('apiKeyId', () => t('settings:activity_follow_up.filter.api_key'))
    .with('entityId', () => t('settings:activity_follow_up.table.entity_id'))
    .exhaustive();
};
