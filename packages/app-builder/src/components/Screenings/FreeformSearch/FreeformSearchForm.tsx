import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { type FreeformSearchInput } from '@app-builder/server-fns/screenings';
import { useForm, useStore } from '@tanstack/react-form';
import { createContext, type FunctionComponent, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, ThresholdRange } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';
import { DatasetsPopover } from './DatasetsPopover';
import { EntityTypePopover } from './EntityTypePopover';
import { DEFAULT_LIMIT, LimitPopover } from './LimitPopover';

export function setAdditionalFields(
  fields: string[],
  prev: FreeformSearchInput['fields'],
): FreeformSearchInput['fields'] {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const prevValue = prev as Record<string, string | undefined>;
    result[field] = prevValue[field] ?? '';
  }
  return result as FreeformSearchInput['fields'];
}

interface FreeformSearchFormProps {
  onSearchComplete: (results: ScreeningMatchPayload[], searchInputs: FreeformSearchInput) => void;
}

function useManualSearchForm({ onSubmit }: { onSubmit: (value: FreeformSearchInput) => void | Promise<void> }) {
  return useForm({
    defaultValues: {
      entityType: 'Thing',
      fields: setAdditionalFields(SEARCH_ENTITIES['Thing'].fields, {} as FreeformSearchInput['fields']),
      limit: DEFAULT_LIMIT,
      threshold: 60,
    } as FreeformSearchInput,
    onSubmit: ({ value }) => onSubmit(value),
  });
}

export type ManualSearchFormInstance = ReturnType<typeof useManualSearchForm>;

const ManualSearchFormContext = createContext<ManualSearchFormInstance | null>(null);

export function useFormManuallSearch() {
  const form = useContext(ManualSearchFormContext);
  if (!form) throw new Error('useFormManuallSearch must be used within FreeformSearchForm');
  return form;
}

export const FreeformSearchForm: FunctionComponent<FreeformSearchFormProps> = ({ onSearchComplete }) => {
  const { t } = useTranslation(screeningsI18n);
  const searchMutation = useFreeformSearchMutation();
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  const form = useManualSearchForm({
    onSubmit: async (value) => {
      const submitValue: FreeformSearchInput = {
        ...value,
        datasets: selectedDatasets.length > 0 ? selectedDatasets : undefined,
        limit: value.limit ?? DEFAULT_LIMIT,
      };

      try {
        const result = await searchMutation.mutateAsync(submitValue);
        if (result.success) {
          onSearchComplete(result.data, submitValue);
        } else {
          toast.error(t('common:errors.unknown'));
        }
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
  });

  const threshold = useStore(form.store, (state) => state.values.threshold);
  const limit = useStore(form.store, (state) => state.values.limit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  // const handleClearFilters = () => {
  //   form.reset();
  //   setSelectedDatasets([]);
  // };

  // const hasActiveFilters =
  //   selectedDatasets.length > 0 ||
  //   (entityType && entityType !== 'Thing') ||
  //   (limit !== undefined && limit !== DEFAULT_LIMIT);

  // const hasEntityTypeSelected = entityType && entityType !== 'Thing';
  // const entityTypeFields = additionalFields.filter((f) => f !== 'name');
  // const entityTypeLabel = hasEntityTypeSelected
  //   ? (entityType.toLowerCase() as Lowercase<typeof entityType>)
  //   : undefined;

  return (
    <ManualSearchFormContext.Provider value={form}>
      <div className="flex flex-col gap-4">
        <div className="bg-surface-card border-grey-border rounded-lg border p-4 space-y-v2-md">
          <form onSubmit={handleSubmit}>
            {/* Search by name input with button */}
            <div className="flex gap-2">
              <form.Field
                name="fields.name"
                validators={{
                  onSubmit: ({ value }) => {
                    const v = (value as string) ?? '';
                    return v.trim().length >= 1 ? undefined : t('screenings:freeform_search.name_required');
                  },
                }}
              >
                {(formField) => (
                  <div className="flex flex-1 flex-col gap-1">
                    <Input
                      name={formField.name}
                      value={(formField.state.value as string) ?? ''}
                      onChange={(e) => formField.handleChange(e.target.value)}
                      className="w-full"
                      borderColor={formField.state.meta.errors.length > 0 ? 'redfigma-47' : 'greyfigma-90'}
                      placeholder={t('screenings:freeform_search.name_placeholder')}
                    />
                    {formField.state.meta.errors.length > 0 && (
                      <span className="text-red-primary text-xs">{formField.state.meta.errors[0]}</span>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting || searchMutation.isPending}
                    variant="primary"
                    className="shrink-0"
                  >
                    {isSubmitting || searchMutation.isPending ? (
                      <Icon icon="spinner" className="size-5 animate-spin" />
                    ) : (
                      <Icon icon="search" className="size-5" />
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
          <EntityTypePopover />
        </div>
        <div className="bg-surface-card border-grey-border rounded-lg border p-4 space-y-v2-md">
          <ThresholdRange
            title={t('screenings:freeform_search.threshold_label')}
            description={t('screenings:freeform_search.threshold_description')}
            value={threshold}
            onChange={(value) => form.setFieldValue('threshold', value)}
            values={[
              { value: 40, label: '', color: 'var(--color-red-secondary)' },
              { value: 50, label: '', color: 'var(--color-orange-secondary)' },
              { value: 60, label: '', color: 'var(--color-yellow-primary)' },
              { value: 70, label: '', color: 'var(--color-green-disabled)' },
              { value: 80, label: '80', color: 'var(--color-green-primary)' },
            ]}
            initialColor="var(--color-red-hover)"
          />
        </div>

        {/* Filters - 2 column grid on medium screens, single column on large */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <DatasetsPopover selectedDatasets={selectedDatasets} onApply={setSelectedDatasets} />

          <LimitPopover value={limit} onApply={(value) => form.setFieldValue('limit', value)} />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {/* Apply button */}
          {/* <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || searchMutation.isPending}
              variant="primary"
              size="default"
              className="w-full justify-center"
            >
              {isSubmitting || searchMutation.isPending ? (
                <Icon icon="spinner" className="size-5 animate-spin" />
              ) : (
                <>
                  {t('screenings:freeform_search.apply')}
                  <Icon icon="search" className="size-5" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe> */}

          {/* Clear filters button - only show when filters are active */}
          {/* hasActiveFilters && (
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={handleClearFilters}
            className="w-full justify-center"
          >
            <Icon icon="cross" className="size-5" />
            {t('screenings:freeform_search.clear_filters')}
          </Button>
        )*/}
        </div>
      </div>
    </ManualSearchFormContext.Provider>
  );
};

export default FreeformSearchForm;
