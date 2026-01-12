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
      fields: setAdditionalFields(SEARCH_ENTITIES['Thing'].fields, {}),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Main search row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Entity type */}
        <div className="w-48 shrink-0">
          <Field label={t('screenings:freeform_search.entity_type_label')}>
            <form.Field name="entityType" listeners={{ onChange: onSearchEntityChange }}>
              {(field) => <EntitySelect name={field.name} value={field.state.value} onChange={field.handleChange} />}
            </form.Field>
          </Field>
        </div>

        {/* Dynamic fields */}
        {additionalFields.map((fieldName) => (
          <form.Field key={fieldName} name={`fields.${fieldName}`}>
            {(formField) => (
              <div className={clsx('shrink-0', fieldName === 'name' ? 'w-64' : 'w-48')}>
                <Field label={t(`screenings:entity.property.${fieldName}`)} required={fieldName === 'name'}>
                  <Input
                    name={formField.name}
                    value={(formField.state.value as string) ?? ''}
                    onChange={(e) => formField.handleChange(e.target.value)}
                    className="w-full"
                    placeholder={fieldName === 'name' ? t('screenings:freeform_search.name_placeholder') : undefined}
                  />
                </Field>
              </div>
            )}
          </form.Field>
        ))}

        {/* Submit button */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting || searchMutation.isPending} variant="primary">
              {isSubmitting || searchMutation.isPending ? (
                <Icon icon="spinner" className="size-4 animate-spin" />
              ) : (
                <Icon icon="search" className="size-4" />
              )}
              {t('screenings:freeform_search.submit')}
            </Button>
          )}
        </form.Subscribe>
      </div>

      {/* Advanced options row */}
      <Collapsible.Root>
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="text-s text-grey-placeholder hover:text-grey-primary flex items-center gap-1"
          >
            <Icon
              icon="caret-down"
              className="size-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180"
            />
            {t('screenings:freeform_search.advanced_options')}
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="mt-4 grid grid-cols-2 gap-6">
            {/* Datasets */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-s font-medium text-grey-primary">
                  {t('screenings:freeform_search.datasets_label')}
                </span>
                {selectedDatasets.length > 0 && (
                  <span className="text-s text-grey-placeholder">
                    {t('screenings:freeform_search.datasets_selected', {
                      count: selectedDatasets.length,
                    })}
                  </span>
                )}
              </div>
              <div className="border-grey-border max-h-[200px] overflow-y-auto rounded-md border">
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
              <p className="text-xs text-grey-placeholder">{t('screenings:freeform_search.datasets_description')}</p>
            </div>

            {/* Threshold */}
            <div>
              <form.Field name="threshold">
                {(field) => (
                  <ThresholdSlider value={field.state.value} onChange={(value) => field.handleChange(value)} />
                )}
              </form.Field>
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </form>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

function Field({ label, children, required }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-s font-medium text-grey-primary">
        {label}
        {required && <span className="text-red-primary ml-1">*</span>}
      </span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

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
