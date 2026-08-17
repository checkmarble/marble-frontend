import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useScenarioFilter } from '../DecisionFiltersContext';

export function ScenarioFilter() {
  const [value, setSearchValue] = useState('');
  const { scenarios, selectedScenarioIds, setSelectedScenarioIds } = useScenarioFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(() => matchSorter(scenarios, searchValue, { keys: ['name'] }), [searchValue, scenarios]);

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((scenario) => {
            const isSelected = selectedScenarioIds.includes(scenario.id);
            return (
              <MenuCommand.Item
                key={scenario.id}
                value={`${scenario.name} ${scenario.id}`}
                onSelect={() => setSelectedScenarioIds(toggle(selectedScenarioIds, scenario.id))}
              >
                <Highlight text={scenario.name} query={searchValue} />
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
