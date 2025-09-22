import { useDateRangeSearchParams } from '@app-builder/hooks/useDateRangeSearchParams';
import { type Scenario } from '@app-builder/models/scenario';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DateRangeFilter } from '../Filters';
import { FilterItem, FilterPopover } from '../Filters/FilterPopover';

export function Filters({
  selectedScenarioId,
  scenarios,
  onSelectedScenarioIdChange,
}: {
  selectedScenarioId: string;
  scenarios: Scenario[];
  onSelectedScenarioIdChange: (scenarioId: string) => void;
}) {
  const { t } = useTranslation(['decisions', 'common']);
  const language = useFormatLanguage();
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId);
  const { start, end, setDateRangeFilter } = useDateRangeSearchParams();

  return (
    <div className="flex flex-row gap-2 p-2">
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="primary" size="medium">
            <MenuCommand.Arrow />
            <span className="text-xs">{selectedScenario?.name}</span>
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth sideOffset={4} align="start" className="min-w-24">
          <MenuCommand.Combobox autoFocus />
          <MenuCommand.List className="p-1">
            {scenarios.map((scenario) => (
              <MenuCommand.Item
                key={scenario.id}
                value={scenario.id}
                onSelect={() => onSelectedScenarioIdChange(scenario.id)}
              >
                <span className="text-xs">{scenario.name}</span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      <FilterPopover.Root key={'dateRange'}>
        <FilterItem.Root>
          <FilterItem.Trigger>
            <Icon icon="calendar-month" className="size-5" />
            <span className="text-s font-semibold first-letter:capitalize">
              Period from{' '}
              {formatDateTimeWithoutPresets(start, {
                language,
                dateStyle: 'short',
              })}{' '}
              to{' '}
              {formatDateTimeWithoutPresets(end, {
                language,
                dateStyle: 'short',
              })}
            </span>
          </FilterItem.Trigger>
          <FilterItem.Clear onClick={() => setDateRangeFilter(null)} />
        </FilterItem.Root>
        <FilterPopover.Content>
          <DateRangeFilter.Root
            dateRangeFilter={{ type: 'static', startDate: start, endDate: end }}
            setDateRangeFilter={setDateRangeFilter}
            className="grid"
          >
            <DateRangeFilter.FromNowPicker title={t('decisions:filters.date_range.title')} />
            <Separator className="bg-grey-90" decorative orientation="vertical" />
            <DateRangeFilter.Calendar />
            <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
            <DateRangeFilter.Summary className="col-span-3 row-span-1" />
          </DateRangeFilter.Root>
        </FilterPopover.Content>
      </FilterPopover.Root>
    </div>
  );
}
