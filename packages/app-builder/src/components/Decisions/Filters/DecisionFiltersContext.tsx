import {
  type ReviewStatus,
  reviewStatuses,
} from '@app-builder/models/decision';
import { type Inbox } from '@app-builder/models/inbox';
import { type KnownOutcome, knownOutcomes } from '@app-builder/models/outcome';
import { type Scenario } from '@app-builder/models/scenario';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import {
  type DateRangeFilterForm,
  dateRangeSchema,
} from '@app-builder/utils/schema/filterSchema';
import * as React from 'react';
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
  dateRange: dateRangeSchema.optional(),
  hasCase: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  outcomeAndReviewStatus: z
    .object({
      outcome: z.enum(knownOutcomes),
      reviewStatus: z.enum(reviewStatuses).optional(),
    })
    .optional(),
  pivotValue: z.string().optional(),
  scenarioId: z.array(z.string()).optional(),
  caseInboxId: z.array(z.string()).optional(),
  triggerObject: z.array(z.string()).optional(),
});

export type DecisionFilters = z.infer<typeof decisionFiltersSchema>;

interface DecisionFiltersContextValue {
  hasPivots: boolean;
  filterValues: DecisionFilters;
  scenarios: Scenario[];
  inboxes: Inbox[];
  submitDecisionFilters: () => void;
  onDecisionFilterClose: () => void;
}

const DecisionFiltersContext = createSimpleContext<DecisionFiltersContextValue>(
  'DecisionFiltersContext',
);

export type DecisionFiltersForm = {
  dateRange: DateRangeFilterForm;
  hasCase: boolean | null;
  outcomeAndReviewStatus: {
    outcome: KnownOutcome;
    reviewStatus?: ReviewStatus;
  } | null;
  pivotValue: string | null;
  scenarioId: string[];
  caseInboxId: string[];
  triggerObject: string[];
};
const emptyDecisionFilters: DecisionFiltersForm = {
  dateRange: null,
  hasCase: null,
  outcomeAndReviewStatus: null,
  pivotValue: null,
  scenarioId: [],
  caseInboxId: [],
  triggerObject: [],
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
  hasPivots,
  filterValues,
  scenarios,
  inboxes,
  submitDecisionFilters: _submitDecisionFilters,
  children,
}: {
  hasPivots: boolean;
  filterValues: DecisionFilters;
  scenarios: Scenario[];
  inboxes: Inbox[];
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
      outcomeAndReviewStatus: formValues.outcomeAndReviewStatus ?? undefined,
      dateRange: formValues.dateRange ?? undefined,
      hasCase: formValues.hasCase ?? undefined,
      pivotValue: formValues.pivotValue ?? undefined,
    });
  });
  const onDecisionFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitDecisionFilters();
    }
  });

  const value = React.useMemo(
    () => ({
      submitDecisionFilters,
      onDecisionFilterClose,
      filterValues,
      scenarios,
      hasPivots,
      inboxes,
    }),
    [
      filterValues,
      hasPivots,
      onDecisionFilterClose,
      scenarios,
      inboxes,
      submitDecisionFilters,
    ],
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

export function useDateRangeFilter() {
  const { field } = useController<DecisionFiltersForm, 'dateRange'>({
    name: 'dateRange',
  });
  const dateRange = field.value;
  const setDateRange = field.onChange;
  return { dateRange, setDateRange };
}

export function useHasCaseFilter() {
  const { field } = useController<DecisionFiltersForm, 'hasCase'>({
    name: 'hasCase',
  });
  const selectedHasCase = field.value;
  const setSelectedHasCase = field.onChange;
  return { selectedHasCase, setSelectedHasCase };
}

export function useOutcomeAndReviewStatusFilter() {
  const { field } = useController<
    DecisionFiltersForm,
    'outcomeAndReviewStatus'
  >({
    name: 'outcomeAndReviewStatus',
  });
  const selectedOutcomeAndReviewStatus = field.value;
  const setOutcomeAndReviewStatus = field.onChange;
  return { selectedOutcomeAndReviewStatus, setOutcomeAndReviewStatus };
}

export function usePivotValueFilter() {
  const { hasPivots } = useDecisionFiltersContext();
  const { field } = useController<DecisionFiltersForm, 'pivotValue'>({
    name: 'pivotValue',
  });
  const selectedPivotValue = field.value;
  const setSelectedPivotValue = field.onChange;
  return { hasPivots, selectedPivotValue, setSelectedPivotValue };
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

export function useCaseInboxFilter() {
  const { inboxes } = useDecisionFiltersContext();
  const { field } = useController<DecisionFiltersForm, 'caseInboxId'>({
    name: 'caseInboxId',
  });
  const selectedCaseInboxIds = field.value;
  const setSelectedCaseInboxIds = field.onChange;
  return {
    inboxes,
    selectedCaseInboxIds,
    setSelectedCaseInboxIds,
  };
}

export function useTriggerObjectFilter() {
  const { scenarios } = useDecisionFiltersContext();
  const { field } = useController<DecisionFiltersForm, 'triggerObject'>({
    name: 'triggerObject',
  });
  const triggerObjects = React.useMemo(
    () =>
      R.pipe(
        scenarios,
        R.map((scenario) => scenario.triggerObjectType),
        R.unique(),
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
      if (R.isPlainObject(value)) return R.isEmpty(value);
      return R.isNullish(value);
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

  return React.useCallback(
    (filterName: DecisionFilterName) => {
      setValue(filterName, emptyDecisionFilters[filterName]);
      submitDecisionFilters();
    },
    [setValue, submitDecisionFilters],
  );
}
