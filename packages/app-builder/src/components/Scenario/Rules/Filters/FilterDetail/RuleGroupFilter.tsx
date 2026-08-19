import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useRuleGroupFilter } from '../RulesFiltersContext';

export function RuleGroupFilter() {
  const { t } = useTranslation(['scenarios']);
  const [value, setSearchValue] = useState('');
  const { ruleGroups, selectedRuleGroups, setSelectedRuleGroups } = useRuleGroupFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(() => matchSorter(ruleGroups, searchValue), [searchValue, ruleGroups]);

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((ruleGroup) => {
            const isSelected = selectedRuleGroups.includes(ruleGroup);
            return (
              <MenuCommand.Item
                key={ruleGroup}
                value={ruleGroup}
                onSelect={() => setSelectedRuleGroups(toggle(selectedRuleGroups, ruleGroup))}
              >
                <Highlight text={ruleGroup} query={searchValue} />
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
          {matches.length === 0 ? (
            <p className="text-grey-secondary text-xs">
              {ruleGroups.length > 0
                ? t('scenarios:edit_rule.rule_group.empty_matches')
                : t('scenarios:edit_rule.rule_group.no_rule_groups')}
            </p>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
