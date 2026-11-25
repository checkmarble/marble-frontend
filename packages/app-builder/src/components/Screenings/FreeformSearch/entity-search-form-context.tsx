import { type SearchableSchema } from '@app-builder/constants/screening-entity';
import { createSimpleContext } from '@marble/shared';
import { useSelector } from '@tanstack/react-form';
import { type ComponentType, type ReactNode } from 'react';

export type EntitySearchFormValues = {
  entityType?: SearchableSchema;
  fields: Record<string, string | undefined>;
};

type EntitySearchFormState = {
  values: EntitySearchFormValues;
  canSubmit: boolean;
  isSubmitting: boolean;
};

type EntitySearchFieldProps = {
  name: 'entityType' | `fields.${string}`;
  children: (fieldApi: {
    name: string;
    state: { value: unknown; meta: { errors: string[] } };
    handleChange: (value: unknown) => void;
    handleBlur: () => void;
  }) => ReactNode;
  validators?: {
    onChange?: (args: { value: unknown }) => string | undefined;
  };
};

type EntitySearchSubscribeProps = {
  selector: (state: EntitySearchFormState) => readonly [boolean, boolean];
  children: (values: readonly [boolean, boolean]) => ReactNode;
};

type EntitySearchFormInstance = {
  store: unknown;
  setFieldValue: (field: 'entityType' | 'fields' | `fields.${string}`, value: unknown) => void;
  state: { values: EntitySearchFormValues };
  Field: ComponentType<EntitySearchFieldProps>;
  Subscribe: ComponentType<EntitySearchSubscribeProps>;
};

const EntitySearchFormContext = createSimpleContext<EntitySearchFormInstance>('EntitySearchForm');

export function EntitySearchFormProvider({ form, children }: { form: unknown; children: ReactNode }) {
  return (
    <EntitySearchFormContext.Provider value={form as EntitySearchFormInstance}>
      {children}
    </EntitySearchFormContext.Provider>
  );
}

export function useEntitySearchForm() {
  return EntitySearchFormContext.useValue();
}

export function useEntitySearchFormStore<TSelected>(selector: (state: EntitySearchFormState) => TSelected): TSelected {
  const { store } = useEntitySearchForm();
  return useSelector(store as never, selector);
}

export type { EntitySearchFormState };
