import {
  applyUniqueLexisNexisSectionDefault,
  getCanonicalSelectedKeys,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
  syncSharpDatasets,
} from '@app-builder/components/ListAndTopicConfiguration';
import { ScreeningThreshold } from '@app-builder/components/ScreeningThreshold';
import { Spinner } from '@app-builder/components/Spinner';
import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload, type ScreeningProviders } from '@app-builder/models/screening';
import {
  getFreeformSearchPresetQueryKey,
  useCreateFreeFormSearchPresetMutation,
  useFreeformSearchMutation,
  useListFreeFormSearchPresetsQuery,
} from '@app-builder/queries/screening/freeform-search';
import { type ListConfigFilters, useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import {
  type FreeformSearchInput,
  type FreeformSearchPreset,
  getFreeFormSearchPresetFn,
} from '@app-builder/server-fns/screenings';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useForm, useSelector } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import {
  createContext,
  type FunctionComponent,
  type SyntheticEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Input, Popover, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';
import { setAdditionalFields } from '../set-additional-fields';
import { DatasetsPopover } from './DatasetsPopover';
import { EntityTypePopover } from './EntityTypePopover';
import { EntitySearchFormProvider } from './entity-search-form-context';
import {
  buildFreeformSearchPreset,
  getDefaultManualSearchDatasets,
  getPresetFormFields,
  hasFilledPresetFields,
  isFreeformSearchPresetDirty,
  normalizeFreeformSearchPreset,
} from './freeform-search-preset';
import { DEFAULT_LIMIT, LimitPopover } from './LimitPopover';

interface FreeformSearchFormProps {
  onSearchComplete: (
    result: { id: string; matches: ScreeningMatchPayload[] },
    searchInputs: FreeformSearchInput,
  ) => void;
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

export const FreeformSearchForm: FunctionComponent<FreeformSearchFormProps> = ({ onSearchComplete }) => {
  const listConfigQuery = useListConfigQuery('manual_search');
  const { t } = useTranslation('common');

  return match(listConfigQuery)
    .with({ isPending: true }, () => (
      <div className="flex items-center justify-center h-50">
        <Spinner className="size-10" />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="flex flex-col gap-md items-center justify-center h-50">
        <div className="">{t('common:generic_fetch_data_error')}</div>
      </div>
    ))
    .otherwise(({ data }) => (
      <FreeformSearchFormInner provider={data.provider} listConfig={data.filters} onSearchComplete={onSearchComplete} />
    ));
};

function FreeformSearchFormInner({
  provider,
  onSearchComplete,
  listConfig,
}: { provider: ScreeningProviders } & FreeformSearchFormProps) {
  const { t } = useTranslation(screeningsI18n);
  const { org } = useOrganizationDetails();
  const queryClient = useQueryClient();
  const getFreeFormSearchPreset = useServerFn(getFreeFormSearchPresetFn);
  const searchMutation = useFreeformSearchMutation();
  const defaultThreshold = org.sanctionThreshold ?? 70;
  const defaultDatasets = useMemo(() => getDefaultManualSearchDatasets(listConfig, provider), [listConfig, provider]);
  const [selectedDatasets, setSelectedDatasets] = useState(defaultDatasets);
  const selectedDatasetsKey = useMemo(() => selectedDatasets.toSorted().join(','), [selectedDatasets]);
  const listFreeFormSearchPresetsQuery = useListFreeFormSearchPresetsQuery();
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined);
  const [savePresetPopoverOpen, setSavePresetPopoverOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetNameError, setPresetNameError] = useState<string | undefined>(undefined);
  const [appliedPreset, setAppliedPreset] = useState<FreeformSearchPreset | undefined>(undefined);
  const presetRequestRef = useRef(0);

  const createFreeFormSearchPresetMutation = useCreateFreeFormSearchPresetMutation();

  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: (() => {
      const initial = makeDatasetsMap(selectedDatasets);
      applyUniqueLexisNexisSectionDefault(initial, listConfig, provider);
      return initial;
    })(),
    mode: 'edit',
    variant: 'popover',
    provider,
  });

  useEffect(() => {
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets, { filters: listConfig, provider });
    });
  }, [listSharp, selectedDatasetsKey, selectedDatasets, listConfig, provider]);

  const form = useManualSearchForm({
    onSubmit: async (value) => {
      listSharp.update((state) => {
        applyUniqueLexisNexisSectionDefault(state.datasets, listConfig, provider);
      });
      const datasets = getCanonicalSelectedKeys(listSharp.value.datasets);

      const submitValue: FreeformSearchInput = {
        ...value,
        datasets: datasets.length > 0 ? datasets : undefined,
        limit: value.limit ?? DEFAULT_LIMIT,
      };

      searchMutation
        .mutateAsync(submitValue)
        .then((result) => {
          onSearchComplete(result, submitValue);
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
  });

  const threshold = useSelector(form.store, (state) => state.values.threshold);
  const entityType = useSelector(form.store, (state) => state.values.entityType);
  const limit = useSelector(form.store, (state) => state.values.limit);
  const fields = useSelector(form.store, (state) => state.values.fields);
  const originalLimit = useRef(limit ?? DEFAULT_LIMIT);

  const currentPreset = buildFreeformSearchPreset({
    entityType,
    fields,
    datasets: selectedDatasets,
    threshold: threshold ?? defaultThreshold,
    limit: limit ?? DEFAULT_LIMIT,
  });
  const isPresetDirty =
    !!selectedPreset && !!appliedPreset && isFreeformSearchPresetDirty(currentPreset, appliedPreset);

  const applyPreset = (preset: FreeformSearchPreset) => {
    const normalized = normalizeFreeformSearchPreset(preset, {
      threshold: defaultThreshold,
      datasets: defaultDatasets,
      limit: DEFAULT_LIMIT,
    });
    const nextEntityType = normalized.entityType ?? 'Thing';
    const currentName = form.state.values.fields.name ?? '';
    form.setFieldValue('entityType', nextEntityType);
    form.setFieldValue('fields', getPresetFormFields(nextEntityType, normalized.fields, currentName));
    form.setFieldValue('threshold', normalized.threshold);
    form.setFieldValue('limit', normalized.limit);
    originalLimit.current = normalized.limit ?? DEFAULT_LIMIT;
    setSelectedDatasets(normalized.datasets ?? []);
    setAppliedPreset(normalized);
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleClearFilters = () => {
    presetRequestRef.current += 1;
    setAppliedPreset(undefined);
    form.reset();
    setSelectedDatasets([]);
    setSelectedPreset(undefined);
    originalLimit.current = DEFAULT_LIMIT;
  };

  const handlePresetSelect = (name: string) => {
    const requestId = ++presetRequestRef.current;
    setAppliedPreset(undefined);
    setSelectedPreset(name);
    void queryClient
      .fetchQuery({
        queryKey: getFreeformSearchPresetQueryKey(name),
        queryFn: () => getFreeFormSearchPreset({ data: { name } }),
      })
      .then((data) => {
        if (requestId !== presetRequestRef.current) return;
        if (data === undefined) {
          toast.error(t('common:errors.unknown'));
          setSelectedPreset(undefined);
          return;
        }
        applyPreset(data);
      })
      .catch(() => {
        if (requestId !== presetRequestRef.current) return;
        toast.error(t('common:errors.unknown'));
        setSelectedPreset(undefined);
      });
  };

  const handleSaveFilters = async () => {
    const trimmedName = presetName.trim();
    if (!trimmedName) {
      setPresetNameError(t('screenings:freeform_search.preset_name_required'));
      return;
    }
    if (listFreeFormSearchPresetsQuery.data?.includes(trimmedName)) {
      setPresetNameError(t('screenings:freeform_search.preset_name_already_exists'));
      return;
    }
    const result = await createFreeFormSearchPresetMutation.mutateAsync({
      name: trimmedName,
      value: currentPreset,
    });
    if (result.success) {
      presetRequestRef.current += 1;
      applyPreset(currentPreset);
      setSelectedPreset(trimmedName);
      setSavePresetPopoverOpen(false);
      setPresetName('');
      setPresetNameError(undefined);
    } else if (result.error === 'duplicate_name') {
      setPresetNameError(t('screenings:freeform_search.preset_name_already_exists'));
    } else {
      toast.error(t('common:errors.unknown'));
    }
  };

  const handleSavePresetPopoverChange = (isOpen: boolean) => {
    setSavePresetPopoverOpen(isOpen);
    if (!isOpen) {
      setPresetName('');
      setPresetNameError(undefined);
    }
  };

  const hasActiveFilters =
    selectedDatasets.length > 0 ||
    (entityType && entityType !== 'Thing') ||
    hasFilledPresetFields(fields, entityType) ||
    (limit !== undefined && limit !== DEFAULT_LIMIT) ||
    (threshold !== undefined && threshold !== defaultThreshold);

  return (
    <ManualSearchFormContext.Provider value={form}>
      <EntitySearchFormProvider form={form}>
        <div className="flex flex-col gap-md">
          <div className="bg-surface-card border-grey-border rounded-lg border p-md space-y-md">
            <form onSubmit={handleSubmit}>
              {/* Search by name input with button */}
              <div className="flex gap-sm">
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
                    <div className="flex flex-1 flex-col gap-xs">
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
            <div className="bg-surface-card border-grey-border rounded-lg border p-md space-y-md">
              {listFreeFormSearchPresetsQuery?.data?.length ? (
                <div className="w-full [&>div]:w-full">
                  <SelectV2
                    options={listFreeFormSearchPresetsQuery.data.map((preset) => ({ label: preset, value: preset }))}
                    placeholder={t('screenings:freeform_search.preset_placeholder')}
                    value={selectedPreset}
                    onChange={(value) => {
                      if (value) handlePresetSelect(value);
                    }}
                    displayedValue={(option) =>
                      isPresetDirty ? `${option.value} ${t('screenings:freeform_search.preset_edited')}` : option.value
                    }
                    className={cn('w-full', isPresetDirty && 'bg-grey-background text-grey-disabled')}
                  />
                </div>
              ) : null}
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
          <div className="flex gap-sm justify-end">
            {hasActiveFilters && (
              <div className="flex gap-sm">
                <Button variant="secondary" appearance="stroked" size="medium" onClick={handleClearFilters}>
                  {t('screenings:freeform_search.clear_filters')}
                </Button>
                <Popover.Root open={savePresetPopoverOpen} onOpenChange={handleSavePresetPopoverChange}>
                  <Popover.Trigger asChild>
                    <Button variant="primary" appearance="stroked" size="medium">
                      {t('screenings:freeform_search.save_filters')}
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content side="bottom" align="end" sideOffset={4} className="w-[280px] p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveFilters();
                      }}
                      className="flex flex-col gap-2"
                    >
                      <Input
                        autoFocus
                        value={presetName}
                        onChange={(e) => {
                          setPresetName(e.target.value);
                          if (presetNameError) setPresetNameError(undefined);
                        }}
                        placeholder={t('screenings:freeform_search.preset_name_placeholder')}
                        borderColor={presetNameError ? 'redfigma-47' : 'greyfigma-90'}
                        disabled={createFreeFormSearchPresetMutation.isPending}
                      />
                      {presetNameError ? <span className="text-red-primary text-xs">{presetNameError}</span> : null}
                    </form>
                  </Popover.Content>
                </Popover.Root>
              </div>
            )}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => {
                return (
                  <Button
                    variant="primary"
                    size="medium"
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-xs"
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
}

export default FreeformSearchForm;
