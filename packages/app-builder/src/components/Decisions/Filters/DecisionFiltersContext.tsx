import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import {
  type DateRangeFilterForm,
  dateRangeSchema,
} from '@app-builder/utils/schema/filterSchema';
import { type Outcome, type Scenario } from 'marble-api';
import { useCallback, useMemo } from 'react';
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod';

import { type DecisionFilterName, decisionFilterNames } from './filters';

export const decisionFiltersSchema = z.object({
  outcome: z.array(z.enum(['approve', 'review', 'decline'])).optional(),
  triggerObject: z.array(z.string()).optional(),
  dateRange: dateRangeSchema.optional(),
  scenarioId: z.array(z.string()).optional(),
});

export type DecisionFilters = z.infer<typeof decisionFiltersSchema>;

interface DecisionFiltersContextValue {
  filterValues: DecisionFilters;
  scenarios: Scenario[];
  submitDecisionFilters: () => void;
  onDecisionFilterClose: () => void;
}

const DecisionFiltersContext = createSimpleContext<DecisionFiltersContextValue>(
  'DecisionFiltersContext',
);

export type DecisionFiltersForm = {
  outcome: Exclude<Outcome, 'null' | 'unknown'>[];
  triggerObject: string[];
  dateRange: DateRangeFilterForm;
  scenarioId: string[];
};
const emptyDecisionFilters: DecisionFiltersForm = {
  outcome: [],
  triggerObject: [],
  dateRange: null,
  scenarioId: [],
};

function adaptFilterValues({
  dateRange,
  ...otherFilters
}: DecisionFilters): DecisionFiltersForm {
  const adaptedFilterValues: DecisionFiltersForm = {
    ...emptyDecisionFilters,
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

export function DecisionFiltersProvider({
  filterValues,
  scenarios,
  submitDecisionFilters: _submitDecisionFilters,
  children,
}: {
  filterValues: DecisionFilters;
  scenarios: Scenario[];
  submitDecisionFilters: (filterValues: DecisionFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm<DecisionFiltersForm>({
    defaultValues: emptyDecisionFilters,
    values: adaptFilterValues(filterValues),
  });
  const { isDirty } = formMethods.formState;
  const submitDecisionFilters = useCallbackRef(() => {
    const formValues = formMethods.getValues();
    _submitDecisionFilters({
      ...formValues,
      dateRange: formValues.dateRange ?? undefined,
    });
  });
  const onDecisionFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitDecisionFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitDecisionFilters,
      onDecisionFilterClose,
      filterValues,
      scenarios,
    }),
    [filterValues, onDecisionFilterClose, scenarios, submitDecisionFilters],
  );
  return (
    <FormProvider {...formMethods}>
      <DecisionFiltersContext.Provider value={value}>
        {children}
      </DecisionFiltersContext.Provider>
    </FormProvider>
  );
}

export const useDecisionFiltersContext = DecisionFiltersContext.useValue;

export function useOutcomeFilter() {
  const { field } = useController<DecisionFiltersForm, 'outcome'>({
    name: 'outcome',
  });
  const selectedOutcomes = field.value;
  const setSelectedOutcomes = field.onChange;
  return { selectedOutcomes, setSelectedOutcomes };
}

export function useDateRangeFilter() {
  const { field } = useController<DecisionFiltersForm, 'dateRange'>({
    name: 'dateRange',
  });
  const dateRange = field.value;
  const setDateRange = field.onChange;
  return { dateRange, setDateRange };
}

export function useScenarioFilter() {
  const { scenarios } = useDecisionFiltersContext();
  const { field } = useController<DecisionFiltersForm, 'scenarioId'>({
    name: 'scenarioId',
  });
  const selectedScenarioIds = field.value;
  const setSelectedScenarioIds = field.onChange;
  return { scenarios, selectedScenarioIds, setSelectedScenarioIds };
}

export function useTriggerObjectFilter() {
  const { scenarios } = useDecisionFiltersContext();
  const { field } = useController<DecisionFiltersForm, 'triggerObject'>({
    name: 'triggerObject',
  });
  const triggerObjects = useMemo(
    () =>
      R.pipe(
        scenarios,
        R.map((scenario) => scenario.triggerObjectType),
        R.uniq(),
      ),
    [scenarios],
  );
  const selectedTriggerObjects = field.value;
  const setSelectedTriggerObjects = field.onChange;
  return { triggerObjects, selectedTriggerObjects, setSelectedTriggerObjects };
}

/**
 * Split decisions filters in two partitions:
 * - undefinedCasesFilterNames: filter values are undefined
 * - definedCasesFilterNames: filter values are defined
 */
export function useDecisionFiltersPartition() {
  const { filterValues } = useDecisionFiltersContext();

  const [undefinedDecisionFilterNames, definedDecisionFilterNames] = R.pipe(
    decisionFilterNames,
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isObject(value)) return R.isEmpty(value);
      return R.isNil(value);
    }),
  );
  return {
    undefinedDecisionFilterNames,
    definedDecisionFilterNames,
  };
}

export function useClearFilter() {
  const { submitDecisionFilters } = useDecisionFiltersContext();
  const { setValue } = useFormContext<DecisionFiltersForm>();

  return useCallback(
    (filterName: DecisionFilterName) => {
      setValue(filterName, emptyDecisionFilters[filterName]);
      submitDecisionFilters();
    },
    [setValue, submitDecisionFilters],
  );
}
