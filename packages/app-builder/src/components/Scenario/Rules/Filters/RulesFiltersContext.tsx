import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { useForm, useStore } from '@tanstack/react-form';
import { useCallback, useEffect, useMemo } from 'react';
import * as R from 'remeda';
import * as z from 'zod/v4';

import { type RulesFilterName, rulesFilterNames } from './filters';

export const rulesFiltersSchema = z.object({
  ruleGroup: protectArray(z.array(z.string())).optional(),
});

export type RulesFilters = z.infer<typeof rulesFiltersSchema>;

export type RulesFiltersForm = {
  ruleGroup: string[];
};
const emptyRulesFilters: RulesFiltersForm = {
  ruleGroup: [],
};

// Helper to capture the inferred form type without partial generic application
function _useRulesFiltersForm() {
  return useForm({ defaultValues: emptyRulesFilters });
}
type RulesFiltersFormApi = ReturnType<typeof _useRulesFiltersForm>;

interface RulesFiltersContextValue {
  filterValues: RulesFilters;
  ruleGroups: string[];
  submitRulesFilters: () => void;
  onRulesFilterClose: () => void;
  form: RulesFiltersFormApi;
}

const RulesFiltersContext = createSimpleContext<RulesFiltersContextValue>('RulesFiltersContext');

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
  const form = useForm({
    defaultValues: adaptRulesFiltersForm(filterValues),
  });

  useEffect(() => {
    form.reset(adaptRulesFiltersForm(filterValues));
  }, [filterValues]);

  const submitRulesFilters = useCallbackRef(() => {
    _submitRulesFilters(adaptRulesFilters(form.state.values));
  });
  const onRulesFilterClose = useCallbackRef(() => {
    if (form.state.isDirty) {
      submitRulesFilters();
    }
  });

  const value = useMemo(
    () => ({
      submitRulesFilters,
      onRulesFilterClose,
      filterValues,
      ruleGroups,
      form,
    }),
    [filterValues, onRulesFilterClose, ruleGroups, submitRulesFilters, form],
  );
  return <RulesFiltersContext.Provider value={value}>{children}</RulesFiltersContext.Provider>;
}

export const useRulesFiltersContext = RulesFiltersContext.useValue;

export function useRuleGroupFilter() {
  const { ruleGroups, form } = useRulesFiltersContext();
  const selectedRuleGroups = useStore(form.store, (state) => state.values.ruleGroup);
  const setSelectedRuleGroups = (value: string[]) => form.setFieldValue('ruleGroup', value);
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
  const { submitRulesFilters, form } = useRulesFiltersContext();

  return useCallback(
    (filterName: RulesFilterName) => {
      form.setFieldValue(filterName, emptyRulesFilters[filterName]);
      submitRulesFilters();
    },
    [form, submitRulesFilters],
  );
}

export function useClearAllFilters() {
  const { submitRulesFilters, form } = useRulesFiltersContext();

  return useCallback(() => {
    form.reset(emptyRulesFilters);
    submitRulesFilters();
  }, [form, submitRulesFilters]);
}
