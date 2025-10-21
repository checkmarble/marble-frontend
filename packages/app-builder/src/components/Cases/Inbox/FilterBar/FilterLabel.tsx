import type { Filters } from '@app-builder/queries/cases/get-cases';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

type InboxFilterLabelProps = { name: keyof Filters };

export const InboxFilterLabel = ({ name }: InboxFilterLabelProps) => {
  const { t } = useTranslation(['cases']);

  return match(name)
    .with('name', () => t('cases:case.name'))
    .with('statuses', () => t('cases:filter.closed_only.label'))
    .with('includeSnoozed', () => t('cases:filter.include_snoozed.label'))
    .with('excludeAssigned', () => t('cases:filter.exclude_assigned.label'))
    .with('assignee', () => t('cases:filter.assignee.label'))
    .with('dateRange', () => t('cases:case.date'))
    .exhaustive();
};
