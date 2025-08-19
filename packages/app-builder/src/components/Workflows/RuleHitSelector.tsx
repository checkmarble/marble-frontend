import {
  ScenarioRuleLatestVersion,
  ScenarioRuleLatestVersionMap,
} from '@app-builder/models/scenario/workflow';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface RuleHitSelectorProps {
  selectedRuleIds: string[];
  rulesList: ScenarioRuleLatestVersionMap;
  onChange: (ruleIds: string[]) => void;
}

export function RuleHitSelector({ onChange, selectedRuleIds, rulesList }: RuleHitSelectorProps) {
  const [open, setOpen] = useState(false);

  const [pristine, setPristine] = useState(true);
  const { t } = useTranslation(['scenarios', 'workflows']);

  const [search, setSearch] = useState('');

  const groupedByVersion = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const byVersion = Array.from(rulesList.values()).reduce((acc, rule) => {
      // Apply client-side filter to avoid showing non-matching rules within a matched group
      if (normalizedSearch.length > 0 && !rule.name.toLowerCase().includes(normalizedSearch)) {
        return acc;
      }
      const key = String(rule.latestVersion);
      const existing = acc.get(key) || [];
      acc.set(key, [...existing, rule]);
      return acc;
    }, new Map<string, ScenarioRuleLatestVersion[]>());
    return Array.from(byVersion.entries());
  }, [rulesList, search]);

  const handleItemSelect = (rule: ScenarioRuleLatestVersion) => {
    setPristine(false);
    const isSelected = selectedRuleIds.includes(rule.stableId);
    const newSelectedRuleIds = isSelected
      ? selectedRuleIds.filter((id) => id !== rule.stableId)
      : [...selectedRuleIds, rule.stableId];
    onChange(newSelectedRuleIds);
  };

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen} persistOnSelect>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton
          className={`min-w-0 flex-1 ${
            !pristine && selectedRuleIds.length === 0 ? 'border-red-47' : ''
          }`}
        >
          {selectedRuleIds.length > 0 ? (
            <div className="flex flex-nowrap overflow-x-auto">
              {(() => {
                const selectedRules = selectedRuleIds
                  .map((id) => rulesList.get(id))
                  .filter(Boolean) as ScenarioRuleLatestVersion[];
                const firstTwoNames = selectedRules.slice(0, 2).map((r) => r.name);
                const extraCount = Math.max(0, selectedRules.length - 2);
                return (
                  <span className="truncate">
                    {firstTwoNames.map((name, index) => (
                      <Fragment key={name}>
                        {index > 0 && (
                          <span className="text-grey-60 font-bold uppercase mx-1">
                            {t('scenarios:logical_operator.or')}
                          </span>
                        )}
                        <span className="font-medium  text-grey-00">{name}</span>
                      </Fragment>
                    ))}
                    {extraCount ? (
                      <span className="text-grey-60 font-bold mx-1">
                        {t('workflows:rule_hit_selector.and_more', { count: extraCount })}
                      </span>
                    ) : null}
                  </span>
                );
              })()}
            </div>
          ) : (
            <span className="text-grey-80">{t('workflows:rule_hit_selector.placeholder')}</span>
          )}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start">
        <MenuCommand.Combobox
          placeholder={t('workflows:rule_hit_selector.search_placeholder')}
          onValueChange={(value) => setSearch(value)}
        />
        <MenuCommand.List>
          {groupedByVersion.map(([version, rules], idx) => (
            <Fragment key={version}>
              <MenuCommand.Group
                heading={
                  <div className="px-2 py-1 text-xs font-medium text-grey-60">
                    {t('workflows:rule_hit_selector.group.version', { version })}
                  </div>
                }
              >
                {rules.map((rule) => (
                  <MenuCommand.Item
                    key={rule.stableId}
                    value={rule.name}
                    onSelect={() => handleItemSelect(rule)}
                  >
                    <div className="flex items-center gap-2 p-3 hover:bg-grey-05 rounded-md cursor-pointer">
                      <div className="flex items-center justify-center w-5 h-5">
                        {selectedRuleIds.includes(rule.stableId) && (
                          <Icon icon="tick" className="size-4 text-purple-65" />
                        )}
                      </div>
                      <span className="font-medium text-grey-00">{rule.name}</span>
                    </div>
                  </MenuCommand.Item>
                ))}
              </MenuCommand.Group>
              {idx < groupedByVersion.length - 1 ? <MenuCommand.Separator /> : null}
            </Fragment>
          ))}
          <MenuCommand.Empty>
            <div className="px-3 py-2 text-grey-60">
              {t('workflows:rule_hit_selector.no_result')}
            </div>
          </MenuCommand.Empty>
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
