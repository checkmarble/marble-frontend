import { createSimpleContext } from '@app-builder/utils/create-context';
import { type FieldConfig } from '@conform-to/react';
import type * as React from 'react';

const FieldConfigContext =
  createSimpleContext<FieldConfig<void>>('FieldConfig');
export const useFieldConfig = FieldConfigContext.useValue;

export function FormField<Schema>({
  config,
  ...props
}: {
  config: FieldConfig<Schema>;
} & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <FieldConfigContext.Provider value={config}>
      <div {...props} />
    </FieldConfigContext.Provider>
  );
}
