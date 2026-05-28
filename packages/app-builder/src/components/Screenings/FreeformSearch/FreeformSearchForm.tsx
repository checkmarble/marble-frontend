import {
  applyAliveDeceasedDefaults,
  getCanonicalSelectedKeys,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
  syncSharpDatasets,
} from '@app-builder/components/ListAndTopicConfiguration';
import { ScreeningThreshold } from '@app-builder/components/ScreeningThreshold';
import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { type ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { type FreeformSearchInput } from '@app-builder/server-fns/screenings';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useForm, useStore } from '@tanstack/react-form';
import { createContext, type FunctionComponent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';
import { setAdditionalFields } from '../set-additional-fields';
import { DatasetsPopover } from './DatasetsPopover';
import { EntityTypePopover } from './EntityTypePopover';
import { EntitySearchFormProvider } from './entity-search-form-context';
import { DEFAULT_LIMIT, LimitPopover } from './LimitPopover';

interface FreeformSearchFormProps {
  onSearchComplete: (results: ScreeningMatchPayload[], searchInputs: FreeformSearchInput) => void;
  listConfig: ListConfigFilters;
}

function useManualSearchForm({ onSubmit }: { onSubmit: (value: FreeformSearchInput) => void | Promise<void> }) {
  const { org } = useOrganizationDetails();
  return useForm({
    defaultValues: {
      entityType: 'Thing',
      fields: setAdditionalFields(SEARCH_ENTITIES['Thing'].fields, {}),
      limit: DEFAULT_LIMIT,
      threshold: org.sanctionThreshold ?? 70,
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

export const FreeformSearchForm: FunctionComponent<FreeformSearchFormProps> = ({ onSearchComplete, listConfig }) => {
  const { t } = useTranslation(screeningsI18n);
  const searchMutation = useFreeformSearchMutation();
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>(() => {
    const initial: Record<string, boolean> = {};
    applyAliveDeceasedDefaults(initial, listConfig, 'manual_search');
    return getCanonicalSelectedKeys(initial);
  });
  const selectedDatasetsKey = useMemo(() => selectedDatasets.toSorted().join(','), [selectedDatasets]);

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: makeDatasetsMap(selectedDatasets),
    mode: 'edit',
    variant: 'popover',
    provider: 'lexisnexis',
    // provider,
  });

  useEffect(() => {
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets);
    });
  }, [listSharp, selectedDatasetsKey, selectedDatasets]);

  const form = useManualSearchForm({
    onSubmit: async (value) => {
      const datasets = getCanonicalSelectedKeys(listSharp.value.datasets);

      const submitValue: FreeformSearchInput = {
        ...value,
        datasets: datasets.length > 0 ? datasets : undefined,
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
    originalLimit.current = DEFAULT_LIMIT;
  };

  const hasActiveFilters =
    selectedDatasets.length > 0 ||
    (entityType && entityType !== 'Thing') ||
    (limit !== undefined && limit !== DEFAULT_LIMIT);

  return (
    <ManualSearchFormContext.Provider value={form}>
      <EntitySearchFormProvider form={form}>
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
              </div>
            </form>
            <EntityTypePopover disabled={searchMutation.isPending} />
          </div>
          <ListAndTopicDatasetConfiguration.Provider value={listSharp}>
            <div className="bg-surface-card border-grey-border rounded-lg border p-4 space-y-v2-md">
              <ScreeningThreshold
                threshold={threshold}
                onChange={(value) => {
                  form.setFieldValue('threshold', value);
                }}
                title={t('screenings:freeform_search.threshold_label')}
              />
              <DatasetsPopover
                selectedDatasets={selectedDatasets}
                onApply={setSelectedDatasets}
                disabled={searchMutation.isPending}
              />
              <LimitPopover
                disabled={searchMutation.isPending}
                originalValue={originalLimit.current}
                selectedDatasets={selectedDatasets}
                onApply={(value) => {
                  originalLimit.current = value;
                }}
                onApplyDatasets={setSelectedDatasets}
              />
            </div>
          </ListAndTopicDatasetConfiguration.Provider>
          <div className="flex gap-2 justify-end">
            {hasActiveFilters && (
              <div className="flex gap-2">
                <Button variant="secondary" appearance="stroked" size="default" onClick={handleClearFilters}>
                  {t('screenings:freeform_search.clear_filters')}
                </Button>
              </div>
            )}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => {
                return (
                  <Button
                    variant="primary"
                    size="default"
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-v2-xs"
                  >
                    <span>{t('screenings:freeform_search.submit')}</span>
                    {isSubmitting && <Icon icon="spinner" className="size-5 animate-spin" />}
                  </Button>
                );
              }}
            </form.Subscribe>
          </div>
        </div>
      </EntitySearchFormProvider>
    </ManualSearchFormContext.Provider>
  );
};

export default FreeformSearchForm;
