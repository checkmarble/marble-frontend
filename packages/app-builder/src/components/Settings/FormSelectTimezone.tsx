import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

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
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(validTimezones, deferredSearchValue),
    [validTimezones, deferredSearchValue],
  );

  return (
    <SelectWithCombobox.Root
      selectedValue={selectedTimezone}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSelectedValueChange={onSelectedValueChange}
    >
      <SelectWithCombobox.Select
        name={name}
        disabled={disabled}
        onBlur={onBlur}
        className="w-fit"
      >
        {selectedTimezone}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover
        className="z-50 flex flex-col gap-2 p-2"
        unmountOnHide
      >
        <SelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <SelectWithCombobox.ComboboxList>
          {matches.slice(0, MAX_TIMEZONE_MATCHES).map((tz) => (
            <SelectWithCombobox.ComboboxItem key={tz} value={tz}>
              <Highlight text={tz} query={deferredSearchValue} />
            </SelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-s text-grey-50 flex items-center justify-center p-2">
              {t('settings:scenario_default_timezone.no_match')}
            </p>
          ) : null}
          {matches.length > MAX_TIMEZONE_MATCHES ? (
            <p className="text-s text-grey-50 flex items-center justify-center whitespace-pre-wrap text-balance p-2 text-center">
              {t('settings:scenario_default_timezone.more_results', {
                count: matches.length - MAX_TIMEZONE_MATCHES,
              })}
            </p>
          ) : null}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
};
