import { testRunStatuses } from '@app-builder/models/testrun';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useCallback, useMemo } from 'react';
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod';

import { type TestRunFilterName, testRunsFilterNames } from './filters';

export const testRunsFiltersSchema = z.object({
  statuses: z.array(z.enum(testRunStatuses)).optional(),
  startedAfter: z.date().optional(),
  creators: z.array(z.string()).optional(),
  ref_versions: z.array(z.string()).optional(),
  test_versions: z.array(z.string()).optional(),
});

export type TestRunsFilters = z.infer<typeof testRunsFiltersSchema>;

interface TestRunsFiltersContextValue {
  filterValues: TestRunsFilters;
  submitTestRunsFilters: () => void;
  onTestRunsFilterClose: () => void;
}

const TestRunsFiltersContext =
  createSimpleContext<TestRunsFiltersContextValue>('TestRunsFiltersContext');

export type TestRunsFiltersForm = TestRunsFilters;

export const emptyTestRunsFilters: TestRunsFiltersForm = {
  statuses: [],
  creators: [],
  ref_versions: [],
  test_versions: [],
};

function adaptFilterValues({ ...otherFilters }: TestRunsFilters): TestRunsFiltersForm {
  return {
    ...emptyTestRunsFilters,
    ...otherFilters,
  };
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
    _submitTestRunsFilters(formMethods.getValues());
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
      <TestRunsFiltersContext.Provider value={value}>{children}</TestRunsFiltersContext.Provider>
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

export function useStartedAfterFilter() {
  const { field } = useController<TestRunsFiltersForm, 'startedAfter'>({
    name: 'startedAfter',
  });
  const startedAfter = field.value;
  const setStartedAfter = field.onChange;
  return { startedAfter, setStartedAfter };
}

export const useCreatorFilter = () => {
  const { field } = useController<TestRunsFiltersForm, 'creators'>({
    name: 'creators',
  });
  const creator = field.value;
  const setCreator = field.onChange;
  return { creator, setCreator };
};

export const useRefVersionFilter = () => {
  const { field } = useController<TestRunsFiltersForm, 'ref_versions'>({
    name: 'ref_versions',
  });
  const refVersion = field.value;
  const setRefVersion = field.onChange;
  return { refVersion, setRefVersion };
};

export const useTestVersionFilter = () => {
  const { field } = useController<TestRunsFiltersForm, 'test_versions'>({
    name: 'test_versions',
  });
  const testVersion = field.value;
  const setTestVersion = field.onChange;
  return { testVersion, setTestVersion };
};

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

export const useClearAllFilters = () => {
  const { submitTestRunsFilters } = useTestRunsFiltersContext();
  const { reset } = useFormContext<TestRunsFiltersForm>();
  return useCallback(() => {
    reset(emptyTestRunsFilters);
    submitTestRunsFilters();
  }, [reset, submitTestRunsFilters]);
};
