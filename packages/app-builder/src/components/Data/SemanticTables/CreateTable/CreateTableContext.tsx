import { useForm } from '@tanstack/react-form';
import { createContext, useContext } from 'react';
import { type CreateTableFormValues, defaultCreateTableFormValues } from './createTable-types';

function useCreateTableForm(onSubmit: (value: CreateTableFormValues) => void | Promise<void>) {
  return useForm({
    defaultValues: defaultCreateTableFormValues satisfies CreateTableFormValues,
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
