import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useCallback, useMemo } from 'react';
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';
import * as R from 'remeda';
import * as z from 'zod';

import { type RulesFilterName, rulesFilterNames } from './filters';

export const rulesFiltersSchema = z.object({
  ruleGroup: z.array(z.string()).optional(),
});

export type RulesFilters = z.infer<typeof rulesFiltersSchema>;

interface RulesFiltersContextValue {
  filterValues: RulesFilters;
  ruleGroups: string[];
  submitRulesFilters: () => void;
  onRulesFilterClose: () => void;
}

const RulesFiltersContext = createSimpleContext<RulesFiltersContextValue>(
  'RulesFiltersContext',
);

export type RulesFiltersForm = {
  ruleGroup: string[];
};
const emptyRulesFilters: RulesFiltersForm = {
  ruleGroup: [],
};

function adaptRulesFiltersForm(filters: RulesFilters): RulesFiltersForm {
  const adaptedFilterValues: RulesFiltersForm = {
    ...emptyRulesFilters,
    ...filters,
  };
  return adaptedFilterValues;
}
function adaptRulesFilters(filters: RulesFiltersForm): RulesFilters {
  const adaptedFilters: RulesFilters = {};
  if (!R.isEmpty(filters.ruleGroup)) {
    adaptedFilters.ruleGroup = filters.ruleGroup;
  }
  return adaptedFilters;
}

export function RulesFiltersProvider({
  filterValues,
  ruleGroups,
  submitRulesFilters: _submitRulesFilters,
  children,
}: {
  filterValues: RulesFilters;
  ruleGroups: string[];
  submitRulesFilters: (filterValues: RulesFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm<RulesFiltersForm>({
    defaultValues: emptyRulesFilters,
    values: adaptRulesFiltersForm(filterValues),
  });
  const { isDirty } = formMethods.formState;
  const submitRulesFilters = useCallbackRef(() => {
    const formValues = formMethods.getValues();
    _submitRulesFilters(adaptRulesFilters(formValues));
  });
  const onRulesFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitRulesFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitRulesFilters,
      onRulesFilterClose,
      filterValues,
      ruleGroups,
    }),
    [filterValues, onRulesFilterClose, ruleGroups, submitRulesFilters],
  );
  return (
    <FormProvider {...formMethods}>
      <RulesFiltersContext.Provider value={value}>
        {children}
      </RulesFiltersContext.Provider>
    </FormProvider>
  );
}

export const useRulesFiltersContext = RulesFiltersContext.useValue;

export function useRuleGroupFilter() {
  const { ruleGroups } = useRulesFiltersContext();
  const { field } = useController<RulesFiltersForm, 'ruleGroup'>({
    name: 'ruleGroup',
  });
  const selectedRuleGroups = field.value;
  const setSelectedRuleGroups = field.onChange;
  return { ruleGroups, selectedRuleGroups, setSelectedRuleGroups };
}

/**
 * Split rules filters in two partitions:
 * - undefinedRulesFilterNames: filter values are undefined
 * - definedRulesFilterNames: filter values are defined
 */
export function useRulesFiltersPartition() {
  const { filterValues } = useRulesFiltersContext();

  const [undefinedRulesFilterNames, definedRulesFilterNames] = R.pipe(
    rulesFilterNames,
    R.partition((filterName) => {
      const value = filterValues[filterName];
      if (R.isArray(value)) return value.length === 0;
      if (R.isPlainObject(value)) return R.isEmpty(value);
      return R.isNullish(value);
    }),
  );
  return {
    undefinedRulesFilterNames,
    definedRulesFilterNames,
  };
}

export function useClearFilter() {
  const { submitRulesFilters } = useRulesFiltersContext();
  const { setValue } = useFormContext<RulesFiltersForm>();

  return useCallback(
    (filterName: RulesFilterName) => {
      setValue(filterName, emptyRulesFilters[filterName]);
      submitRulesFilters();
    },
    [setValue, submitRulesFilters],
  );
}

export function useClearAllFilters() {
  const { submitRulesFilters } = useRulesFiltersContext();
  const { reset } = useFormContext<RulesFiltersForm>();

  return useCallback(() => {
    reset(emptyRulesFilters);
    submitRulesFilters();
  }, [reset, submitRulesFilters]);
}
