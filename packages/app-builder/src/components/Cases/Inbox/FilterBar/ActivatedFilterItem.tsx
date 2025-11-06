import { QueryEntry } from '@app-builder/hooks/useBase64Query';
import type { Filters, filtersSchema } from '@app-builder/queries/cases/get-cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { formatDateTimeWithoutPresets, formatDuration } from '@app-builder/utils/format';
import { useCallbackRef } from '@marble/shared';
import { differenceInDays } from 'date-fns';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { Avatar, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AssigneeFilterMenuItem } from './AssigneeFilterMenuItem';
import { DateRangeFilterMenu } from './DateRangeFilterMenu';
import { InboxFilterLabel } from './FilterLabel';

const EDITABLE_FILTERS = ['dateRange', 'assignee'] as const satisfies readonly (keyof Filters)[];

type ActivatedFilterItemProps = {
  filter: QueryEntry<typeof filtersSchema>;
  onUpdate: (filters: Partial<Filters>) => void;
  onClear: () => void;
};

export const ActivatedFilterItem = ({ filter, onUpdate, onClear }: ActivatedFilterItemProps) => {
  const [open, setOpen] = useState(false);
  const isEditable = (EDITABLE_FILTERS as readonly string[]).includes(filter[0]);
  const handleClearClick = useCallbackRef((e: MouseEvent) => {
    e.stopPropagation();
    onClear();
  });

  const button = (
    <span className="h-10 bg-purple-98 border border-purple-96 rounded-v2-md p-v2-sm text-default flex items-center gap-v2-xs">
      <span>
        <DisplayFilterValue filter={filter} />
      </span>
      <button type="button" onClick={handleClearClick} className="cursor-pointer">
        <Icon icon="cross" className="size-4" />
      </button>
    </span>
  );

  if (isEditable) {
    return (
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>{button}</MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" sideOffset={4} className="max-h-[600px]">
          <MenuCommand.List>
            <EditFilterContent filter={filter} onUpdate={onUpdate} />
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    );
  }

  return (
    <span className="h-10 bg-purple-98 border border-purple-96 rounded-v2-md p-v2-sm text-default flex items-center gap-v2-xs">
      <span>
        <DisplayFilterValue filter={filter} />
      </span>
      <button type="button" onClick={onClear} className="cursor-pointer">
        <Icon icon="cross" className="size-4" />
      </button>
    </span>
  );
};

type DisplayFilterValueProps = { filter: QueryEntry<typeof filtersSchema> };

const DisplayFilterValue = ({ filter }: DisplayFilterValueProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['filters', 'cases']);

  return match(filter)
    .with(['name', P.string], ([name, value]) => (
      <span>
        <InboxFilterLabel name={name} />: {value}
      </span>
    ))
    .with(['statuses', P.array(P.string)], ([name, value]) => (
      <span>
        <InboxFilterLabel name={name} />
      </span>
    ))
    .with(['includeSnoozed', P.boolean], ([name]) => (
      <span>
        <InboxFilterLabel name={name} />
      </span>
    ))
    .with(['excludeAssigned', P.boolean], ([name]) => (
      <span>
        <InboxFilterLabel name={name} />
      </span>
    ))
    .with(['assignee', P.string], ([name, value]) => (
      <span>
        <InboxFilterLabel name={name} />: <AssigneeFilterValue value={value} />
      </span>
    ))
    .with(['dateRange', P.shape({ type: 'static' })], ([name, value]) => {
      const startDate = formatDateTimeWithoutPresets(value.startDate, { language });
      const endDate = formatDateTimeWithoutPresets(value.endDate, { language });
      const diff = differenceInDays(new Date(value.endDate), new Date(value.startDate));
      const dateDisplay =
        diff <= 1 ? startDate : t('filters:date_range.range_value', { startDate, endDate });

      return (
        <span>
          <InboxFilterLabel name={name} />: {dateDisplay}
        </span>
      );
    })
    .with(['dateRange', P.shape({ type: 'dynamic' })], ([name, value]) => {
      const duration = formatDuration(value.fromNow, language);
      const dateDisplay = t('filters:date_range.duration', { duration });

      return (
        <span>
          <InboxFilterLabel name={name} />: {dateDisplay}
        </span>
      );
    })
    .exhaustive();
};

const AssigneeFilterValue = ({ value }: { value: string }) => {
  const { t } = useTranslation(['cases']);
  const { orgUsers } = useOrganizationUsers();

  const user = orgUsers.find((user) => user.userId === value);

  return (
    <span className="inline-flex items-center gap-v2-xs">
      <Avatar size="xs" firstName={user?.firstName} lastName={user?.lastName} />
      {user ? (
        <span>{`${R.capitalize(user.firstName)} ${R.capitalize(user.lastName)}`}</span>
      ) : (
        <span>{t('cases:case_detail.unknown_user')}</span>
      )}
    </span>
  );
};

type EditFilterContentProps = {
  filter: QueryEntry<typeof filtersSchema>;
  onUpdate: (filters: Partial<Filters>) => void;
};

const EditFilterContent = ({ filter, onUpdate }: EditFilterContentProps) => {
  return match(filter)
    .with(['assignee', P.string], ([name]) => (
      <AssigneeFilterMenuItem onSelect={(userId) => onUpdate({ [name]: userId })} />
    ))
    .with(['dateRange', P.any], ([name]) => (
      <DateRangeFilterMenu onSelect={(value) => onUpdate({ [name]: value })} />
    ))
    .with(['name', P.string], ([name, value]) => null)
    .with(['statuses', P.array(P.string)], ([name, value]) => null)
    .with(['includeSnoozed', P.boolean], ([name]) => null)
    .with(['excludeAssigned', P.boolean], ([name]) => null)
    .exhaustive();
};
