import { Callout } from '@app-builder/components/Callout';
import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type Screening } from '@app-builder/models/screening';
import { useRefineScreeningSearchMutation } from '@app-builder/queries/screening/refine-search';
import { useRefineScreeningValidateMutation } from '@app-builder/queries/screening/refine-validate';
import { RefineScreeningPayload, refineScreeningPayloadSchema } from '@app-builder/queries/screening/schemas';
import { handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';
import { type ReactNode, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Input, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type z } from 'zod/v4';
import { MatchResult } from './MatchResult';
import { ScreeningStatusTag } from './ScreeningStatusTag';
import { screeningsI18n } from './screenings-i18n';

function setAdditionalFields(fields: string[], prev: Record<string, string>) {
  const additionalFields = {} as Record<string, string>;
  for (const field of fields) {
    additionalFields[field] = prev[field] ?? '';
  }
  return additionalFields;
}

export type RefineSearchModalProps = {
  open: boolean;
  screeningId: string;
  screening: Screening;
  onRefineSuccess: (screeningId: string) => void;
  onClose: () => void;
};

export function RefineSearchModal({
  open,
  screeningId,
  screening,
  onRefineSuccess: _onRefineSuccess,
  onClose: _onClose,
}: RefineSearchModalProps) {
  const { t } = useTranslation(screeningsI18n);
  const refineSearchMutation = useRefineScreeningSearchMutation();
  const refineValidateMutation = useRefineScreeningValidateMutation();
  const formDataRef = useRef<RefineScreeningPayload | null>(null);
  const onClose = useCallbackRef(_onClose);
  const onRefineSuccess = useCallbackRef(_onRefineSuccess);
  const searchResults = refineSearchMutation.data?.success ? refineSearchMutation.data.data : null;

  const form = useForm({
    defaultValues: {
      screeningId,
      fields: {},
    } as z.infer<typeof refineScreeningPayloadSchema>,
    validators: {
      onChange: refineScreeningPayloadSchema,
    },
    onSubmit: async ({ value }) => {
      formDataRef.current = value;
      await refineSearchMutation.mutateAsync(value);
    },
  });

  const entityType = useStore(form.store, (state) => state.values.entityType);
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];

  const onSearchEntityChange = ({ value }: { value: SearchableSchema }) => {
    if (value) {
      form.setFieldValue('fields', setAdditionalFields(SEARCH_ENTITIES[value].fields, form.state.values.fields));
    }
  };

  const handleBackToSearch = () => {
    refineSearchMutation.reset();
  };

  const handleRefine = () => {
    if (formDataRef.current) {
      refineValidateMutation.mutateAsync(formDataRef.current).then((res) => {
        if (res?.success) {
          onRefineSuccess(res.data.id);
          onClose();
        }
      });
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={onClose}>
      <Modal.Content
        fixedHeight={!searchResults}
        size="medium"
        className={clsx({ 'h-[80vh]': !searchResults }, 'max-h-[80vh]')}
      >
        <Modal.Title>{t('screenings:refine_modal.title')}</Modal.Title>
        {searchResults ? (
          <>
            <div className="flex flex-col gap-8 overflow-y-scroll p-6">
              {searchResults.length > 0 ? (
                <>
                  <Field label={t('screenings:refine_modal.result_label')}>
                    <div className="flex grow flex-col gap-2">
                      {searchResults.map((match) => {
                        return <MatchResult key={match.id} entity={match} />;
                      })}
                    </div>
                  </Field>
                  <Callout bordered>{t('screenings:refine_modal.refine_callout')}</Callout>
                </>
              ) : (
                <>
                  <span>{t('screenings:refine_modal.no_match_label')}</span>
                  <Callout bordered>
                    <div className="flex flex-col items-start gap-2">
                      <Trans
                        t={t}
                        i18nKey="screenings:refine_modal.no_match_callout"
                        components={{
                          Status: <ScreeningStatusTag status="no_hit" />,
                        }}
                      />
                    </div>
                  </Callout>
                </>
              )}
            </div>
            <Modal.Footer>
              <div className="bg-grey-100 flex gap-2 p-8">
                <Button className="flex-1" variant="secondary" name="cancel" onClick={handleBackToSearch}>
                  {t('screenings:refine_modal.back_search')}
                </Button>
                <Button
                  className="flex-1"
                  variant="primary"
                  onClick={handleRefine}
                  disabled={searchResults.length > (screening.request?.limit ?? Infinity)}
                >
                  {t('screenings:refine_modal.apply_search')}
                </Button>
              </div>
            </Modal.Footer>
          </>
        ) : (
          <form onSubmit={handleSubmit(form)} className="contents">
            <div className="flex h-full flex-col gap-6 overflow-y-scroll p-8">
              {screening.request ? <SearchInput request={screening.request} /> : null}
              <form.Field name="entityType" listeners={{ onChange: onSearchEntityChange }}>
                {(field) => (
                  <Field label={t('screenings:search_entity_type')}>
                    <EntitySelect name={field.name} value={field.state.value} onChange={field.handleChange} />
                  </Field>
                )}
              </form.Field>
              {additionalFields.map((field) => (
                <form.Field key={field} name={`fields.${field}`}>
                  {(formField) => (
                    <Field label={t(`screenings:entity.property.${field}`)}>
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
            <Modal.Footer>
              <div className="bg-grey-100 flex gap-2 p-8">
                <Modal.Close>
                  <Button className="flex-1" variant="secondary" name="cancel">
                    {t('common:cancel')}
                  </Button>
                </Modal.Close>
                <form.Subscribe selector={(state) => [state.isPristine, state.canSubmit, state.isSubmitting]}>
                  {([isPristine, canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={isPristine || !canSubmit} className="flex-1" variant="primary">
                      {isSubmitting ? '...' : t('screenings:refine_modal.test_search')}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </Modal.Footer>
          </form>
        )}
      </Modal.Content>
    </Modal.Root>
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
  const { t } = useTranslation(screeningsI18n);
  const schemas = R.keys(SEARCH_ENTITIES);
  const lowerCasedSchema = value?.toLowerCase() as Lowercase<typeof value>;

  const handleChange = (v: SearchableSchema) => {
    if (v) {
      onChange(v);
    }
  };

  // TODO: Replace with MenuCommand component
  return (
    <Select.Root name={name} value={value} onValueChange={handleChange}>
      <Select.Trigger className="grow">
        <Select.Value align="start" placeholder={'Select'}>
          {lowerCasedSchema ? t(`screenings:refine_modal.schema.${lowerCasedSchema}`) : ''}
        </Select.Value>
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content className="min-w-(--radix-select-trigger-width)" align="start">
        <Select.Viewport>
          {schemas.map((schema) => {
            const schemaKey = schema.toLowerCase() as Lowercase<typeof schema>;
            const fieldForSchema = SEARCH_ENTITIES[schema].fields;

            return (
              <Select.Item key={schema} value={schema}>
                <div className="flex items-center gap-2 p-2">
                  <Icon icon="plus" className="size-5" />
                  <div className="flex flex-col">
                    <span>{t(`screenings:refine_modal.schema.${schemaKey}`)}</span>
                    <span className="text-grey-50 text-xs">
                      {t('screenings:refine_modal.search_by')}{' '}
                      {fieldForSchema.map((f) => t(`screenings:entity.property.${f}`)).join(', ')}
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

function SearchInput({ request }: { request: NonNullable<Screening['request']> }) {
  const { t } = useTranslation(['screenings']);
  const searchInputs = R.pipe(
    R.values(request.queries),
    R.flatMap((query) => R.values(query.properties)),
    R.flat(),
  );

  return (
    <Field label={t('screenings:refine_modal.search_input_label')}>
      {searchInputs.map((input, i) => (
        <div key={i} className="border-grey-90 flex items-center gap-2 rounded-sm border p-2">
          <span className="bg-grey-95 size-6 rounded-xs p-1">
            <Icon icon="string" className="size-4" />
          </span>
          {input}
        </div>
      ))}
    </Field>
  );
}
