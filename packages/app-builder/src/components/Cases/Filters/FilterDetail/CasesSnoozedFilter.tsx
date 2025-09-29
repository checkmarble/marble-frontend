/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { type CasesFiltersForm, useCasesFiltersContext } from '../CasesFiltersContext';

export function CasesSnoozedFilter({ close }: { close: () => void }) {
  const { submitCasesFilters } = useCasesFiltersContext();
  const { setValue } = useFormContext<CasesFiltersForm>();

  useMemo(() => {
    setValue('includeSnoozed', true);
    submitCasesFilters();
    close();
  }, []);

  return null;
}
