import { type TransferAlertStatus, transferAlerStatuses } from '@app-builder/models/transfer-alert';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type DateRangeFilterForm, dateRangeSchema } from '@app-builder/utils/schema/filterSchema';
import * as React from 'react';
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod/v4';

import { type AlertsFilterName, alertsFilterNames } from './filters';

export const alertsFiltersSchema = z.object({
  message: z.string().optional(),
  statuses: z.array(z.enum(transferAlerStatuses)).optional(),
  dateRange: dateRangeSchema.optional(),
});

export type AlertsFilters = z.infer<typeof alertsFiltersSchema>;

interface AlertsFiltersContextValue {
  filterValues: AlertsFilters;
  submitAlertsFilters: () => void;
  onAlertsFilterClose: () => void;
}

const AlertsFiltersContext = createSimpleContext<AlertsFiltersContextValue>('AlertsFiltersContext');

export type AlertsFiltersForm = {
  message: string | null;
  statuses: TransferAlertStatus[];
  dateRange: DateRangeFilterForm;
};
const emptyAlertsFilters: AlertsFiltersForm = {
  message: null,
  statuses: [],
  dateRange: null,
};

function adaptAlertsFiltersForm({ dateRange, ...otherFilters }: AlertsFilters): AlertsFiltersForm {
  const adaptedFilterValues: AlertsFiltersForm = {
    ...emptyAlertsFilters,
    ...otherFilters,
  };
  if (dateRange?.type === 'static') {
    adaptedFilterValues.dateRange = {
      type: 'static',
      startDate: dateRange.startDate ?? '',
      endDate: dateRange.endDate ?? '',
    };
  }
  if (dateRange?.type === 'dynamic' && dateRange.fromNow) {
    adaptedFilterValues.dateRange = {
      type: 'dynamic',
      fromNow: dateRange.fromNow,
    };
  }
  return adaptedFilterValues;
}
function adaptAlertsFilters(filters: AlertsFiltersForm): AlertsFilters {
  const adaptedFilters: AlertsFilters = {};
  if (R.isNonNull(filters.message)) {
    adaptedFilters.message = filters.message;
  }
  if (!R.isEmpty(filters.statuses)) {
    adaptedFilters.statuses = filters.statuses;
  }
  if (filters.dateRange) {
    if (filters.dateRange.type === 'static') {
      adaptedFilters.dateRange = {
        type: 'static',
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
      };
    }
    if (filters.dateRange.type === 'dynamic') {
      adaptedFilters.dateRange = {
        type: 'dynamic',
        fromNow: filters.dateRange.fromNow,
      };
    }
  }
  return adaptedFilters;
}

export function AlertsFiltersProvider({
  filterValues,
  submitAlertsFilters: _submitAlertsFilters,
  children,
}: {
  filterValues: AlertsFilters;
  submitAlertsFilters: (filterValues: AlertsFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm<AlertsFiltersForm>({
    defaultValues: emptyAlertsFilters,
    values: adaptAlertsFiltersForm(filterValues),
  });
  const { isDirty } = formMethods.formState;
  const submitAlertsFilters = useCallbackRef(() => {
    const formValues = formMethods.getValues();
    _submitAlertsFilters(adaptAlertsFilters(formValues));
  });
  const onAlertsFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitAlertsFilters();
    }
  });

  const value = React.useMemo(
    () => ({
      submitAlertsFilters,
      onAlertsFilterClose,
      filterValues,
    }),
    [filterValues, onAlertsFilterClose, submitAlertsFilters],
  );
  return (
    <FormProvider {...formMethods}>
      <AlertsFiltersContext.Provider value={value}>{children}</AlertsFiltersContext.Provider>
    </FormProvider>
  );
}

export const useAlertsFiltersContext = AlertsFiltersContext.useValue;

export function useMessageFilter() {
  const { submitAlertsFilters } = useAlertsFiltersContext();
  const { field } = useController<AlertsFiltersForm, 'message'>({
    name: 'message',
  });
  const messageFilter = field.value;
  const setMessageFilter = useCallbackRef((e) => {
    field.onChange(e);
    submitAlertsFilters();
  });
  return { messageFilter, setMessageFilter };
}

export function useStatusesFilter() {
  const { field } = useController<AlertsFiltersForm, 'statuses'>({
    name: 'statuses',
  });
  const selectedStatuses = field.value;
  const setSelectedStatuses = field.onChange;
  return { selectedStatuses, setSelectedStatuses };
}

export function useDateRangeFilter() {
  const { field } = useController<AlertsFiltersForm, 'dateRange'>({
    name: 'dateRange',
  });
  const dateRange = field.value;
  const setDateRange = field.onChange;
  return { dateRange, setDateRange };
}

/**
 * Split alerts filters in two partitions:
 * - undefinedAlertsFilterNames: filter values are undefined
 * - definedAlertsFilterNames: filter values are defined
 */
export function useAlertsFiltersPartition() {
  const { filterValues } = useAlertsFiltersContext();

  const [undefinedAlertsFilterNames, definedAlertsFilterNames] = R.pipe(
    alertsFilterNames,
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isPlainObject(value)) return R.isEmpty(value);
      return R.isNullish(value);
    }),
  );
  return {
    undefinedAlertsFilterNames,
    definedAlertsFilterNames,
  };
}

export function useClearFilter() {
  const { submitAlertsFilters } = useAlertsFiltersContext();
  const { setValue } = useFormContext<AlertsFiltersForm>();

  return React.useCallback(
    (filterName: AlertsFilterName) => {
      setValue(filterName, emptyAlertsFilters[filterName]);
      submitAlertsFilters();
    },
    [setValue, submitAlertsFilters],
  );
}

export function useClearAllFilters() {
  const { submitAlertsFilters } = useAlertsFiltersContext();
  const { reset } = useFormContext<AlertsFiltersForm>();

  return React.useCallback(() => {
    reset(emptyAlertsFilters);
    submitAlertsFilters();
  }, [reset, submitAlertsFilters]);
}
