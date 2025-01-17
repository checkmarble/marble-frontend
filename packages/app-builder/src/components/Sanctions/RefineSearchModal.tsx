import { Callout } from '@app-builder/components/Callout';
import { type PropertyForSchema } from '@app-builder/constants/sanction-check-entity';
import {
  type SanctionCheck,
  type SanctionCheckEntitySchema,
  type SanctionCheckMatchPayload,
} from '@app-builder/models/sanction-check';
import { type action as refineAction } from '@app-builder/routes/ressources+/sanction-check+/refine';
import {
  type action as searchAction,
  refineSearchSchema,
} from '@app-builder/routes/ressources+/sanction-check+/search';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Input, ModalV2, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchResult } from './MatchResult';
import { sanctionsI18n } from './sanctions-i18n';

function setAdditionalFields(fields: string[], prev: Record<string, string>) {
  const additionalFields = {} as Record<string, string>;
  for (const field of fields) {
    additionalFields[field] = prev[field] ?? '';
  }
  return additionalFields;
}

type SearchableSchema = Exclude<SanctionCheckEntitySchema, 'Thing'>;

const SEARCH_ENTITIES = {
  LegalEntity: { fields: ['email'] },
  Person: {
    fields: ['name', 'birthDate', 'nationality', 'idNumber', 'address'],
  },
  Company: {
    fields: [
      'name',
      'jurisdiction',
      'registrationNumber',
      'address',
      'incorporationDate',
    ],
  },
  Organization: {
    fields: ['name', 'country', 'registrationNumber', 'address'],
  },
} satisfies { [k in SearchableSchema]: { fields: PropertyForSchema<k>[] } };

export type RefineSearchModalProps = {
  open: boolean;
  decisionId: string;
  sanctionCheck: SanctionCheck;
  onClose: () => void;
};

export function RefineSearchModal({
  open,
  decisionId,
  sanctionCheck,
  onClose: _onClose,
}: RefineSearchModalProps) {
  const { t } = useTranslation(sanctionsI18n);
  const searchInputs = R.pipe(
    R.values(sanctionCheck.request.queries),
    R.flatMap((query) => R.values(query.properties)),
    R.flat(),
  );
  const searchFetcher = useFetcher<typeof searchAction>();
  const refineFetcher = useFetcher<typeof refineAction>();
  const formDataRef = useRef<FormData | null>(null);
  const onClose = useCallbackRef(_onClose);

  const form = useForm({
    // @ts-expect-error we don't want default value for entityType...
    defaultValues: {
      decisionId: decisionId,
      fields: {},
    },
    validators: {
      onChange: refineSearchSchema,
    },
    onSubmit: ({ value }) => {
      const formData = new FormData();

      formData.append('entityType', value.entityType);
      formData.append('decisionId', value.decisionId);
      for (const k in value.fields) {
        formData.append(
          `fields.${k}`,
          value.fields[k as keyof typeof value.fields] ?? '',
        );
      }

      formDataRef.current = formData;

      searchFetcher.submit(formData, {
        method: 'POST',
        action: getRoute('/ressources/sanction-check/search'),
      });
    },
  });

  const [searchResults, setSearchResults] = useState<
    SanctionCheckMatchPayload[] | null
  >(null);
  useEffect(() => {
    if (searchFetcher.data?.status === 'searchResults') {
      setSearchResults(searchFetcher.data.value);
    }
  }, [searchFetcher.data]);
  useEffect(() => {
    if (refineFetcher.data && 'id' in refineFetcher.data) {
      onClose();
    }
  }, [refineFetcher.data, onClose]);

  const entityType = useStore(form.store, (state) => state.values.entityType);
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const onSearchEntityChange = ({ value }: { value: SearchableSchema }) => {
    if (value) {
      form.setFieldValue(
        'fields',
        setAdditionalFields(
          SEARCH_ENTITIES[value].fields,
          form.state.values.fields,
        ),
      );
    }
  };

  const handleBackToSearch = () => {
    setSearchResults(null);
  };

  const handleRefine = () => {
    if (formDataRef.current) {
      refineFetcher.submit(formDataRef.current, {
        method: 'POST',
        action: getRoute('/ressources/sanction-check/refine'),
      });
    }
  };

  return (
    <ModalV2.Content
      open={open}
      onClose={onClose}
      size="medium"
      render={(props) => (
        <div className="fixed inset-0 flex justify-center overflow-auto p-12">
          <div {...props} />
        </div>
      )}
    >
      <ModalV2.Title>{t('sanctions:refine_modal.title')}</ModalV2.Title>
      {searchResults ? (
        <>
          <div className="flex flex-col gap-8 p-6">
            <Field label={t('sanctions:refine_modal.result_label')}>
              <div className="flex grow flex-col gap-2">
                {searchResults.map((match) => {
                  return <MatchResult key={match.id} entity={match} />;
                })}
              </div>
            </Field>
            <Callout bordered>
              {t('sanctions:refine_modal.refine_callout')}
            </Callout>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                name="cancel"
                onClick={handleBackToSearch}
              >
                {t('sanctions:refine_modal.back_search')}
              </Button>
              <Button
                className="flex-1"
                variant="primary"
                onClick={handleRefine}
              >
                {t('sanctions:refine_modal.apply_search')}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <searchFetcher.Form onSubmit={handleFormSubmit}>
          <div className="flex flex-col gap-3 p-6 pb-3">
            <Field label="Search covers the following fields:">
              {searchInputs.map((input, i) => (
                <div
                  key={i}
                  className="border-grey-90 flex items-center gap-2 rounded border p-2"
                >
                  <span className="bg-grey-95 size-6 rounded-sm p-1">
                    <Icon icon="string" className="size-4" />
                  </span>
                  {input}
                </div>
              ))}
            </Field>
            <form.Field
              name="entityType"
              listeners={{ onChange: onSearchEntityChange }}
            >
              {(field) => (
                <Field label="Counterparty Entity">
                  <EntitySelect
                    name={field.name}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>
            {additionalFields.map((field) => (
              <form.Field key={field} name={`fields.${field}`}>
                {(formField) => (
                  <Field label={t(`sanctions:entity.property.${field}`)}>
                    <Input
                      name={formField.name}
                      value={formField.state.value as string}
                      onChange={(e) => formField.handleChange(e.target.value)}
                      className="grow"
                    />
                  </Field>
                )}
              </form.Field>
            ))}
          </div>
          <ModalV2.Footer>
            <div className="bg-grey-100 flex gap-2 p-6 pt-3">
              <ModalV2.Close
                render={
                  <Button
                    className="flex-1"
                    variant="secondary"
                    name="cancel"
                  />
                }
              >
                {t('common:cancel')}
              </ModalV2.Close>
              <form.Subscribe
                selector={(state) => [
                  state.isPristine,
                  state.canSubmit,
                  state.isSubmitting,
                ]}
              >
                {([isPristine, canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={isPristine || !canSubmit}
                    className="flex-1"
                    variant="primary"
                  >
                    {isSubmitting
                      ? '...'
                      : t('sanctions:refine_modal.test_search')}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </ModalV2.Footer>
        </searchFetcher.Form>
      )}
    </ModalV2.Content>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span>{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

type EntitySelectProps = {
  name: string;
  value: SearchableSchema | '';
  onChange: (value: SearchableSchema) => void;
};

function EntitySelect({ name, value, onChange }: EntitySelectProps) {
  const { t } = useTranslation(sanctionsI18n);
  const schemas = R.keys(SEARCH_ENTITIES);
  const lowerCasedSchema = value?.toLowerCase() as Lowercase<typeof value>;

  const handleChange = (v: SearchableSchema) => {
    if (v) {
      onChange(v);
    }
  };

  return (
    <Select.Root name={name} value={value} onValueChange={handleChange}>
      <Select.Trigger className="grow">
        <Select.Value align="start" placeholder={'Select'}>
          {lowerCasedSchema
            ? t(`sanctions:refine_modal.schema.${lowerCasedSchema}`)
            : ''}
        </Select.Value>
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content
        className="min-w-[var(--radix-select-trigger-width)]"
        align="start"
      >
        <Select.Viewport>
          {schemas.map((schema) => {
            const schemaKey = schema.toLowerCase() as Lowercase<typeof schema>;
            const fieldForSchema = SEARCH_ENTITIES[schema].fields;

            return (
              <Select.Item key={schema} value={schema}>
                <div className="flex items-center gap-2 p-2">
                  <Icon icon="plus" className="size-5" />
                  <div className="flex flex-col">
                    <span>
                      {t(`sanctions:refine_modal.schema.${schemaKey}`)}
                    </span>
                    <span className="text-grey-50 text-xs">
                      {t('sanctions:refine_modal.search_by')}{' '}
                      {fieldForSchema
                        .map((f) => t(`sanctions:entity.property.${f}`))
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}
