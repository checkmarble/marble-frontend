import { Highlight } from '@app-builder/components/Highlight';
import { eventTypes } from '@app-builder/models/webhook';
import clsx from 'clsx';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { matchSorter } from 'match-sorter';
import { toggle } from 'radash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SelectEvents({
  selectedEventTypes,
  className,
  webhookStatus,
  name,
  onChange,
  onBlur,
  disabled,
}: {
  selectedEventTypes: string[];
  className?: string;
  webhookStatus: FeatureAccessLevelDto;
  disabled?: boolean;
  name?: string;
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
}) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  const matches = React.useMemo(() => matchSorter(eventTypes, deferredSearchValue), [deferredSearchValue]);

  return (
    <MenuCommand.Menu
      persistOnSelect
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearchValue('');
      }}
    >
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton
          name={name}
          disabled={disabled}
          onBlur={onBlur}
          className={clsx('h-auto min-h-10', className)}
        >
          {selectedEventTypes.length > 0 ? (
            <EventTypes eventTypes={selectedEventTypes} />
          ) : (
            <span className="text-grey-disabled text-s">{t('settings:webhooks.event_types.placeholder')}</span>
          )}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} sameWidth className="z-50">
        <MenuCommand.Combobox onValueChange={setSearchValue} />
        <MenuCommand.List>
          {matches.map((event) => {
            const isSelected = selectedEventTypes.includes(event);
            return (
              <MenuCommand.Item
                key={event}
                value={event}
                disabled={webhookStatus === 'restricted' && !event.includes('decision.')}
                onSelect={() => onChange?.(toggle(selectedEventTypes, event))}
              >
                <EventType>
                  <Highlight text={event} query={deferredSearchValue} />
                </EventType>
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
          {matches.length === 0 ? (
            <p className="text-grey-secondary flex items-center justify-center p-sm">
              {t('settings:webhooks.event_types.empty_matches')}
            </p>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

export function EventTypes({ className, eventTypes }: { eventTypes: string[]; className?: string }) {
  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-sm flex-wrap gap-xs">
          {eventTypes.map((event) => (
            <EventType key={event}>{event}</EventType>
          ))}
        </div>
      }
    >
      <div className={clsx('flex w-fit flex-wrap items-center gap-xs', className)}>
        {eventTypes.slice(0, 3).map((event) => (
          <EventType key={event}>{event}</EventType>
        ))}
        {eventTypes.length > 3 ? (
          <div className="text-grey-primary bg-grey-background flex h-6 items-center rounded-full px-xs text-xs font-normal">
            {`+${eventTypes.length - 3}`}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

function EventType({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grey-background flex h-6 items-center rounded-sm px-xs">
      <span className="text-grey-primary line-clamp-1 text-xs font-normal">{children}</span>
    </div>
  );
}
