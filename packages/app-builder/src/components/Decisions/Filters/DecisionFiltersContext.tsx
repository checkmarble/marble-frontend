import { createSimpleContext } from '@app-builder/utils/create-context';
import { inputFromSearch } from '@app-builder/utils/input-validation';
import { useSearchParams } from '@remix-run/react';
import * as z from 'zod';

const decisionFiltersSchema = z.object({
  outcome: z.enum(['approve', 'review', 'decline']).optional(),
});

type DecisionFilters = z.infer<typeof decisionFiltersSchema>;

interface DecisionFiltersContextValue {
  filters: DecisionFilters;
  setFilters: (filters: DecisionFilters) => void;
}

const DecisionFiltersContext = createSimpleContext<DecisionFiltersContextValue>(
  'DecisionFiltersContext'
);

export function DecisionFiltersProvider() {
  const [searchParams, setSearchParams] = useSearchParams();

  console.log(decisionFiltersSchema.safeParse(inputFromSearch(searchParams)));
}
