import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { Highlight } from '@app-builder/components/Highlight';
import clsx from 'clsx';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

export const FieldRuleGroup = ({
  selectedRuleGroup,
  ruleGroups,
  disabled,
}: {
  selectedRuleGroup?: string;
  ruleGroups: string[];
  disabled?: boolean;
}) => {
  const { t } = useTranslation(['scenarios']);
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(ruleGroups, deferredSearchValue),
    [ruleGroups, deferredSearchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedRuleGroup}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
    >
      <FormSelectWithCombobox.Select disabled={disabled} className="w-full">
        <span className={clsx({ 'text-grey-80': disabled })}>
          {selectedRuleGroup}
        </span>
        {disabled ? null : <FormSelectWithCombobox.Arrow />}
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.map((group) => (
            <FormSelectWithCombobox.ComboboxItem key={group} value={group}>
              <Highlight text={group} query={deferredSearchValue} />
            </FormSelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-grey-50 text-xs">
              {t('scenarios:edit_rule.rule_group.empty_matches')}
            </p>
          ) : null}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
};
