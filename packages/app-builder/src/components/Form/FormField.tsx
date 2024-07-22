import { createSimpleContext } from '@app-builder/utils/create-context';
import { type FieldName } from '@conform-to/react';
import type * as React from 'react';

const FieldNameContext = createSimpleContext<string>('FieldName');
export const useFieldName = FieldNameContext.useValue;

export function FormField<Schema>({
  name,
  ...props
}: {
  name: FieldName<Schema>;
} & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <FieldNameContext.Provider value={name}>
      <div {...props} />
    </FieldNameContext.Provider>
  );
}
