import { Highlight } from '@app-builder/components/Highlight';
import { useListScheduleExecutions } from '@app-builder/queries/decisions/list-scheduled-executions';
import { useFormatDateTime } from '@app-builder/utils/format';
import { matchSorter } from 'match-sorter';
import { toggle } from 'radash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSpinDelay } from 'spin-delay';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { decisionsI18n } from '../../decisions-i18n';
import { useScheduledExecutionFilter } from '../DecisionFiltersContext';

export function ScheduledExecutionFilter() {
  const { t } = useTranslation(decisionsI18n);
  const formatDateTime = useFormatDateTime();

  const scheduledExecutionsQuery = useListScheduleExecutions();

  const successfullScheduledExecutions = React.useMemo(() => {
    if (!scheduledExecutionsQuery.data) {
      return undefined;
    }

    return scheduledExecutionsQuery.data.scheduledExecutions
      ?.filter(({ status }) => status === 'success')
      .map((scheduledExecution) => ({
        id: scheduledExecution.id,
        scenarioName: scheduledExecution.scenarioName,
        startedAt: {
          dateTime: scheduledExecution.startedAt,
          formattedDateTime: formatDateTime(scheduledExecution.startedAt, {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
        },
      }));
  }, [formatDateTime, scheduledExecutionsQuery.data]);

  const isLoading = scheduledExecutionsQuery.isPending || successfullScheduledExecutions === undefined;
  const showSpinner = useSpinDelay(isLoading);

  const [value, setSearchValue] = React.useState('');
  const { selectedScheduledExecutionIds, setSelectedScheduledExecutionIds } = useScheduledExecutionFilter();
  const searchValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () =>
      matchSorter(successfullScheduledExecutions ?? [], searchValue, {
        keys: ['scenarioName', 'startedAt.formattedDateTime'],
      }),
    [searchValue, successfullScheduledExecutions],
  );

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox
          className="m-0"
          placeholder={t('decisions:filters.scheduled_execution.placeholder')}
          onValueChange={setSearchValue}
        />
        <MenuCommand.List className="max-h-80 w-80">
          {matches.map((successfullScheduledExecution) => {
            const isSelected = selectedScheduledExecutionIds.includes(successfullScheduledExecution.id);
            return (
              <MenuCommand.Item
                key={successfullScheduledExecution.id}
                value={`${successfullScheduledExecution.scenarioName} ${successfullScheduledExecution.startedAt.formattedDateTime} ${successfullScheduledExecution.id}`}
                onSelect={() =>
                  setSelectedScheduledExecutionIds(
                    toggle(selectedScheduledExecutionIds, successfullScheduledExecution.id),
                  )
                }
              >
                <div className="flex flex-col">
                  <Highlight text={successfullScheduledExecution.scenarioName} query={searchValue} />
                  <time
                    className="text-grey-secondary text-xs"
                    dateTime={successfullScheduledExecution.startedAt.dateTime}
                  >
                    <Highlight text={successfullScheduledExecution.startedAt.formattedDateTime} query={searchValue} />
                  </time>
                </div>
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
          {showSpinner ? (
            <div className="text-grey-primary h-10 p-sm first-letter:capitalize">{t('common:loading')}</div>
          ) : matches.length === 0 ? (
            <p className="text-grey-secondary flex items-center justify-center p-sm">
              {successfullScheduledExecutions?.length
                ? t('decisions:filters.scheduled_execution.no_results')
                : t('decisions:filters.scheduled_execution.no_schedule')}
            </p>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
