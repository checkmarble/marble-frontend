import {
  type TestRunStatus,
  testRunStatuses,
} from '@app-builder/models/testrun';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import {
  type DateRangeFilterForm,
  dateRangeSchema,
} from '@app-builder/utils/schema/filterSchema';
import { useCallback, useMemo } from 'react';
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod';

import { type TestRunFilterName, testRunsFilterNames } from './filters';

export const testRunsFiltersSchema = z.object({
  statuses: z.array(z.enum(testRunStatuses)).optional(),
  dateRange: dateRangeSchema.optional(),
});

export type TestRunsFilters = z.infer<typeof testRunsFiltersSchema>;

interface TestRunsFiltersContextValue {
  filterValues: TestRunsFilters;
  submitTestRunsFilters: () => void;
  onTestRunsFilterClose: () => void;
}

const TestRunsFiltersContext = createSimpleContext<TestRunsFiltersContextValue>(
  'TestRunsFiltersContext',
);

export type TestRunsFiltersForm = {
  statuses: TestRunStatus[];
  dateRange: DateRangeFilterForm;
};
const emptyTestRunsFilters: TestRunsFiltersForm = {
  statuses: [],
  dateRange: null,
};

function adaptFilterValues({
  dateRange,
  ...otherFilters
}: TestRunsFilters): TestRunsFiltersForm {
  const adaptedFilterValues: TestRunsFiltersForm = {
    ...emptyTestRunsFilters,
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

export function TestRunsFiltersProvider({
  filterValues,
  submitTestRunsFilters: _submitTestRunsFilters,
  children,
}: {
  filterValues: TestRunsFilters;
  submitTestRunsFilters: (filterValues: TestRunsFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm<TestRunsFiltersForm>({
    defaultValues: emptyTestRunsFilters,
    values: adaptFilterValues(filterValues),
  });
  const { isDirty } = formMethods.formState;
  const submitTestRunsFilters = useCallbackRef(() => {
    const formValues = formMethods.getValues();
    _submitTestRunsFilters({
      ...formValues,
      dateRange: formValues.dateRange ?? undefined,
    });
  });
  const onTestRunsFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitTestRunsFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitTestRunsFilters,
      onTestRunsFilterClose,
      filterValues,
    }),
    [filterValues, onTestRunsFilterClose, submitTestRunsFilters],
  );
  return (
    <FormProvider {...formMethods}>
      <TestRunsFiltersContext.Provider value={value}>
        {children}
      </TestRunsFiltersContext.Provider>
    </FormProvider>
  );
}

export const useTestRunsFiltersContext = TestRunsFiltersContext.useValue;

export function useStatusesFilter() {
  const { field } = useController<TestRunsFiltersForm, 'statuses'>({
    name: 'statuses',
  });
  const selectedStatuses = field.value;
  const setSelectedStatuses = field.onChange;
  return { selectedStatuses, setSelectedStatuses };
}

export function useDateRangeFilter() {
  const { field } = useController<TestRunsFiltersForm, 'dateRange'>({
    name: 'dateRange',
  });
  const dateRange = field.value;
  const setDateRange = field.onChange;
  return { dateRange, setDateRange };
}

/**
 * Split testRuns filters in two partitions:
 * - undefinedTestRunsFilterNames: filter values are undefined
 * - definedTestRunsFilterNames: filter values are defined
 */
export function useTestRunsFiltersPartition() {
  const { filterValues } = useTestRunsFiltersContext();

  const [undefinedTestRunsFilterNames, definedTestRunsFilterNames] = R.pipe(
    testRunsFilterNames,
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isPlainObject(value)) return R.isEmpty(value);
      return R.isNullish(value);
    }),
  );
  return {
    undefinedTestRunsFilterNames,
    definedTestRunsFilterNames,
  };
}

export function useClearFilter() {
  const { submitTestRunsFilters } = useTestRunsFiltersContext();
  const { setValue } = useFormContext<TestRunsFiltersForm>();

  return useCallback(
    (filterName: TestRunFilterName) => {
      setValue(filterName, emptyTestRunsFilters[filterName]);
      submitTestRunsFilters();
    },
    [setValue, submitTestRunsFilters],
  );
}
