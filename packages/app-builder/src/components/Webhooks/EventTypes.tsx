import { Highlight } from '@app-builder/components/Highlight';
import { eventTypes } from '@app-builder/models/webhook';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Tooltip } from 'ui-design-system';

import { FormSelectWithCombobox } from '../Form/FormSelectWithCombobox';

export function FormSelectEvents({
  selectedEventTypes,
  className,
}: {
  selectedEventTypes: string[];
  className?: string;
}) {
  const { t } = useTranslation(['settings']);

  const [value, setSearchValue] = React.useState('');
  const searchValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () => matchSorter(eventTypes, searchValue),
    [searchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValues={selectedEventTypes}
      searchValue={value}
      onSearchValueChange={setSearchValue}
    >
      <FormSelectWithCombobox.Select className={className}>
        {selectedEventTypes.length > 0 ? (
          <EventTypes eventTypes={selectedEventTypes} />
        ) : (
          <span className="text-grey-25 text-s">
            {t('settings:webhooks.event_types.placeholder')}
          </span>
        )}
        <FormSelectWithCombobox.Arrow />
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.map((event) => (
            <FormSelectWithCombobox.ComboboxItem key={event} value={event}>
              <EventType>
                <Highlight text={event} query={searchValue} />
              </EventType>
            </FormSelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-grey-50 flex items-center justify-center p-2">
              {t('settings:webhooks.event_types.empty_matches')}
            </p>
          ) : null}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
}

export function EventTypes({ eventTypes }: { eventTypes: string[] }) {
  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-sm flex-wrap gap-1">
          {eventTypes.map((event) => (
            <EventType key={event}>{event}</EventType>
          ))}
        </div>
      }
    >
      <div className="flex w-fit flex-wrap items-center gap-1">
        {eventTypes.slice(0, 3).map((event) => (
          <EventType key={event}>{event}</EventType>
        ))}
        {eventTypes.length > 3 ? (
          <div className="text-grey-100 bg-grey-05 flex h-6 items-center rounded-full px-2 text-xs font-normal">
            {`+${eventTypes.length - 3}`}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

function EventType({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grey-05 flex h-6 items-center rounded px-2">
      <span className="text-grey-100 line-clamp-1 text-xs font-normal">
        {children}
      </span>
    </div>
  );
}
