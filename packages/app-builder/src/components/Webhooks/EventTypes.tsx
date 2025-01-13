import { Highlight } from '@app-builder/components/Highlight';
import { eventTypes } from '@app-builder/models/webhook';
import clsx from 'clsx';
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

  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  const matches = React.useMemo(
    () => matchSorter(eventTypes, deferredSearchValue),
    [deferredSearchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedEventTypes}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
    >
      <FormSelectWithCombobox.Select className={className}>
        {selectedEventTypes.length > 0 ? (
          <EventTypes eventTypes={selectedEventTypes} />
        ) : (
          <span className="text-grey-80 text-s">
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
                <Highlight text={event} query={deferredSearchValue} />
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

export function EventTypes({
  className,
  eventTypes,
}: {
  eventTypes: string[];
  className?: string;
}) {
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
      <div
        className={clsx('flex w-fit flex-wrap items-center gap-1', className)}
      >
        {eventTypes.slice(0, 3).map((event) => (
          <EventType key={event}>{event}</EventType>
        ))}
        {eventTypes.length > 3 ? (
          <div className="text-grey-00 bg-grey-95 flex h-6 items-center rounded-full px-2 text-xs font-normal">
            {`+${eventTypes.length - 3}`}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

function EventType({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grey-95 flex h-6 items-center rounded px-2">
      <span className="text-grey-00 line-clamp-1 text-xs font-normal">
        {children}
      </span>
    </div>
  );
}
