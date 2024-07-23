import { createSimpleContext } from '@app-builder/utils/create-context';
import { type FieldName } from '@conform-to/react';
import * as React from 'react';

interface FieldNameContextValue {
  name: string;
  description?: string;
}

const FieldNameContext =
  createSimpleContext<FieldNameContextValue>('FieldName');
export const useFieldName = FieldNameContext.useValue;

export function FormField<Schema>({
  name,
  description,
  ...props
}: {
  name: FieldName<Schema>;
  description?: string;
} & React.ComponentPropsWithoutRef<'div'>) {
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
