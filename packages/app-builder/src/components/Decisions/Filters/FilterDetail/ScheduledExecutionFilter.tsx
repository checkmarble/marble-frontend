import { Highlight } from '@app-builder/components/Highlight';
import { type ScheduledExecutionsLoader } from '@app-builder/routes/ressources+/decisions+/list-scheduled-execution';
import { useFormatDateTimeString, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSpinDelay } from 'spin-delay';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { useScheduledExecutionFilter } from '../DecisionFiltersContext';

export function ScheduledExecutionFilter() {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTimeString();

  const loadFetcher = useFetcher<ScheduledExecutionsLoader>();
  React.useEffect(() => {
    if (loadFetcher.state === 'idle' && !loadFetcher.data) {
      loadFetcher.load(getRoute('/ressources/decisions/list-scheduled-execution'));
    }
  }, [loadFetcher]);
  const successfullScheduledExecutions = React.useMemo(
    () =>
      loadFetcher.data
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
        })),
    [language, loadFetcher.data],
  );

  const isLoading = loadFetcher.state === 'loading' || successfullScheduledExecutions === undefined;
  const showSpinner = useSpinDelay(isLoading);

  const [value, setSearchValue] = React.useState('');
  const { selectedScheduledExecutionIds, setSelectedScheduledExecutionIds } =
    useScheduledExecutionFilter();
  const searchValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () =>
      matchSorter(successfullScheduledExecutions ?? [], searchValue, {
        keys: ['scenarioName', 'startedAt.formattedDateTime'],
      }),
    [searchValue, successfullScheduledExecutions],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedScheduledExecutionIds}
        onSelectedValueChange={setSelectedScheduledExecutionIds}
      >
        <SelectWithCombobox.Combobox
          render={<Input placeholder={t('decisions:filters.scheduled_execution.placeholder')} />}
          autoSelect
          autoFocus
        />
        <SelectWithCombobox.ComboboxList className="max-h-80 w-80">
          {matches.map((successfullScheduledExecution) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={successfullScheduledExecution.id}
                value={successfullScheduledExecution.id}
              >
                <div className="flex flex-col">
                  <Highlight
                    text={successfullScheduledExecution.scenarioName}
                    query={searchValue}
                  />
                  <time
                    className="text-grey-50 text-xs"
                    dateTime={successfullScheduledExecution.startedAt.dateTime}
                  >
                    <Highlight
                      text={successfullScheduledExecution.startedAt.formattedDateTime}
                      query={searchValue}
                    />
                  </time>
                </div>
              </SelectWithCombobox.ComboboxItem>
            );
          })}
          {showSpinner ? (
            <div className="text-grey-00 h-10 p-2 first-letter:capitalize">
              {t('common:loading')}
            </div>
          ) : matches.length === 0 ? (
            <p className="text-grey-50 flex items-center justify-center p-2">
              {successfullScheduledExecutions?.length
                ? t('decisions:filters.scheduled_execution.no_results')
                : t('decisions:filters.scheduled_execution.no_schedule')}
            </p>
          ) : null}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
