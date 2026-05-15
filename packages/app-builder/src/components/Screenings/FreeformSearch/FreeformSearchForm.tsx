import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { type FreeformSearchInput } from '@app-builder/server-fns/screenings';
import { useForm, useStore } from '@tanstack/react-form';
import { createContext, type FunctionComponent, useContext, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, ThresholdRange } from 'ui-design-system';
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
  const entityType = useStore(form.store, (state) => state.values.entityType);
  const limit = useStore(form.store, (state) => state.values.limit);
  const originalLimit = useRef(limit ?? DEFAULT_LIMIT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleClearFilters = () => {
    form.reset();
    setSelectedDatasets([]);
  };

  const hasActiveFilters =
    selectedDatasets.length > 0 ||
    (entityType && entityType !== 'Thing') ||
    (limit !== undefined && limit !== DEFAULT_LIMIT);

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
                      onBlur={() => form.handleSubmit()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          form.handleSubmit();
                        }
                      }}
                    />
                    {formField.state.meta.errors.length > 0 && (
                      <span className="text-red-primary text-xs">{formField.state.meta.errors[0]}</span>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </form>
          <EntityTypePopover disabled={searchMutation.isPending} onApply={() => form.handleSubmit()} />
        </div>
        <div className="bg-surface-card border-grey-border rounded-lg border p-4 space-y-v2-md">
          <DatasetsPopover
            selectedDatasets={selectedDatasets}
            onApply={setSelectedDatasets}
            disabled={searchMutation.isPending}
          />

          <ThresholdRange
            title={t('screenings:freeform_search.threshold_label')}
            description={t('screenings:freeform_search.threshold_description')}
            value={threshold}
            onChange={(value) => {
              form.setFieldValue('threshold', value);
              form.handleSubmit();
            }}
            values={[
              { value: 40, label: '40%', color: 'var(--color-red-secondary)' },
              { value: 50, label: '50%', color: 'var(--color-orange-secondary)' },
              { value: 60, label: '60%', color: 'var(--color-yellow-primary)' },
              { value: 70, label: '70%', color: 'var(--color-green-disabled)' },
              { value: 80, label: '80%', color: 'var(--color-green-primary)' },
              { value: 90, label: '90%', color: 'var(--color-green-hover)' },
            ]}
            initialColor="var(--color-red-hover)"
          />
          <LimitPopover
            disabled={searchMutation.isPending}
            originalValue={originalLimit.current}
            onApply={(value) => {
              originalLimit.current = value;
              form.handleSubmit();
            }}
          />
          {hasActiveFilters && (
            <div className="flex gap-2">
              <Button variant="secondary" size="default" onClick={handleClearFilters}>
                {t('screenings:freeform_search.clear_filters')}
              </Button>
              {/* <Button variant="primary" size="default" onClick={handleSaveFilters}>
                {t('screenings:freeform_search.save_filters')}
              </Button> */}
            </div>
          )}
        </div>
      </div>
    </ManualSearchFormContext.Provider>
  );
};

export default FreeformSearchForm;
