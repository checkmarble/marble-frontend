import { ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useRefVersionFilter, useTestVersionFilter } from '../TestRunsFiltersContext';

export function VersionsFilter({
  type,
  scenarioIterations,
}: {
  type: 'ref' | 'test';
  scenarioIterations: ScenarioIterationSummaryWithType[];
}) {
  const [value, setSearchValue] = useState('');
  const { refVersion, setRefVersion } = useRefVersionFilter();
  const { testVersion, setTestVersion } = useTestVersionFilter();
  const deferredValue = useDeferredValue(value);
  const [selected, setSelected] = match(type)
    .with('ref', () => [refVersion ?? [], setRefVersion] as const)
    .with('test', () => [testVersion ?? [], setTestVersion] as const)
    .exhaustive();

  const filteredIterations = scenarioIterations.filter(({ type }) => type !== 'draft');

  const matches = useMemo(
    () => matchSorter(filteredIterations, deferredValue, { keys: ['version'] }),
    [deferredValue, filteredIterations],
  );

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((iteration) => {
            const isSelected = selected.includes(iteration.id);
            return (
              <MenuCommand.Item
                key={iteration.id}
                value={`${iteration.version} ${iteration.id}`}
                onSelect={() => setSelected(toggle(selected, iteration.id))}
              >
                <span className="text-grey-primary text-s">{`V${iteration.version}`}</span>
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
