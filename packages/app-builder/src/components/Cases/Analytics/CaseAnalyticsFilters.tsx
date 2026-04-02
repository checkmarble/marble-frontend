import type { Inbox } from '@app-builder/models/inbox';
import type { User } from '@app-builder/models/user';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type SelectOption, SelectV2 } from 'ui-design-system';

const ALL_VALUE = '__all__';

interface CaseAnalyticsFiltersProps {
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  inboxId: string | undefined;
  onInboxIdChange: (inboxId: string | undefined) => void;
  inboxes: Inbox[];
  userId: string | undefined;
  onUserIdChange: (userId: string | undefined) => void;
  users: User[];
}

export function CaseAnalyticsFilters({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
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
      <div className="flex items-center gap-v2-xs">
        <label className="text-s text-grey-secondary">{t('cases:analytics.filters.from')}</label>
        <input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border-grey-border bg-surface-card text-s rounded-v2-sm border px-v2-sm py-v2-xs"
        />
      </div>

      <div className="flex items-center gap-v2-xs">
        <label className="text-s text-grey-secondary">{t('cases:analytics.filters.to')}</label>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border-grey-border bg-surface-card text-s rounded-v2-sm border px-v2-sm py-v2-xs"
        />
      </div>

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
