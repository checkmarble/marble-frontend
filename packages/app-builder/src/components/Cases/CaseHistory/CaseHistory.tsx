import { FiltersButton } from '@app-builder/components/Filters';
import { type CaseEvent } from '@app-builder/models/cases';
import { getDateRangeFilter } from '@app-builder/utils/datetime';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { casesI18n } from '../cases-i18n';
import { CaseEvents } from './CaseEvents';
import {
  type CaseHistoryFilters,
  CaseHistoryFiltersBar,
  CaseHistoryFiltersMenu,
  CaseHistoryFiltersProvider,
} from './Filters';
import { caseHistoryFilterNames } from './Filters/filters';

export function CaseHistory({ events, className }: { events: CaseEvent[]; className?: string }) {
  const { t } = useTranslation(casesI18n);
  const [filterValues, setFilterValues] = React.useState<CaseHistoryFilters>({
    caseEventTypes: [],
  });

  const filteredEvents = events
    .filter((event) => {
      if (!filterValues.dateRange) return true;
      const dateRangeFilter = getDateRangeFilter(filterValues.dateRange);
      return dateRangeFilter(event.createdAt);
    })
    .filter((event) => {
      if (!filterValues.caseEventTypes.length) return true;
      return filterValues.caseEventTypes.includes(event.eventType);
    });

  return (
    <CaseHistoryFiltersProvider filterValues={filterValues} submitCasesFilters={setFilterValues}>
      <div className={clsx('relative flex flex-col gap-4 lg:gap-6', className)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <span className="text-m text-grey-00 ml-2 font-bold">
            {t('cases:case_detail.history')}
          </span>
          <CaseHistoryFiltersMenu filterNames={caseHistoryFilterNames}>
            <FiltersButton />
          </CaseHistoryFiltersMenu>
        </div>
        <CaseHistoryFiltersBar />
        <CaseEvents events={filteredEvents} />
      </div>
    </CaseHistoryFiltersProvider>
  );
}
