import {
  AddNewFilterButton,
  ClearAllFiltersLink,
  FilterItem,
  FilterPopover,
} from '@app-builder/components/Filters';
import { getRoute } from '@app-builder/utils/routes';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

import {
  useTestRunsFiltersContext,
  useTestRunsFiltersPartition,
  useClearFilter,
} from './TestRunsFiltersContext';
import { TestRunsFiltersMenu } from './TestRunsFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { getFilterIcon, getFilterTKey } from './filters';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { fromUUID } from '@app-builder/utils/short-uuid';

export function TestRunsFiltersBar() {
  const { t } = useTranslation(['scenarios', 'common']);
  const { onTestRunsFilterClose } = useTestRunsFiltersContext();
  const currentScenario = useCurrentScenario();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onTestRunsFilterClose();
      }
    },
    [onTestRunsFilterClose],
  );

  const { undefinedTestRunsFilterNames, definedTestRunsFilterNames } =
    useTestRunsFiltersPartition();
  const clearFilter = useClearFilter();

  if (definedTestRunsFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-10" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedTestRunsFilterNames.map((filterName) => {
            const icon = getFilterIcon(filterName);
            const tKey = getFilterTKey(filterName);

            return (
              <FilterPopover.Root key={filterName} onOpenChange={onOpenChange}>
                <FilterItem.Root>
                  <FilterItem.Trigger>
                    <Icon icon={icon} className="size-5" />
                    <span className="text-s font-semibold first-letter:capitalize">
                      {t(tKey)}
                    </span>
                  </FilterItem.Trigger>
                  <FilterItem.Clear
                    onClick={() => {
                      clearFilter(filterName);
                    }}
                  />
                </FilterItem.Root>
                <FilterPopover.Content>
                  <FilterDetail filterName={filterName} />
                </FilterPopover.Content>
              </FilterPopover.Root>
            );
          })}
          {undefinedTestRunsFilterNames.length > 0 ? (
            <TestRunsFiltersMenu filterNames={undefinedTestRunsFilterNames}>
              <AddNewFilterButton />
            </TestRunsFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersLink
          to={getRoute('/scenarios/:scenarioId/test-run', {
            scenarioId: fromUUID(currentScenario.id),
          })}
          replace
        />
      </div>
    </>
  );
}
