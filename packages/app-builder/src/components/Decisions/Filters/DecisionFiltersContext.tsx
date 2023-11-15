import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type Scenario } from 'marble-api';
import { useCallback, useMemo } from 'react';
import {
  type DeepRequired,
  FormProvider,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';
import * as z from 'zod';

import { type DecisionFilterName, decisionFilterNames } from './filters';

export const fromNowDurations = [
  Temporal.Duration.from({ days: -7 }).toString(),
  Temporal.Duration.from({ days: -14 }).toString(),
  Temporal.Duration.from({ days: -30 }).toString(),
  Temporal.Duration.from({ months: -3 }).toString(),
  Temporal.Duration.from({ months: -6 }).toString(),
  Temporal.Duration.from({ months: -12 }).toString(),
] as const;

export const decisionFiltersSchema = z.object({
  outcome: z.array(z.enum(['approve', 'review', 'decline'])).optional(),
  triggerObject: z.array(z.string()).optional(),
  dateRange: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('static'),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
      z.object({
        type: z.literal('dynamic'),
        fromNow: z.string().refine((value) => {
          try {
            Temporal.Duration.from(value);
            return true;
          } catch {
            return false;
          }
        }),
      }),
    ])
    .optional(),
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
  'DecisionFiltersContext'
);

export type DecisionFiltersForm = DeepRequired<DecisionFilters>;
const emptyDecisionFilters: DecisionFiltersForm = {
  outcome: [],
  triggerObject: [],
  dateRange: {
    type: 'static',
    startDate: '',
    endDate: '',
  },
  scenarioId: [],
};

function adaptFilterValues(filterValues: DecisionFilters): DecisionFiltersForm {
  const adaptedFilterValues: DecisionFiltersForm = {
    outcome: filterValues.outcome ?? [],
    triggerObject: filterValues.triggerObject ?? [],
    scenarioId: filterValues.scenarioId ?? [],
    dateRange: {
      type: 'static',
      startDate: '',
      endDate: '',
    },
  };
  if (filterValues.dateRange?.type === 'static') {
    adaptedFilterValues.dateRange = {
      type: 'static',
      startDate: filterValues.dateRange.startDate ?? '',
      endDate: filterValues.dateRange.endDate ?? '',
    };
  }
  if (
    filterValues.dateRange?.type === 'dynamic' &&
    filterValues.dateRange.fromNow
  ) {
    adaptedFilterValues.dateRange = {
      type: 'dynamic',
      fromNow: filterValues.dateRange.fromNow,
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
    _submitDecisionFilters(formMethods.getValues());
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
    [filterValues, onDecisionFilterClose, scenarios, submitDecisionFilters]
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
        R.uniq()
      ),
    [scenarios]
  );
  const selectedTriggerObjects = field.value;
  const setSelectedTriggerObjects = field.onChange;
  return { triggerObjects, selectedTriggerObjects, setSelectedTriggerObjects };
}

export function useDecisionFiltersPartition() {
  const { filterValues } = useDecisionFiltersContext();

  const [undefinedDecisionFilterNames, definedDecisionFilterNames] = R.pipe(
    decisionFilterNames,
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isObject(value)) return R.isEmpty(value);
      return R.isNil(value);
    })
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
    [setValue, submitDecisionFilters]
  );
}
