import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type Screening, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { refineSearchSchema, type action as searchAction } from '@app-builder/routes/ressources+/screenings+/search';
import { handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { serialize as objectToFormData } from 'object-to-formdata';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type z } from 'zod/v4';
import { EntitySelect, setAdditionalFields } from '../RefineSearchModal';
import { screeningsI18n } from '../screenings-i18n';

export function InlineRefineSearch({
  screening,
  onBack: _onBack,
  onSearchComplete: _onSearchComplete,
}: {
  screening: Screening;
  onBack: () => void;
  onSearchComplete: (results: ScreeningMatchPayload[], formData: FormData) => void;
}) {
  const { t } = useTranslation(screeningsI18n);
  const searchFetcher = useFetcher<typeof searchAction>();
  const formDataRef = useRef<FormData | null>(null);
  const onBack = useCallbackRef(_onBack);
  const onSearchComplete = useCallbackRef(_onSearchComplete);

  const [mainFieldsOpen, setMainFieldsOpen] = useState(true);
  const [additionalFieldsOpen, setAdditionalFieldsOpen] = useState(true);

  const form = useForm({
    defaultValues: {
      screeningId: screening.id,
      fields: {},
    } as z.infer<typeof refineSearchSchema>,
    validators: {
      onChange: refineSearchSchema,
    },
    onSubmit: ({ value }) => {
      formDataRef.current = objectToFormData(value, {
        dotsForObjectNotation: true,
      });

      searchFetcher.submit(formDataRef.current, {
        method: 'POST',
        action: getRoute('/ressources/screenings/search'),
      });
    },
  });

  useEffect(() => {
    if (searchFetcher.data?.success && formDataRef.current) {
      onSearchComplete(searchFetcher.data.data, formDataRef.current);
    }
  }, [searchFetcher.data, onSearchComplete]);

  const entityType = useStore(form.store, (state) => state.values.entityType);
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];

  const onSearchEntityChange = ({ value }: { value: SearchableSchema }) => {
    if (value) {
      form.setFieldValue('fields', setAdditionalFields(SEARCH_ENTITIES[value].fields, form.state.values.fields));
    }
  };

  const searchInputs = screening.request
    ? Object.values(screening.request.queries).flatMap((query) => Object.values(query.properties).flat())
    : [];

  return (
    <div className="sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-4 border-l border-grey-border pl-4">
      <span className="text-m font-medium">{t('screenings:panel.search_details')}</span>

      <div className="flex flex-col gap-4 rounded-lg border border-purple-primary bg-purple-background-light p-4">
        <span className="text-s font-medium">{t('screenings:refine_inline.edit_search_label')}</span>

        <searchFetcher.Form onSubmit={handleSubmit(form)} className="contents">
          <div className="flex flex-col gap-4">
            {/* Main fields section */}
            <div className="flex flex-col gap-2">
              <SectionHeader
                label={t('screenings:refine_inline.main_fields')}
                open={mainFieldsOpen}
                onToggle={() => setMainFieldsOpen((v) => !v)}
              />
              {mainFieldsOpen ? (
                <>
                  {searchInputs.length > 0 ? (
                    <div className="flex h-[33px] items-center overflow-clip rounded border border-purple-border-light bg-white p-2">
                      <span className="truncate text-s font-medium">{searchInputs.join(' ')}</span>
                    </div>
                  ) : null}
                  <form.Field name="entityType" listeners={{ onChange: onSearchEntityChange }}>
                    {(field) => (
                      <EntitySelect name={field.name} value={field.state.value} onChange={field.handleChange} />
                    )}
                  </form.Field>
                </>
              ) : null}
            </div>

            {/* Additional fields section */}
            {additionalFields.length > 0 ? (
              <div className="flex flex-col gap-2">
                <SectionHeader
                  label={t('screenings:refine_inline.additional_fields')}
                  open={additionalFieldsOpen}
                  onToggle={() => setAdditionalFieldsOpen((v) => !v)}
                />
                {additionalFieldsOpen
                  ? additionalFields.map((field) => (
                      <form.Field key={field} name={`fields.${field}`}>
                        {(formField) => (
                          <Input
                            name={formField.name}
                            placeholder={t(`screenings:entity.property.${field}`)}
                            value={formField.state.value as string}
                            onChange={(e) => formField.handleChange(e.target.value)}
                            className="border-purple-border-light"
                          />
                        )}
                      </form.Field>
                    ))
                  : null}
              </div>
            ) : null}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" appearance="stroked" size="small" onClick={onBack}>
              {t('screenings:refine_inline.back')}
            </Button>
            <form.Subscribe selector={(state) => [state.isPristine, state.canSubmit, state.isSubmitting]}>
              {([isPristine, canSubmit, isSubmitting]) => (
                <Button type="submit" size="small" disabled={isPristine || !canSubmit} variant="primary">
                  {isSubmitting ? '...' : t('screenings:refine_inline.search')}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </searchFetcher.Form>
      </div>
    </div>
  );
}

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="flex w-full items-center gap-2" onClick={onToggle}>
      <span className="shrink-0 text-[10px] text-grey-secondary">{label}</span>
      <div className="h-px flex-1 bg-grey-border" />
      <Icon
        icon="caret-down"
        className={cn('size-4 shrink-0 text-grey-secondary transition-transform', open && 'rotate-180')}
      />
    </button>
  );
}
