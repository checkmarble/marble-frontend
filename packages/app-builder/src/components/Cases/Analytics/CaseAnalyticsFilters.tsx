import type { Inbox } from '@app-builder/models/inbox';
import type { User } from '@app-builder/models/user';
import { type DateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type SelectOption, SelectV2 } from 'ui-design-system';

import { CaseAnalyticsDateRangeMenu } from './CaseAnalyticsDateRangeMenu';

const ALL_VALUE = '__all__';

interface CaseAnalyticsFiltersProps {
  dateRange: DateRangeFilterType;
  onDateRangeChange: (dateRange: NonNullable<DateRangeFilterType>) => void;
  inboxId: string | undefined;
  onInboxIdChange: (inboxId: string | undefined) => void;
  inboxes: Inbox[];
  userId: string | undefined;
  onUserIdChange: (userId: string | undefined) => void;
  users: User[];
}

export function CaseAnalyticsFilters({
  dateRange,
  onDateRangeChange,
  inboxId,
  onInboxIdChange,
  inboxes,
  userId,
  onUserIdChange,
  users,
}: CaseAnalyticsFiltersProps) {
  const { t } = useTranslation(['cases']);

  const inboxOptions = useMemo<SelectOption<string>[]>(
    () => [
      { label: t('cases:analytics.filters.all_inboxes'), value: ALL_VALUE },
      ...inboxes.map((inbox) => ({ label: inbox.name, value: inbox.id })),
    ],
    [inboxes, t],
  );

  const userOptions = useMemo<SelectOption<string>[]>(() => {
    const selectedInbox = inboxId ? inboxes.find((i) => i.id === inboxId) : undefined;
    const inboxUserIds = selectedInbox ? new Set(selectedInbox.users.map((u) => u.userId)) : null;
    const filteredUsers = inboxUserIds ? users.filter((u) => inboxUserIds.has(u.userId)) : users;

    return [
      { label: t('cases:analytics.filters.all_users'), value: ALL_VALUE },
      ...filteredUsers.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.userId,
      })),
    ];
  }, [users, inboxes, inboxId, t]);

  const handleInboxChange = (val: string) => {
    onInboxIdChange(val === ALL_VALUE ? undefined : val);
    // Reset user filter when inbox changes since available users change
    onUserIdChange(undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-v2-md">
      <CaseAnalyticsDateRangeMenu value={dateRange} onChange={onDateRangeChange} />

      <SelectV2
        options={inboxOptions}
        value={inboxId ?? ALL_VALUE}
        onChange={handleInboxChange}
        placeholder={t('cases:analytics.filters.all_inboxes')}
        className="w-48"
      />

      <SelectV2
        options={userOptions}
        value={userId ?? ALL_VALUE}
        onChange={(val) => onUserIdChange(val === ALL_VALUE ? undefined : val)}
        placeholder={t('cases:analytics.filters.all_users')}
        className="w-48"
      />
    </div>
  );
}
