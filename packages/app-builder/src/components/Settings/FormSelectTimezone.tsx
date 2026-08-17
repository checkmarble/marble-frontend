import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

const MAX_TIMEZONE_MATCHES = 50;

export const FormSelectTimezone = ({
  name,
  disabled,
  selectedTimezone,
  validTimezones,
  onSelectedValueChange,
  onBlur,
}: {
  name?: string;
  disabled?: boolean;
  selectedTimezone?: string;
  validTimezones: string[];
  onSelectedValueChange?: (selectedTimezone: string) => void;
  onBlur?: () => void;
}) => {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(validTimezones, deferredSearchValue),
    [validTimezones, deferredSearchValue],
  );

  return (
    <MenuCommand.Menu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearchValue('');
      }}
    >
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton name={name} disabled={disabled} onBlur={onBlur} className="w-fit">
          {selectedTimezone}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} className="z-50">
        <MenuCommand.Combobox onValueChange={setSearchValue} />
        <MenuCommand.List>
          {matches.slice(0, MAX_TIMEZONE_MATCHES).map((tz) => (
            <MenuCommand.Item key={tz} value={tz} onSelect={() => onSelectedValueChange?.(tz)}>
              <Highlight text={tz} query={deferredSearchValue} />
              {selectedTimezone === tz ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
            </MenuCommand.Item>
          ))}
          {matches.length === 0 ? (
            <p className="text-s text-grey-secondary flex items-center justify-center p-sm">
              {t('settings:scenario_default_timezone.no_match')}
            </p>
          ) : null}
          {matches.length > MAX_TIMEZONE_MATCHES ? (
            <p className="text-s text-grey-secondary flex items-center justify-center whitespace-pre-wrap text-balance p-sm text-center">
              {t('settings:scenario_default_timezone.more_results', {
                count: matches.length - MAX_TIMEZONE_MATCHES,
              })}
            </p>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
