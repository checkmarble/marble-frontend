import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import type { AuditEventsFilterName } from './filters';

type AuditEventsFilterLabelProps = { name: AuditEventsFilterName };

export const AuditEventsFilterLabel = ({ name }: AuditEventsFilterLabelProps): ReactNode => {
  const { t } = useTranslation(['settings']);

  return match(name)
    .with('dateRange', () => t('settings:activity_follow_up.filter.date_range'))
    .with('table', () => t('settings:activity_follow_up.table.table'))
    .with('entityId', () => t('settings:activity_follow_up.table.entity_id'))
    .exhaustive();
};
