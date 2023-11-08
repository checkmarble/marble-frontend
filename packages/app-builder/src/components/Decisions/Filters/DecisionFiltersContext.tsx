import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useMemo } from 'react';
import { FormProvider, useController, useForm } from 'react-hook-form';
import * as z from 'zod';

export const decisionFiltersSchema = z.object({
  outcome: z.array(z.enum(['approve', 'review', 'decline'])).optional(),
  triggerObject: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  scenarioId: z.array(z.string()).optional(),
});

export type DecisionFilters = z.infer<typeof decisionFiltersSchema>;

interface DecisionFiltersContextValue {
  onDecisionFilterClose: () => void;
}

const DecisionFiltersContext = createSimpleContext<DecisionFiltersContextValue>(
  'DecisionFiltersContext'
);

const emptyDecisionFilters: DecisionFilters = {
  outcome: [],
  triggerObject: [],
  startDate: '',
  endDate: '',
  scenarioId: [],
};

export function DecisionFiltersProvider({
  filterValues,
  submitDecisionFilters,
  children,
}: {
  filterValues: DecisionFilters;
  submitDecisionFilters: (filterValues: DecisionFilters) => void;
  children: React.ReactNode;
}) {
  const formMethods = useForm({
    defaultValues: emptyDecisionFilters,
    values: { ...emptyDecisionFilters, ...filterValues },
  });
  const { isDirty } = formMethods.formState;
  const onDecisionFilterClose = useCallbackRef(() => {
    if (isDirty) {
      submitDecisionFilters(formMethods.getValues());
    }
  });

  const value = useMemo(
    () => ({
      onDecisionFilterClose,
    }),
    [onDecisionFilterClose]
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

export function useOutcomeFilter() {
  const { field } = useController<DecisionFilters, 'outcome'>({
    name: 'outcome',
  });
  const selectedOutcomes = field.value ?? [];
  const setSelectedOutcomes = field.onChange;
  return [selectedOutcomes, setSelectedOutcomes] as const;
}
