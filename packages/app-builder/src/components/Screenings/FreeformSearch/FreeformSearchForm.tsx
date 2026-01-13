import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { type FreeformSearchInput } from '@app-builder/routes/ressources+/screenings+/freeform-search';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';
import { type FunctionComponent, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';
import { DatasetsPopover } from './DatasetsPopover';
import { EntityTypePopover } from './EntityTypePopover';
import { ThresholdPopover } from './ThresholdPopover';

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

      {/* Filters - 2 column grid on medium screens, single column on large */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        <EntityTypePopover
          value={entityType}
          onApply={(value) => {
            form.setFieldValue('entityType', value);
            onSearchEntityChange({ value });
          }}
        />

        <DatasetsPopover selectedDatasets={selectedDatasets} onApply={setSelectedDatasets} />

        <div className="col-span-2 lg:col-span-1">
          <ThresholdPopover value={threshold} onApply={(value) => form.setFieldValue('threshold', value)} />
        </div>
      </div>

      {/* Entity-specific fields section (only show when entity type is selected) */}
      {hasEntityTypeSelected && entityTypeFields.length > 0 && (
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger asChild>
            <button type="button" className="flex w-full items-center gap-2">
              <span className="text-grey-placeholder text-xs">
                {t('screenings:freeform_search.fields_for_entity', {
                  entity: entityTypeLabel ? t(`screenings:refine_modal.schema.${entityTypeLabel}`) : '',
                })}
              </span>
              <div className="border-grey-border h-px flex-1 border-t" />
              <Icon icon="caret-down" className="text-grey-placeholder size-4 [[data-state=open]>&]:rotate-180" />
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {entityTypeFields.map((fieldName, index) => {
                const isLastOdd = index === entityTypeFields.length - 1 && entityTypeFields.length % 2 === 1;
                return (
                  <form.Field key={fieldName} name={`fields.${fieldName}`}>
                    {(formField) => (
                      <Input
                        name={formField.name}
                        value={(formField.state.value as string) ?? ''}
                        onChange={(e) => formField.handleChange(e.target.value)}
                        className={clsx('w-full', isLastOdd && 'col-span-2 lg:col-span-1')}
                        placeholder={t(`screenings:entity.property.${fieldName}`)}
                      />
                    )}
                  </form.Field>
                );
              })}
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

        {/* Clear filters button - only show when filters are active */}
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

export default FreeformSearchForm;
