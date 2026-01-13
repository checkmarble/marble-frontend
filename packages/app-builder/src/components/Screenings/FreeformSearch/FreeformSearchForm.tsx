import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningCategory, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import { useFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { type FreeformSearchInput } from '@app-builder/routes/ressources+/screenings+/freeform-search';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Popover from '@radix-ui/react-popover';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { type FunctionComponent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ButtonV2, Checkbox, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DatasetTag } from '../DatasetTag';
import { screeningsI18n } from '../screenings-i18n';

function setAdditionalFields(fields: string[], prev: FreeformSearchInput['fields']): FreeformSearchInput['fields'] {
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

export const FreeformSearchForm: FunctionComponent<FreeformSearchFormProps> = ({ onSearchComplete }) => {
  const { t } = useTranslation(screeningsI18n);
  const searchMutation = useFreeformSearchMutation();
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      entityType: 'Thing',
      fields: setAdditionalFields(SEARCH_ENTITIES['Thing'].fields, {} as FreeformSearchInput['fields']),
    } as FreeformSearchInput,
    onSubmit: async ({ value }) => {
      const submitValue: FreeformSearchInput = {
        ...value,
        datasets: selectedDatasets.length > 0 ? selectedDatasets : undefined,
      };

      const result = await searchMutation.mutateAsync(submitValue);

      if (result.success) {
        onSearchComplete(result.data, submitValue);
      } else {
        toast.error(t('common:errors.unknown'));
      }
    },
  });

  const entityType = useStore(form.store, (state) => state.values.entityType);
  const threshold = useStore(form.store, (state) => state.values.threshold);
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];

  const onSearchEntityChange = ({ value }: { value: SearchableSchema }) => {
    if (value) {
      const newFields = setAdditionalFields(SEARCH_ENTITIES[value].fields, form.state.values.fields);
      form.setFieldValue('fields', newFields);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleClearFilters = () => {
    form.reset();
    setSelectedDatasets([]);
  };

  const hasActiveFilters = selectedDatasets.length > 0 || (entityType && entityType !== 'Thing');

  const hasEntityTypeSelected = entityType && entityType !== 'Thing';
  const entityTypeFields = additionalFields.filter((f) => f !== 'name');
  const entityTypeLabel = hasEntityTypeSelected
    ? (entityType.toLowerCase() as Lowercase<typeof entityType>)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Search by name input with button */}
      <div className="flex gap-2">
        <form.Field name="fields.name">
          {(formField) => (
            <Input
              name={formField.name}
              value={(formField.state.value as string) ?? ''}
              onChange={(e) => formField.handleChange(e.target.value)}
              className="flex-1"
              placeholder={t('screenings:freeform_search.name_placeholder')}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <ButtonV2
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
            </ButtonV2>
          )}
        </form.Subscribe>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Datasets filter */}
        <DatasetsPopover selectedDatasets={selectedDatasets} onApply={setSelectedDatasets} />

        {/* Entity type filter */}
        <EntityTypePopover
          value={entityType}
          onApply={(value) => {
            form.setFieldValue('entityType', value);
            onSearchEntityChange({ value });
          }}
        />

        {/* Threshold filter */}
        <ThresholdPopover value={threshold} onApply={(value) => form.setFieldValue('threshold', value)} />
      </div>

      {/* Entity-specific fields section (only show when entity type is selected) */}
      {hasEntityTypeSelected && entityTypeFields.length > 0 && (
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger asChild>
            <button type="button" className="flex w-full items-center gap-2">
              <span className="text-xs text-grey-placeholder">
                {t('screenings:freeform_search.fields_for_entity', {
                  entity: entityTypeLabel ? t(`screenings:refine_modal.schema.${entityTypeLabel}`) : '',
                })}
              </span>
              <div className="border-grey-border h-px flex-1 border-t" />
              <Icon icon="caret-down" className="text-grey-placeholder size-4 [[data-state=open]>&]:rotate-180" />
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="mt-2 flex flex-col gap-2">
              {entityTypeFields.map((fieldName) => (
                <form.Field key={fieldName} name={`fields.${fieldName}`}>
                  {(formField) => (
                    <Input
                      name={formField.name}
                      value={(formField.state.value as string) ?? ''}
                      onChange={(e) => formField.handleChange(e.target.value)}
                      className="w-full"
                      placeholder={t(`screenings:entity.property.${fieldName}`)}
                    />
                  )}
                </form.Field>
              ))}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* Apply button */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <ButtonV2
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
            </ButtonV2>
          )}
        </form.Subscribe>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <ButtonV2
            type="button"
            variant="secondary"
            size="default"
            onClick={handleClearFilters}
            className="w-full justify-center"
          >
            <Icon icon="cross" className="size-5" />
            {t('screenings:freeform_search.clear_filters')}
          </ButtonV2>
        )}
      </div>
    </form>
  );
};

interface DatasetsPopoverProps {
  selectedDatasets: string[];
  onApply: (datasets: string[]) => void;
}

function DatasetsPopover({ selectedDatasets, onApply }: DatasetsPopoverProps) {
  const { t } = useTranslation(screeningsI18n);
  const datasetsQuery = useScreeningDatasetsQuery();
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedDatasets);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset temp selection when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelected(selectedDatasets);
      setSearchQuery('');
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    onApply(tempSelected);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(selectedDatasets);
    setOpen(false);
  };

  const toggleDataset = (datasetName: string) => {
    setTempSelected((prev) =>
      prev.includes(datasetName) ? prev.filter((d) => d !== datasetName) : [...prev, datasetName],
    );
  };

  const toggleSection = (section: OpenSanctionsCatalogSection, select: boolean) => {
    const datasetNames = section.datasets.map((d) => d.name);
    setTempSelected((prev) => {
      if (select) {
        return [...new Set([...prev, ...datasetNames])];
      } else {
        return prev.filter((d) => !datasetNames.includes(d));
      }
    });
  };

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!datasetsQuery.data?.datasets.sections) return [];
    if (!searchQuery.trim()) return datasetsQuery.data.datasets.sections;

    const query = searchQuery.toLowerCase();
    return datasetsQuery.data.datasets.sections
      .map((section) => ({
        ...section,
        datasets: section.datasets.filter(
          (dataset) => dataset.title.toLowerCase().includes(query) || dataset.name.toLowerCase().includes(query),
        ),
      }))
      .filter((section) => section.datasets.length > 0);
  }, [datasetsQuery.data?.datasets.sections, searchQuery]);

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-s bg-purple-background-light text-purple-primary flex w-full items-center justify-between rounded px-2 py-2"
        >
          <span className="font-medium">{t('screenings:freeform_search.datasets_label')}</span>
          <div className="flex items-center gap-1">
            {selectedDatasets.length > 0 && (
              <span className="bg-surface-card text-grey-primary border-grey-border rounded-full border px-1.5 text-xs font-semibold">
                {selectedDatasets.length}
              </span>
            )}
            <Icon icon="caret-down" className="size-4" />
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[500px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Search input */}
          <div className="border-grey-border border-b p-4">
            <Input
              type="text"
              placeholder={t('screenings:freeform_search.datasets_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Datasets list */}
          <div className="max-h-[300px] overflow-y-auto">
            {datasetsQuery.isPending ? (
              <div className="flex items-center justify-center p-4">
                <Icon icon="spinner" className="text-grey-placeholder size-5 animate-spin" />
              </div>
            ) : datasetsQuery.isError ? (
              <div className="flex flex-col items-center gap-2 p-4">
                <span className="text-s text-grey-placeholder">{t('common:generic_fetch_data_error')}</span>
                <Button variant="secondary" size="small" onClick={() => datasetsQuery.refetch()}>
                  {t('common:retry')}
                </Button>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-s text-grey-placeholder">
                  {t('screenings:freeform_search.datasets_no_results')}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredSections.map((section) => (
                  <DatasetSectionCollapsible
                    key={section.name}
                    section={section}
                    selectedDatasets={tempSelected}
                    onToggleDataset={toggleDataset}
                    onToggleSection={toggleSection}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-grey-border flex gap-2 border-t p-4">
            <ButtonV2
              type="button"
              variant="secondary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleCancel}
            >
              {t('common:cancel')}
            </ButtonV2>
            <ButtonV2
              type="button"
              variant="primary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleApply}
            >
              {t('screenings:freeform_search.apply')}
            </ButtonV2>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface EntityTypePopoverProps {
  value: SearchableSchema | undefined;
  onApply: (value: SearchableSchema) => void;
}

function EntityTypePopover({ value, onApply }: EntityTypePopoverProps) {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);

  const handleSelect = (schema: SearchableSchema) => {
    onApply(schema);
    setOpen(false);
  };

  const hasSelection = value && value !== 'Thing';
  const schemas = R.keys(SEARCH_ENTITIES);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-s bg-purple-background-light text-purple-primary flex w-full items-center justify-between rounded px-2 py-2"
        >
          <span className="font-medium">{t('screenings:freeform_search.entity_type_label')}</span>
          <div className="flex items-center gap-1">
            {hasSelection && (
              <span className="bg-surface-card text-grey-primary border-grey-border rounded-full border px-1.5 text-xs font-semibold">
                1
              </span>
            )}
            <Icon icon="caret-down" className="size-4" />
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[400px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Entity type list */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {schemas.map((schema) => {
              const schemaKey = schema.toLowerCase() as Lowercase<typeof schema>;
              const fieldForSchema = SEARCH_ENTITIES[schema].fields;
              const isSelected = value === schema;

              return (
                <button
                  key={schema}
                  type="button"
                  onClick={() => handleSelect(schema)}
                  className={clsx(
                    'text-s flex w-full items-center gap-2 rounded px-3 py-2 text-left',
                    isSelected ? 'bg-purple-background-light text-purple-primary' : 'hover:bg-grey-background-light',
                  )}
                >
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">{t(`screenings:refine_modal.schema.${schemaKey}`)}</span>
                    <span className="text-grey-placeholder text-xs">
                      {t('screenings:refine_modal.search_by')}{' '}
                      {fieldForSchema.map((f) => t(`screenings:entity.property.${f}`)).join(', ')}
                    </span>
                  </div>
                  {isSelected && <Icon icon="tick" className="text-purple-primary size-4" />}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface ThresholdPopoverProps {
  value: number | undefined;
  onApply: (value: number | undefined) => void;
}

function ThresholdPopover({ value, onApply }: ThresholdPopoverProps) {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState<number | undefined>(value);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempValue(value);
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    onApply(tempValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '') {
      setTempValue(undefined);
      return;
    }
    const numValue = parseInt(newValue, 10);
    if (isNaN(numValue)) {
      setTempValue(undefined);
      return;
    }
    if (numValue < 0) {
      setTempValue(0);
      return;
    }
    if (numValue > 100) {
      setTempValue(100);
      return;
    }
    setTempValue(numValue);
  };

  const hasValue = value !== undefined;

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-s bg-purple-background-light text-purple-primary flex w-full items-center justify-between rounded px-2 py-2"
        >
          <span className="font-medium">{t('screenings:freeform_search.threshold_label')}</span>
          <div className="flex items-center gap-1">
            {hasValue && (
              <span className="bg-surface-card text-grey-primary border-grey-border rounded-full border px-1.5 text-xs font-semibold">
                {value}%
              </span>
            )}
            <Icon icon="caret-down" className="size-4" />
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[300px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Threshold input */}
          <div className="flex flex-col gap-2 p-4">
            <label className="text-s font-medium text-grey-primary">
              {t('screenings:freeform_search.threshold_label')}
            </label>
            <Input
              type="number"
              value={tempValue ?? ''}
              onChange={handleChange}
              min={0}
              max={100}
              placeholder="0-100"
            />
            <p className="text-xs text-grey-placeholder">{t('screenings:freeform_search.threshold_description')}</p>
          </div>

          {/* Actions */}
          <div className="border-grey-border flex gap-2 border-t p-4">
            <ButtonV2
              type="button"
              variant="secondary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleCancel}
            >
              {t('common:cancel')}
            </ButtonV2>
            <ButtonV2
              type="button"
              variant="primary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleApply}
            >
              {t('screenings:freeform_search.apply')}
            </ButtonV2>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface DatasetSectionCollapsibleProps {
  section: OpenSanctionsCatalogSection;
  selectedDatasets: string[];
  onToggleDataset: (datasetName: string) => void;
  onToggleSection: (section: OpenSanctionsCatalogSection, select: boolean) => void;
}

function DatasetSectionCollapsible({
  section,
  selectedDatasets,
  onToggleDataset,
  onToggleSection,
}: DatasetSectionCollapsibleProps) {
  const { t } = useTranslation(screeningsI18n);
  const selectedCount = section.datasets.filter((d) => selectedDatasets.includes(d.name)).length;
  const isAllSelected = selectedCount === section.datasets.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < section.datasets.length;

  return (
    <Collapsible.Root className="border-grey-border border-b last:border-b-0">
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className="text-s hover:bg-grey-background-light flex w-full items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Icon
              icon="caret-down"
              className="size-4 transition-transform duration-200 group-radix-state-open:rotate-180"
            />
            <span className="font-semibold">{section.title}</span>
            {selectedCount > 0 && <span className="text-grey-placeholder text-xs">({selectedCount})</span>}
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              size="small"
              checked={isAllSelected ? true : isPartiallySelected ? 'indeterminate' : false}
              onCheckedChange={() => onToggleSection(section, !isAllSelected)}
            />
            <span className="text-xs" onClick={() => onToggleSection(section, !isAllSelected)}>
              {isAllSelected ? t('common:select_none') : t('common:select_all')}
            </span>
          </div>
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="flex flex-col">
          {section.datasets.map((dataset) => (
            <label
              key={dataset.name}
              className={clsx(
                'text-s flex cursor-pointer items-center justify-between px-3 py-2 pl-9',
                'hover:bg-grey-background-light',
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  size="small"
                  checked={selectedDatasets.includes(dataset.name)}
                  onCheckedChange={() => onToggleDataset(dataset.name)}
                />
                <span>{dataset.title}</span>
              </div>
              {dataset.tag && <DatasetTag category={dataset.tag as ScreeningCategory} />}
            </label>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default FreeformSearchForm;
