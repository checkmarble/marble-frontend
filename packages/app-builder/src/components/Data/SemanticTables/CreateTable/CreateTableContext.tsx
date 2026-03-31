import { useForm } from '@tanstack/react-form';
import { createContext, useContext } from 'react';
import { type SemanticTableFormValues } from '../Shared/semanticData-types';
import { defaultCreateTableFormValues } from './createTable-types';

function useCreateTableForm(onSubmit: (value: SemanticTableFormValues) => void | Promise<void>) {
  return useForm({
    defaultValues: defaultCreateTableFormValues,
    onSubmit: ({ value }) => onSubmit(value),
  });
}

export type CreateTableFormInstance = ReturnType<typeof useCreateTableForm>;

export const CreateTableFormContext = createContext<CreateTableFormInstance | null>(null);

export function useCreateTableFormContext() {
  const ctx = useContext(CreateTableFormContext);
  if (!ctx) throw new Error('useCreateTableFormContext must be used within CreateTableDrawer');
  return ctx;
}

export { useCreateTableForm };
