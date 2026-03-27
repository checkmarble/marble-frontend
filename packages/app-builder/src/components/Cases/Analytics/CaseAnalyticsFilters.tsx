import type { TimeBucket } from '@app-builder/models/analytics/case-analytics';
import type { Inbox } from '@app-builder/models/inbox';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

import { TimeBucketToggle } from './TimeBucketToggle';

interface CaseAnalyticsFiltersProps {
  timeBucket: TimeBucket;
  onTimeBucketChange: (bucket: TimeBucket) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  inboxId: string | undefined;
  onInboxIdChange: (inboxId: string | undefined) => void;
  inboxes: Inbox[];
}

export function CaseAnalyticsFilters({
  timeBucket,
  onTimeBucketChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  inboxId,
  onInboxIdChange,
  inboxes,
}: CaseAnalyticsFiltersProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="flex flex-wrap items-center gap-v2-md">
      <TimeBucketToggle value={timeBucket} onChange={onTimeBucketChange} />

      <div className="flex items-center gap-v2-xs">
        <label className="text-s text-grey-secondary">{t('cases:analytics.filters.from')}</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border-grey-border bg-surface-card text-s rounded-v2-sm border px-v2-sm py-v2-xs"
        />
      </div>

      <div className="flex items-center gap-v2-xs">
        <label className="text-s text-grey-secondary">{t('cases:analytics.filters.to')}</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border-grey-border bg-surface-card text-s rounded-v2-sm border px-v2-sm py-v2-xs"
        />
      </div>

      <Select.Root
        value={inboxId ?? '__all__'}
        onValueChange={(val) => onInboxIdChange(val === '__all__' ? undefined : val)}
      >
        <Select.Trigger className="w-48">
          <Select.Value placeholder={t('cases:analytics.filters.all_inboxes')} />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="__all__">{t('cases:analytics.filters.all_inboxes')}</Select.Item>
          {inboxes.map((inbox) => (
            <Select.Item key={inbox.id} value={inbox.id}>
              {inbox.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}
