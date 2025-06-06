/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { type CasesFiltersForm, useCasesFiltersContext } from '../CasesFiltersContext';

export function CasesExcludeAssignedFilter() {
  const { submitCasesFilters } = useCasesFiltersContext();
  const { setValue } = useFormContext<CasesFiltersForm>();

  useMemo(() => {
    setValue('excludeAssigned', true);
    submitCasesFilters();
  }, []);
  return null;
}
