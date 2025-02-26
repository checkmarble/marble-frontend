import { createSimpleContext } from '@app-builder/utils/create-context';
import { type FieldName } from '@conform-to/react';
import * as React from 'react';

interface FieldNameContextValue {
  name: string;
  description?: React.ReactNode;
}

const FieldNameContext = createSimpleContext<FieldNameContextValue>('FieldName');
export const useFieldName = FieldNameContext.useValue;

interface FormFieldProps<Schema> extends React.ComponentPropsWithoutRef<'div'> {
  name: FieldName<Schema>;
  description?: React.ReactNode;
}

export function FormField<Schema>({ name, description, ...props }: FormFieldProps<Schema>) {
  const value = React.useMemo(
    () => ({
      name,
      description,
    }),
    [name, description],
  );
  return (
    <FieldNameContext.Provider value={value}>
      <div {...props} />
    </FieldNameContext.Provider>
  );
}
