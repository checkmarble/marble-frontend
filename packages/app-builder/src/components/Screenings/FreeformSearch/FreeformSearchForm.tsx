import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningCategory, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import { useFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { type FreeformSearchInput } from '@app-builder/routes/ressources+/screenings+/freeform-search';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { type FunctionComponent, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Checkbox, Input, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DatasetTag } from '../DatasetTag';
import { screeningsI18n } from '../screenings-i18n';
import { ThresholdSlider } from './ThresholdSlider';

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
  const datasetsQuery = useScreeningDatasetsQuery();
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
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];

  const onSearchEntityChange = ({ value }: { value: SearchableSchema }) => {
    if (value) {
      const newFields = setAdditionalFields(SEARCH_ENTITIES[value].fields, form.state.values.fields);
      form.setFieldValue('fields', newFields);
    }
  };

  const toggleDataset = (datasetName: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(datasetName) ? prev.filter((d) => d !== datasetName) : [...prev, datasetName],
    );
  };

  const toggleSection = (section: OpenSanctionsCatalogSection, select: boolean) => {
    const datasetNames = section.datasets.map((d) => d.name);
    setSelectedDatasets((prev) => {
      if (select) {
        return [...new Set([...prev, ...datasetNames])];
      } else {
        return prev.filter((d) => !datasetNames.includes(d));
      }
    });
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Search input with button */}
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
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || searchMutation.isPending}
              variant="primary"
              className="shrink-0 px-2"
            >
              {isSubmitting || searchMutation.isPending ? (
                <Icon icon="spinner" className="size-4 animate-spin" />
              ) : (
                <Icon icon="search" className="size-4" />
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Entity type filter */}
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className={clsx(
                'text-s flex w-full items-center justify-between rounded px-2 py-2',
                entityType && entityType !== 'Thing'
                  ? 'bg-purple-primary text-white'
                  : 'bg-purple-background-light text-purple-primary',
              )}
            >
              <span className="font-medium">{t('screenings:freeform_search.entity_type_label')}</span>
              <Icon icon="caret-down" className="size-4 [[data-state=open]>&]:rotate-180" />
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="mt-2">
              <form.Field name="entityType" listeners={{ onChange: onSearchEntityChange }}>
                {(field) => <EntitySelect name={field.name} value={field.state.value} onChange={field.handleChange} />}
              </form.Field>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Dynamic fields filter (only show if there are additional fields beyond name) */}
        {additionalFields.filter((f) => f !== 'name').length > 0 && (
          <Collapsible.Root>
            <Collapsible.Trigger asChild>
              <button
                type="button"
                className="text-s bg-purple-background-light text-purple-primary flex w-full items-center justify-between rounded px-2 py-2"
              >
                <span className="font-medium">{t('screenings:freeform_search.additional_fields')}</span>
                <Icon icon="caret-down" className="size-4 [[data-state=open]>&]:rotate-180" />
              </button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div className="mt-2 flex flex-col gap-2">
                {additionalFields
                  .filter((fieldName) => fieldName !== 'name')
                  .map((fieldName) => (
                    <form.Field key={fieldName} name={`fields.${fieldName}`}>
                      {(formField) => (
                        <div>
                          <span className="text-xs text-grey-placeholder">
                            {t(`screenings:entity.property.${fieldName}`)}
                          </span>
                          <Input
                            name={formField.name}
                            value={(formField.state.value as string) ?? ''}
                            onChange={(e) => formField.handleChange(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}
                    </form.Field>
                  ))}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        )}

        {/* Datasets filter */}
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className={clsx(
                'text-s flex w-full items-center justify-between rounded px-2 py-2',
                selectedDatasets.length > 0
                  ? 'bg-purple-primary text-white'
                  : 'bg-purple-background-light text-purple-primary',
              )}
            >
              <span className="font-medium">{t('screenings:freeform_search.datasets_label')}</span>
              <div className="flex items-center gap-1">
                {selectedDatasets.length > 0 && (
                  <span className="bg-surface-card text-grey-primary rounded-full px-1.5 text-xs font-semibold">
                    {selectedDatasets.length}
                  </span>
                )}
                <Icon icon="caret-down" className="size-4 [[data-state=open]>&]:rotate-180" />
              </div>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="border-grey-border mt-2 max-h-[200px] overflow-y-auto rounded-md border">
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
              ) : (
                <div className="flex flex-col">
                  {datasetsQuery.data?.datasets.sections.map((section) => (
                    <DatasetSectionCollapsible
                      key={section.name}
                      section={section}
                      selectedDatasets={selectedDatasets}
                      onToggleDataset={toggleDataset}
                      onToggleSection={toggleSection}
                    />
                  ))}
                </div>
              )}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Threshold filter */}
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className="text-s bg-purple-background-light text-purple-primary flex w-full items-center justify-between rounded px-2 py-2"
            >
              <span className="font-medium">{t('screenings:freeform_search.threshold_label')}</span>
              <Icon icon="caret-down" className="size-4 [[data-state=open]>&]:rotate-180" />
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="mt-2">
              <form.Field name="threshold">
                {(field) => (
                  <ThresholdSlider value={field.state.value} onChange={(value) => field.handleChange(value)} />
                )}
              </form.Field>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-s border-grey-border text-grey-placeholder hover:text-grey-primary flex w-full items-center justify-center gap-1 rounded border px-2 py-2"
          >
            <Icon icon="cross" className="size-4" />
            {t('screenings:freeform_search.clear')}
          </button>
        )}
      </div>
    </form>
  );
};

interface EntitySelectProps {
  name: string;
  value: SearchableSchema | undefined;
  onChange: (value: SearchableSchema) => void;
}

function EntitySelect({ name, value, onChange }: EntitySelectProps) {
  const { t } = useTranslation(screeningsI18n);
  const schemas = R.keys(SEARCH_ENTITIES);
  const lowerCasedSchema = value?.toLowerCase() as Lowercase<NonNullable<typeof value>> | undefined;
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-full" name={name}>
          {lowerCasedSchema
            ? t(`screenings:refine_modal.schema.${lowerCasedSchema}`)
            : t('screenings:freeform_search.entity_type_placeholder')}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start">
        <MenuCommand.List>
          {schemas.map((schema) => {
            const schemaKey = schema.toLowerCase() as Lowercase<typeof schema>;
            const fieldForSchema = SEARCH_ENTITIES[schema].fields;

            return (
              <MenuCommand.Item
                key={schema}
                onSelect={() => {
                  onChange(schema);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon icon="plus" className="size-5" />
                  <div className="flex flex-col">
                    <span>{t(`screenings:refine_modal.schema.${schemaKey}`)}</span>
                    <span className="text-grey-placeholder text-xs">
                      {t('screenings:refine_modal.search_by')}{' '}
                      {fieldForSchema.map((f) => t(`screenings:entity.property.${f}`)).join(', ')}
                    </span>
                  </div>
                </div>
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
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
                'hover:bg-grey-background-light even:bg-grey-background-light/50',
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
