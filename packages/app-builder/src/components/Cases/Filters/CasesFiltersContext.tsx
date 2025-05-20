import { type CaseStatus, caseStatuses } from '@app-builder/models/cases';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type DateRangeFilterForm, dateRangeSchema } from '@app-builder/utils/schema/filterSchema';
import { useCallback, useMemo } from 'react';
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod';

import { type CasesFilterName, casesFilterNames } from './filters';

export const casesFiltersSchema = z.object({
  statuses: z
    .array(
      z.union(
        caseStatuses.map((s) => z.literal(s)) as [
          z.ZodLiteral<CaseStatus>,
          z.ZodLiteral<CaseStatus>,
          ...z.ZodLiteral<CaseStatus>[],
        ],
      ),
    )
    .optional(),
  dateRange: dateRangeSchema.optional(),
  name: z.string().optional(),
  includeSnoozed: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  excludeAssigned: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export type CasesFilters = z.infer<typeof casesFiltersSchema>;

interface CasesFiltersContextValue {
  filterValues: CasesFilters;
  submitCasesFilters: () => void;
  onCasesFilterClose: () => void;
}

const CasesFiltersContext = createSimpleContext<CasesFiltersContextValue>('CasesFiltersContext');

export type CasesFiltersForm = {
  statuses: CaseStatus[];
  dateRange: DateRangeFilterForm;
  name?: string;
  includeSnoozed?: boolean;
  excludeAssigned?: boolean;
};

const emptyCasesFilters: CasesFiltersForm = {
  statuses: [],
  dateRange: null,
};

function adaptFilterValues({ dateRange, ...otherFilters }: CasesFilters): CasesFiltersForm {
  const adaptedFilterValues: CasesFiltersForm = {
    ...emptyCasesFilters,
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

export function CasesFiltersProvider({
  filterValues,
  submitCasesFilters: _submitCasesFilters,
  children,
}: {
  filterValues: CasesFilters;
  submitCasesFilters: (filterValues: CasesFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm<CasesFiltersForm>({
    defaultValues: emptyCasesFilters,
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
  const onCasesFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitCasesFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitCasesFilters,
      onCasesFilterClose,
      filterValues,
    }),
    [filterValues, onCasesFilterClose, submitCasesFilters],
  );
  return (
    <FormProvider {...formMethods}>
      <CasesFiltersContext.Provider value={value}>{children}</CasesFiltersContext.Provider>
    </FormProvider>
  );
}

export const useCasesFiltersContext = CasesFiltersContext.useValue;

export function useStatusesFilter() {
  const { field } = useController<CasesFiltersForm, 'statuses'>({
    name: 'statuses',
  });
  const selectedStatuses = field.value;
  const setSelectedStatuses = field.onChange;
  return { selectedStatuses, setSelectedStatuses };
}

export function useDateRangeFilter() {
  const { field } = useController<CasesFiltersForm, 'dateRange'>({
    name: 'dateRange',
  });
  const dateRange = field.value;
  const setDateRange = field.onChange;
  return { dateRange, setDateRange };
}

export function useNameFilter() {
  const { field } = useController<CasesFiltersForm, 'name'>({
    name: 'name',
  });
  const name = field.value;
  const setName = field.onChange;
  return { name, setName };
}

/**
 * Split cases filters in two partitions:
 * - undefinedCasesFilterNames: filter values are undefined
 * - definedCasesFilterNames: filter values are defined
 */
export function useCasesFiltersPartition(excludedFilters?: readonly string[]) {
  const { filterValues } = useCasesFiltersContext();

  const [undefinedCasesFilterNames, definedCasesFilterNames] = R.pipe(
    casesFilterNames.filter((filterName) => !excludedFilters?.includes(filterName)),
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isPlainObject(value)) return R.isEmpty(value);
      return R.isNullish(value);
    }),
  );

  return {
    undefinedCasesFilterNames,
    definedCasesFilterNames,
  };
}

export function useClearFilter() {
  const { submitCasesFilters } = useCasesFiltersContext();
  const { setValue } = useFormContext<CasesFiltersForm>();

  return useCallback(
    (filterName: CasesFilterName) => {
      setValue(filterName, emptyCasesFilters[filterName]);
      submitCasesFilters();
    },
    [setValue, submitCasesFilters],
  );
}
