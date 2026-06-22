import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type Screening, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useSearchScreeningMatchesMutation } from '@app-builder/queries/screening/search-screening-matches';
import { type RefineSearchInput, refineSearchSchema } from '@app-builder/server-fns/screenings';
import { handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { type z } from 'zod/v4';
import { EntityTypePopover } from '../FreeformSearch/EntityTypePopover';
import { EntitySearchFormProvider } from '../FreeformSearch/entity-search-form-context';
import { screeningsI18n } from '../screenings-i18n';
import { setAdditionalFields } from '../set-additional-fields';

function getScreeningSearchName(screening: Screening): string {
  const request = screening.request;
  if (!request) return '';

  const queries = Object.values(request.queries);
  const name = queries.flatMap((query) => query.properties['name'] ?? [])[0];
  if (name) return name;

  return queries.flatMap((query) => Object.values(query.properties).flat()).join(' ');
}

type RefineSearchDefaultValues = z.infer<typeof refineSearchSchema>;

function getRefineSearchDefaultValues(screening: Screening, searchName: string): RefineSearchDefaultValues {
  const base: RefineSearchDefaultValues = {
    screeningId: screening.id,
    entityType: 'Thing',
    fields: { name: searchName },
  };

  const request = screening.request;
  if (!request) return base;

  const query = Object.values(request.queries)[0];
  if (!query) return base;

  const schema = query.schema;
  if (!(schema in SEARCH_ENTITIES)) return base;

  const entityType = schema as SearchableSchema;
  const properties: Record<string, string | undefined> = { name: searchName };
  for (const [key, values] of Object.entries(query.properties)) {
    if (key !== 'name') properties[key] = values[0];
  }

  return {
    screeningId: screening.id,
    entityType,
    fields: setAdditionalFields(SEARCH_ENTITIES[entityType].fields, properties),
  } as RefineSearchDefaultValues;
}

function withSearchName<T extends { fields: Record<string, string | undefined> }>(value: T, searchName: string): T {
  return { ...value, fields: { ...value.fields, name: searchName } };
}

export function InlineRefineSearch({
  screening,
  onBack: _onBack,
  onSearchComplete: _onSearchComplete,
}: {
  screening: Screening;
  onBack: () => void;
  onSearchComplete: (results: ScreeningMatchPayload[], formValues: RefineSearchInput) => void;
}) {
  const { t } = useTranslation(screeningsI18n);
  const onBack = useCallbackRef(_onBack);
  const onSearchComplete = useCallbackRef(_onSearchComplete);

  const searchMutation = useSearchScreeningMatchesMutation();
  const searchName = getScreeningSearchName(screening);

  const form = useForm({
    defaultValues: getRefineSearchDefaultValues(screening, searchName),
    validators: {
      onChange: refineSearchSchema,
    },
    onSubmit: ({ value }) => {
      const submitValue = withSearchName(value, searchName) as RefineSearchInput;
      searchMutation
        .mutateAsync(submitValue)
        .then((data) => {
          onSearchComplete(data, submitValue);
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
  });

  return (
    <div className="sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-md border-l border-grey-border ps-md">
      <span className="text-m font-medium">{t('screenings:panel.search_details')}</span>

      <div className="flex flex-col gap-md rounded-lg border border-purple-primary bg-purple-background-light p-md">
        <span className="text-s font-medium">{t('screenings:refine_inline.edit_search_label')}</span>

        <form onSubmit={handleSubmit(form)} className="contents">
          <div className="flex flex-col gap-md">
            {/* Main fields section */}
            <div className="flex flex-col gap-sm">
              {searchName ? (
                <div className="overflow-clip text-purple-primary">
                  <span className="truncate text-s font-medium">{searchName}</span>
                </div>
              ) : null}
              <EntitySearchFormProvider form={form}>
                <EntityTypePopover disabled={searchMutation.isPending} />
              </EntitySearchFormProvider>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-sm">
            <Button variant="secondary" appearance="stroked" size="small" onClick={onBack}>
              {t('screenings:refine_inline.back')}
            </Button>
            <form.Subscribe selector={(state) => [state.isPristine, state.canSubmit, state.isSubmitting]}>
              {([isPristine, canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="small"
                  disabled={isPristine || !canSubmit || !searchName.trim()}
                  variant="primary"
                >
                  {isSubmitting ? '...' : t('screenings:refine_inline.search')}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}
