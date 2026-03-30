import { useCreateTableMutation } from '@app-builder/queries/data/create-table';
import { useForm } from '@tanstack/react-form';
import { createContext, useContext } from 'react';
import { adaptCreateTableValue, type CreateTableFormValues, defaultCreateTableFormValues } from './createTable-types';

function useCreateTableForm() {
  const createTableMutation = useCreateTableMutation();
  return useForm({
    defaultValues: defaultCreateTableFormValues satisfies CreateTableFormValues,
    onSubmit: ({ value }) => {
      console.log('submit', value);
      createTableMutation.mutateAsync(adaptCreateTableValue(value));
    },
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
