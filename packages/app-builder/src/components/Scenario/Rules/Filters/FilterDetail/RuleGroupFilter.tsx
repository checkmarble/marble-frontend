import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { useRuleGroupFilter } from '../RulesFiltersContext';

export function RuleGroupFilter() {
  const { t } = useTranslation(['scenarios']);
  const [value, setSearchValue] = useState('');
  const { ruleGroups, selectedRuleGroups, setSelectedRuleGroups } = useRuleGroupFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(() => matchSorter(ruleGroups, searchValue), [searchValue, ruleGroups]);

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedRuleGroups}
        onSelectedValueChange={setSelectedRuleGroups}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((ruleGroup) => {
            return (
              <SelectWithCombobox.ComboboxItem key={ruleGroup} value={ruleGroup}>
                <Highlight text={ruleGroup} query={searchValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
          {matches.length === 0 ? (
            <p className="text-grey-50 text-xs">
              {ruleGroups.length > 0
                ? t('scenarios:edit_rule.rule_group.empty_matches')
                : t('scenarios:edit_rule.rule_group.no_rule_groups')}
            </p>
          ) : null}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
