import { type ReviewStatus } from '@app-builder/models/decision';
import { type KnownOutcome } from '@app-builder/models/outcome';
import { type DecisionFilters, unboundedDateRange } from '@app-builder/schemas/decisions';
import { type DateRangeFilterForm } from '@app-builder/utils/schema/filterSchema';

export function getDecisionFilters(filters: DecisionFilters): DecisionFilters {
  const dateRange = filters.dateRange;
  return {
    outcomeAndReviewStatus: filters.outcomeAndReviewStatus,
    triggerObject: filters.triggerObject?.length ? filters.triggerObject : undefined,
    triggerObjectId: filters.triggerObjectId,
    // Keep URL, form, and pagination representations equivalent.
    dateRange:
      dateRange?.type === 'static'
        ? {
            type: 'static',
            startDate: dateRange.startDate || undefined,
            endDate: dateRange.endDate || undefined,
          }
        : (dateRange ?? unboundedDateRange),
    pivotValue: filters.pivotValue,
    scenarioId: filters.scenarioId?.length ? filters.scenarioId : undefined,
    scheduledExecutionId: filters.scheduledExecutionId?.length ? filters.scheduledExecutionId : undefined,
    caseInboxId: filters.caseInboxId?.length ? filters.caseInboxId : undefined,
    hasCase: filters.hasCase,
  };
}

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
export const emptyDecisionFilters: DecisionFiltersForm = {
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

export function toSubmittedDecisionFilters(formValues: DecisionFiltersForm): DecisionFilters {
  return getDecisionFilters({
    ...formValues,
    outcomeAndReviewStatus: formValues.outcomeAndReviewStatus ?? undefined,
    dateRange: formValues.dateRange ?? unboundedDateRange,
    hasCase: formValues.hasCase ?? undefined,
    pivotValue: formValues.pivotValue ?? undefined,
    triggerObjectId: formValues.triggerObjectId ?? undefined,
  });
}

export function adaptFilterValues(filterValues: DecisionFilters): DecisionFiltersForm {
  let dateRange: DateRangeFilterForm = null;
  if (filterValues.dateRange?.type === 'static') {
    dateRange = {
      type: 'static',
      startDate: filterValues.dateRange.startDate ?? '',
      endDate: filterValues.dateRange.endDate ?? '',
    };
  } else if (filterValues.dateRange?.type === 'dynamic' && filterValues.dateRange.fromNow) {
    dateRange = { type: 'dynamic', fromNow: filterValues.dateRange.fromNow };
  }
  return {
    dateRange,
    hasCase: filterValues.hasCase ?? null,
    outcomeAndReviewStatus: filterValues.outcomeAndReviewStatus ?? null,
    pivotValue: filterValues.pivotValue ?? null,
    scenarioId: filterValues.scenarioId ?? [],
    scheduledExecutionId: filterValues.scheduledExecutionId ?? [],
    caseInboxId: filterValues.caseInboxId ?? [],
    triggerObject: filterValues.triggerObject ?? [],
    triggerObjectId: filterValues.triggerObjectId ?? null,
  };
}
