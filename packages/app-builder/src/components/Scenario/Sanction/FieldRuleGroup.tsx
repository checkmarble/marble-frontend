import { Highlight } from '@app-builder/components/Highlight';
import clsx from 'clsx';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

export const FieldRuleGroup = ({
  selectedRuleGroup,
  ruleGroups,
  disabled,
  name,
  onChange,
  onBlur,
}: {
  selectedRuleGroup?: string;
  ruleGroups: string[];
  disabled?: boolean;
  name?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}) => {
  const { t } = useTranslation(['scenarios']);
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(ruleGroups, deferredSearchValue),
    [ruleGroups, deferredSearchValue],
  );

  return (
    <SelectWithCombobox.Root
      selectedValue={selectedRuleGroup}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSelectedValueChange={onChange}
    >
      <SelectWithCombobox.Select
        name={name}
        onBlur={onBlur}
        disabled={disabled}
        className="w-full"
      >
        <span className={clsx({ 'text-grey-80': disabled })}>
          {selectedRuleGroup}
        </span>
        {disabled ? null : <SelectWithCombobox.Arrow />}
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <SelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <SelectWithCombobox.ComboboxList>
          {matches.map((group) => (
            <SelectWithCombobox.ComboboxItem key={group} value={group}>
              <Highlight text={group} query={deferredSearchValue} />
            </SelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-grey-50 text-xs">
              {t('scenarios:edit_rule.rule_group.empty_matches')}
            </p>
          ) : null}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
};
