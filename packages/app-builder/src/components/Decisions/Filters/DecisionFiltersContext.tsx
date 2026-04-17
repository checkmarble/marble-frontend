import { type ReviewStatus } from '@app-builder/models/decision';
import { type Inbox } from '@app-builder/models/inbox';
import { type KnownOutcome } from '@app-builder/models/outcome';
import { type Scenario } from '@app-builder/models/scenario';
import { DecisionFilters } from '@app-builder/schemas/decisions';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type DateRangeFilterForm } from '@app-builder/utils/schema/filterSchema';
import { useForm, useStore } from '@tanstack/react-form';
import * as React from 'react';
import * as R from 'remeda';
import { type DecisionFilterName, decisionFilterNames } from './filters';

// Helper to capture the inferred form type without partial generic application
function _useDecisionFiltersForm() {
  return useForm({ defaultValues: emptyDecisionFilters });
}
type DecisionFiltersFormApi = ReturnType<typeof _useDecisionFiltersForm>;

interface DecisionFiltersContextValue {
  hasPivots: boolean;
  filterValues: DecisionFilters;
  scenarios: Scenario[];
  inboxes: Inbox[];
  submitDecisionFilters: () => void;
  onDecisionFilterClose: () => void;
  form: DecisionFiltersFormApi;
}

const DecisionFiltersContext = createSimpleContext<DecisionFiltersContextValue>('DecisionFiltersContext');

export type DecisionFiltersForm = {
  dateRange: DateRangeFilterForm;
  hasCase: boolean | null;
  outcomeAndReviewStatus: {
    outcome: KnownOutcome;
    reviewStatus?: ReviewStatus;
  } | null;
  pivotValue: string | null;
  scenarioId: string[];
  scheduledExecutionId: string[];
  caseInboxId: string[];
  triggerObject: string[];
  triggerObjectId: string | null;
};
const emptyDecisionFilters: DecisionFiltersForm = {
  dateRange: null,
  hasCase: null,
  outcomeAndReviewStatus: null,
  pivotValue: null,
  scenarioId: [],
  scheduledExecutionId: [],
  caseInboxId: [],
  triggerObject: [],
  triggerObjectId: null,
};

function adaptFilterValues({ dateRange, ...otherFilters }: DecisionFilters): DecisionFiltersForm {
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
  const form = useForm({
    defaultValues: adaptFilterValues(filterValues),
  });

  React.useEffect(() => {
    form.reset(adaptFilterValues(filterValues));
  }, [filterValues]);

  const submitDecisionFilters = useCallbackRef(() => {
    const formValues = form.state.values;
    _submitDecisionFilters({
      ...formValues,
      outcomeAndReviewStatus: formValues.outcomeAndReviewStatus ?? undefined,
      dateRange: formValues.dateRange ?? undefined,
      hasCase: formValues.hasCase ?? undefined,
      pivotValue: formValues.pivotValue ?? undefined,
      triggerObjectId: formValues.triggerObjectId ?? undefined,
    });
  });
  const onDecisionFilterClose = useCallbackRef(() => {
    if (form.state.isDirty) {
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
      form,
    }),
    [filterValues, hasPivots, onDecisionFilterClose, scenarios, inboxes, submitDecisionFilters, form],
  );
  return <DecisionFiltersContext.Provider value={value}>{children}</DecisionFiltersContext.Provider>;
}

export const useDecisionFiltersContext = DecisionFiltersContext.useValue;

export function useDateRangeFilter() {
  const { form } = useDecisionFiltersContext();
  const dateRange = useStore(form.store, (state) => state.values.dateRange);
  const setDateRange = (value: DateRangeFilterForm | undefined) => form.setFieldValue('dateRange', value ?? null);
  return { dateRange, setDateRange };
}

export function useHasCaseFilter() {
  const { form } = useDecisionFiltersContext();
  const selectedHasCase = useStore(form.store, (state) => state.values.hasCase);
  const setSelectedHasCase = (value: boolean | null) => form.setFieldValue('hasCase', value);
  return { selectedHasCase, setSelectedHasCase };
}

export function useOutcomeAndReviewStatusFilter() {
  const { form } = useDecisionFiltersContext();
  const selectedOutcomeAndReviewStatus = useStore(form.store, (state) => state.values.outcomeAndReviewStatus);
  const setOutcomeAndReviewStatus = (value: DecisionFiltersForm['outcomeAndReviewStatus']) =>
    form.setFieldValue('outcomeAndReviewStatus', value);
  return { selectedOutcomeAndReviewStatus, setOutcomeAndReviewStatus };
}

export function usePivotValueFilter() {
  const { hasPivots, form } = useDecisionFiltersContext();
  const selectedPivotValue = useStore(form.store, (state) => state.values.pivotValue);
  const setSelectedPivotValue = (value: string | null) => form.setFieldValue('pivotValue', value);
  return { hasPivots, selectedPivotValue, setSelectedPivotValue };
}

export function useScenarioFilter() {
  const { scenarios, form } = useDecisionFiltersContext();
  const selectedScenarioIds = useStore(form.store, (state) => state.values.scenarioId);
  const setSelectedScenarioIds = (value: string[]) => form.setFieldValue('scenarioId', value);
  return { scenarios, selectedScenarioIds, setSelectedScenarioIds };
}

export function useScheduledExecutionFilter() {
  const { form } = useDecisionFiltersContext();
  const selectedScheduledExecutionIds = useStore(form.store, (state) => state.values.scheduledExecutionId);
  const setSelectedScheduledExecutionIds = (value: string[]) => form.setFieldValue('scheduledExecutionId', value);
  return {
    selectedScheduledExecutionIds,
    setSelectedScheduledExecutionIds,
  };
}

export function useCaseInboxFilter() {
  const { inboxes, form } = useDecisionFiltersContext();
  const selectedCaseInboxIds = useStore(form.store, (state) => state.values.caseInboxId);
  const setSelectedCaseInboxIds = (value: string[]) => form.setFieldValue('caseInboxId', value);
  return {
    inboxes,
    selectedCaseInboxIds,
    setSelectedCaseInboxIds,
  };
}

export function useTriggerObjectFilter() {
  const { scenarios, form } = useDecisionFiltersContext();
  const triggerObjects = React.useMemo(
    () =>
      R.pipe(
        scenarios,
        R.map((scenario) => scenario.triggerObjectType),
        R.unique(),
      ),
    [scenarios],
  );
  const selectedTriggerObjects = useStore(form.store, (state) => state.values.triggerObject);
  const setSelectedTriggerObjects = (value: string[]) => form.setFieldValue('triggerObject', value);
  return { triggerObjects, selectedTriggerObjects, setSelectedTriggerObjects };
}

export function useTriggerObjectIdFilter() {
  const { form } = useDecisionFiltersContext();
  const selectedTriggerObjectId = useStore(form.store, (state) => state.values.triggerObjectId);
  const setSelectedTriggerObjectId = (value: string | null) => form.setFieldValue('triggerObjectId', value);
  return { selectedTriggerObjectId, setSelectedTriggerObjectId };
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
  const { submitDecisionFilters, form } = useDecisionFiltersContext();

  return React.useCallback(
    (filterName: DecisionFilterName) => {
      form.setFieldValue(filterName, emptyDecisionFilters[filterName] as never);
      submitDecisionFilters();
    },
    [form, submitDecisionFilters],
  );
}
