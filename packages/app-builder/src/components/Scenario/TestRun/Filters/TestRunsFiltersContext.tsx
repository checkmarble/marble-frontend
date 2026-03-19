import { testRunStatuses } from '@app-builder/models/testrun';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { useForm, useStore } from '@tanstack/react-form';
import { useCallback, useEffect, useMemo } from 'react';
import * as R from 'remeda';
import * as z from 'zod/v4';

import { type TestRunFilterName, testRunsFilterNames } from './filters';

export const testRunsFiltersSchema = z.object({
  statuses: protectArray(z.array(z.enum(testRunStatuses))).optional(),
  startedAfter: z.date().optional(),
  creators: protectArray(z.array(z.string())).optional(),
  ref_versions: protectArray(z.array(z.string())).optional(),
  test_versions: protectArray(z.array(z.string())).optional(),
});

export type TestRunsFilters = z.infer<typeof testRunsFiltersSchema>;

export type TestRunsFiltersForm = TestRunsFilters;

export const emptyTestRunsFilters: TestRunsFiltersForm = {
  statuses: [],
  creators: [],
  ref_versions: [],
  test_versions: [],
};

// Helper to capture the inferred form type without partial generic application
function _useTestRunsFiltersForm() {
  return useForm({ defaultValues: emptyTestRunsFilters });
}
type TestRunsFiltersFormApi = ReturnType<typeof _useTestRunsFiltersForm>;

interface TestRunsFiltersContextValue {
  filterValues: TestRunsFilters;
  submitTestRunsFilters: () => void;
  onTestRunsFilterClose: () => void;
  form: TestRunsFiltersFormApi;
}

const TestRunsFiltersContext = createSimpleContext<TestRunsFiltersContextValue>('TestRunsFiltersContext');

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
  const form = useForm({
    defaultValues: adaptFilterValues(filterValues),
  });

  useEffect(() => {
    form.reset(adaptFilterValues(filterValues));
  }, [filterValues]);

  const submitTestRunsFilters = useCallbackRef(() => {
    _submitTestRunsFilters(form.state.values);
  });

  const onTestRunsFilterClose = useCallbackRef(() => {
    if (form.state.isDirty) {
      submitTestRunsFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitTestRunsFilters,
      onTestRunsFilterClose,
      filterValues,
      form,
    }),
    [filterValues, onTestRunsFilterClose, submitTestRunsFilters, form],
  );

  return <TestRunsFiltersContext.Provider value={value}>{children}</TestRunsFiltersContext.Provider>;
}

export const useTestRunsFiltersContext = TestRunsFiltersContext.useValue;

export function useStatusesFilter() {
  const { form } = useTestRunsFiltersContext();
  const selectedStatuses = useStore(form.store, (state) => state.values.statuses);
  const setSelectedStatuses = (value: TestRunsFiltersForm['statuses']) => form.setFieldValue('statuses', value);
  return { selectedStatuses, setSelectedStatuses };
}

export function useStartedAfterFilter() {
  const { form } = useTestRunsFiltersContext();
  const startedAfter = useStore(form.store, (state) => state.values.startedAfter);
  const setStartedAfter = (value: Date | undefined) => form.setFieldValue('startedAfter', value);
  return { startedAfter, setStartedAfter };
}

export const useCreatorFilter = () => {
  const { form } = useTestRunsFiltersContext();
  const creator = useStore(form.store, (state) => state.values.creators);
  const setCreator = (value: TestRunsFiltersForm['creators']) => form.setFieldValue('creators', value);
  return { creator, setCreator };
};

export const useRefVersionFilter = () => {
  const { form } = useTestRunsFiltersContext();
  const refVersion = useStore(form.store, (state) => state.values.ref_versions);
  const setRefVersion = (value: TestRunsFiltersForm['ref_versions']) => form.setFieldValue('ref_versions', value);
  return { refVersion, setRefVersion };
};

export const useTestVersionFilter = () => {
  const { form } = useTestRunsFiltersContext();
  const testVersion = useStore(form.store, (state) => state.values.test_versions);
  const setTestVersion = (value: TestRunsFiltersForm['test_versions']) => form.setFieldValue('test_versions', value);
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
  const { submitTestRunsFilters, form } = useTestRunsFiltersContext();

  return useCallback(
    (filterName: TestRunFilterName) => {
      form.setFieldValue(filterName, emptyTestRunsFilters[filterName]);
      submitTestRunsFilters();
    },
    [form, submitTestRunsFilters],
  );
}

export const useClearAllFilters = () => {
  const { submitTestRunsFilters, form } = useTestRunsFiltersContext();
  return useCallback(() => {
    form.reset(emptyTestRunsFilters);
    submitTestRunsFilters();
  }, [form, submitTestRunsFilters]);
};
