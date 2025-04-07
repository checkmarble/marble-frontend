import { type CaseEventType, caseEventTypes } from '@app-builder/models/cases';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type DateRangeFilterForm, dateRangeSchema } from '@app-builder/utils/schema/filterSchema';
import { useCallback, useMemo } from 'react';
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod';

import { type CaseHistoryFilterFilterName, caseHistoryFilterNames } from './filters';

export const caseHistoryFiltersSchema = z.object({
  caseEventTypes: z.array(
    z.union(
      caseEventTypes.map((t) => z.literal(t)) as [
        z.ZodLiteral<CaseEventType>,
        z.ZodLiteral<CaseEventType>,
        ...z.ZodLiteral<CaseEventType>[],
      ],
    ),
  ),
  dateRange: dateRangeSchema.optional(),
});
export type CaseHistoryFilters = z.infer<typeof caseHistoryFiltersSchema>;

interface CaseHistoryFiltersContextValue {
  filterValues: CaseHistoryFilters;
  submitCasesFilters: () => void;
  onCaseHistoryFilterClose: () => void;
}

const CaseHistoryFiltersContext = createSimpleContext<CaseHistoryFiltersContextValue>(
  'CaseHistoryFiltersContext',
);

export type CaseHistoryFiltersForm = {
  caseEventTypes: CaseEventType[];
  dateRange: DateRangeFilterForm;
};
const emptyCaseHistoryFilters: CaseHistoryFiltersForm = {
  caseEventTypes: [],
  dateRange: null,
};

function adaptFilterValues({
  dateRange,
  ...otherFilters
}: CaseHistoryFilters): CaseHistoryFiltersForm {
  const adaptedFilterValues: CaseHistoryFiltersForm = {
    ...emptyCaseHistoryFilters,
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

export function CaseHistoryFiltersProvider({
  filterValues,
  submitCasesFilters: _submitCasesFilters,
  children,
}: {
  filterValues: CaseHistoryFilters;
  submitCasesFilters: (filterValues: CaseHistoryFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm<CaseHistoryFiltersForm>({
    defaultValues: emptyCaseHistoryFilters,
    values: adaptFilterValues(filterValues),
  });
  const { isDirty } = formMethods.formState;
  const submitCasesFilters = useCallbackRef(() => {
    const formValues = formMethods.getValues();
    _submitCasesFilters({
      ...formValues,
      dateRange: formValues.dateRange ?? undefined,
    });
  });
  const onCaseHistoryFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitCasesFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitCasesFilters,
      onCaseHistoryFilterClose,
      filterValues,
    }),
    [filterValues, onCaseHistoryFilterClose, submitCasesFilters],
  );
  return (
    <FormProvider {...formMethods}>
      <CaseHistoryFiltersContext.Provider value={value}>
        {children}
      </CaseHistoryFiltersContext.Provider>
    </FormProvider>
  );
}

export const useCaseHistoryFiltersContext = CaseHistoryFiltersContext.useValue;

export function useCaseEventTypesFilter() {
  const { field } = useController<CaseHistoryFiltersForm, 'caseEventTypes'>({
    name: 'caseEventTypes',
  });
  const selectedCaseEventTypes = field.value;
  const setSelectedCaseEventTypes = field.onChange;
  return { selectedCaseEventTypes, setSelectedCaseEventTypes };
}

export function useDateRangeFilter() {
  const { field } = useController<CaseHistoryFiltersForm, 'dateRange'>({
    name: 'dateRange',
  });
  const dateRange = field.value;
  const setDateRange = field.onChange;
  return { dateRange, setDateRange };
}

/**
 * Split cases filters in two partitions:
 * - undefinedCaseHistoryFilterNames: filter values are undefined
 * - definedCaseHistoryFilterNames: filter values are defined
 */
export function useCaseHistoryFiltersPartition() {
  const { filterValues } = useCaseHistoryFiltersContext();

  const [undefinedCaseHistoryFilterNames, definedCaseHistoryFilterNames] = R.pipe(
    caseHistoryFilterNames,
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isPlainObject(value)) return R.isEmpty(value);
      return R.isNullish(value);
    }),
  );
  return {
    undefinedCaseHistoryFilterNames,
    definedCaseHistoryFilterNames,
  };
}

export function useClearFilter() {
  const { submitCasesFilters } = useCaseHistoryFiltersContext();
  const { setValue } = useFormContext<CaseHistoryFiltersForm>();

  return useCallback(
    (filterName: CaseHistoryFilterFilterName) => {
      setValue(filterName, emptyCaseHistoryFilters[filterName]);
      submitCasesFilters();
    },
    [setValue, submitCasesFilters],
  );
}

export function useClearAllFilters() {
  const { submitCasesFilters } = useCaseHistoryFiltersContext();
  const { reset } = useFormContext<CaseHistoryFiltersForm>();

  return useCallback(() => {
    reset(emptyCaseHistoryFilters);
    submitCasesFilters();
  }, [reset, submitCasesFilters]);
}
