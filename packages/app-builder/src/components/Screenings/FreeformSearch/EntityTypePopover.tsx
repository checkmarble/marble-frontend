import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { formatCountryName } from '@app-builder/utils/format';
import { tryCatch } from '@app-builder/utils/tryCatch';
import * as Popover from '@radix-ui/react-popover';
import CountryFlag from 'country-flag-emojis';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn, Input, SelectCountry, SelectCountryValue, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';
import { setAdditionalFields } from '../set-additional-fields';
import { useEntitySearchForm, useEntitySearchFormStore } from './entity-search-form-context';

export interface EntityTypePopoverProps {
  disabled: boolean;
}

export const EntityTypePopover = ({ disabled }: EntityTypePopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);
  const form = useEntitySearchForm();
  const value = useEntitySearchFormStore((state) => state.values.entityType);
  const [additionalFieldsOpenRequest, setAdditionalFieldsOpenRequest] = useState(0);

  const handleSelect = (schema: SearchableSchema) => {
    form.setFieldValue('entityType', schema);
    form.setFieldValue('fields', setAdditionalFields(SEARCH_ENTITIES[schema].fields, form.state.values.fields));
    setOpen(false);
    if (schema !== 'Thing') {
      setAdditionalFieldsOpenRequest((count) => count + 1);
    }
  };

  const hasSelection = value && value !== 'Thing';
  const schemas = R.keys(SEARCH_ENTITIES);

  return (
    <div className="flex items-center gap-2 relative">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <div className="flex items-center gap-2 flex-wrap">
            <Tag
              color={disabled ? 'grey' : 'purple'}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">
                {hasSelection
                  ? t(`screenings:refine_modal.schema.${value.toLowerCase()}`)
                  : t('screenings:freeform_search.all_entities')}
              </span>
            </Tag>
          </div>
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
                const schemaKey = schema.toLowerCase();
                const fieldForSchema = SEARCH_ENTITIES[schema].fields;
                const isSelected = value === schema;

                return (
                  <button
                    key={schema}
                    type="button"
                    onClick={() => handleSelect(schema)}
                    className={cn(
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
      {hasSelection && <AdditionalEntityTypePopover disabled={disabled} openRequest={additionalFieldsOpenRequest} />}
    </div>
  );
};

function AdditionalEntityTypePopover({ disabled, openRequest }: { disabled: boolean; openRequest: number }) {
  const [open, setOpen] = useState(false);
  const form = useEntitySearchForm();
  const entityType = useEntitySearchFormStore((state) => state.values.entityType);
  const entityTypeFields =
    entityType && entityType in SEARCH_ENTITIES
      ? SEARCH_ENTITIES[entityType].fields.filter((f: string) => f !== 'name')
      : [];
  const { t, i18n } = useTranslation(screeningsI18n);
  const fields = useEntitySearchFormStore((state) => state.values.fields);
  const lastProcessedOpenRequest = useRef(0);

  useEffect(() => {
    if (openRequest <= lastProcessedOpenRequest.current || disabled) return;
    lastProcessedOpenRequest.current = openRequest;
    setOpen(true);
  }, [openRequest, disabled]);

  const hasSelection = entityType && entityType !== 'Thing';

  const filterTags = hasSelection
    ? SEARCH_ENTITIES[entityType].fields
        .filter((f: string) => f !== 'name')
        .map((fieldName: string) => {
          const fieldValue = fields[fieldName];
          if (!fieldValue) return null;
          const label = getFilterTagLabel(fieldName, fieldValue, t);
          if (!label) return null;
          return (
            <Tag
              key={fieldName}
              color={disabled ? 'grey' : 'purple'}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">{label}</span>
            </Tag>
          );
        })
        .filter(Boolean)
    : null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex items-center gap-2 flex-wrap"
          aria-label={t('screenings:freeform_search.advanced_filters')}
        >
          {filterTags}
          <Icon
            icon="plus"
            className={cn(
              'size-4 text-purple-primary cursor-pointer ',
              disabled && 'text-grey-placeholder opacity-50 cursor-not-allowed ',
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Content
        className="bg-surface-card border-grey-border z-50 flex w-[400px] flex-col rounded-lg border shadow-lg"
        sideOffset={8}
        align="start"
      >
        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1 p-2">
          {entityTypeFields.map((fieldName, index) => {
            const isLastOdd = index === entityTypeFields.length - 1 && entityTypeFields.length % 2 === 1;
            return (
              <form.Field
                key={fieldName}
                name={`fields.${fieldName}`}
                validators={
                  fieldName === 'birthDate'
                    ? {
                        onChange: ({ value }) => {
                          const v = (value as string) ?? '';
                          if (!v) return undefined;
                          return /^\d{4}(-\d{2}-\d{2})?$/.test(v)
                            ? undefined
                            : t('screenings:freeform_search.birth_date_invalid');
                        },
                      }
                    : undefined
                }
              >
                {(formField) => {
                  if (fieldName === 'country' || fieldName === 'nationality') {
                    return (
                      <SelectCountry
                        name={formField.name}
                        rootClassName={cn('w-full', isLastOdd && 'col-span-2 lg:col-span-1')}
                        className="w-full"
                        value={countryFormStringToValue((formField.state.value as string) ?? '', i18n.language)}
                        onValueChange={(v) => formField.handleChange(countryValueToFormString(v))}
                        placeholder={t(`screenings:entity.property.${fieldName}`)}
                      />
                    );
                  }
                  if (fieldName === 'birthDate') {
                    return (
                      <div className={cn('flex flex-col gap-1', isLastOdd && 'col-span-2 lg:col-span-1')}>
                        <Input
                          name={formField.name}
                          value={(formField.state.value as string) ?? ''}
                          onChange={(e) => formField.handleChange(e.target.value)}
                          onBlur={formField.handleBlur}
                          className="w-full"
                          placeholder={t('screenings:entity.property.birthDate.format')}
                        />
                        {formField.state.meta.errors.length > 0 && (
                          <span className="text-red-primary text-xs">{formField.state.meta.errors[0]}</span>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Input
                      name={formField.name}
                      value={(formField.state.value as string) ?? ''}
                      onChange={(e) => formField.handleChange(e.target.value)}
                      className={cn('w-full', isLastOdd && 'col-span-2 lg:col-span-1')}
                      placeholder={t(`screenings:entity.property.${fieldName}`)}
                    />
                  );
                }}
              </form.Field>
            );
          })}
          {/* Actions */}
          <div className="flex gap-2">
            {/* Apply button */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  variant="primary"
                  size="default"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  {isSubmitting ? (
                    <Icon icon="spinner" className="size-5 animate-spin" />
                  ) : (
                    <>
                      {t('screenings:freeform_search.apply')}
                      <Icon icon="search" className="size-5" />
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="secondary"
              size="default"
              className="w-full justify-center"
              onClick={() => {
                setOpen(false);
              }}
            >
              {t('common:cancel')}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

function getFilterTagLabel(
  fieldName: string,
  value: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  switch (fieldName) {
    case 'country':
    case 'nationality':
    case 'birthDate':
      return value;
    case 'passportNumber':
      return t('screenings:freeform_search.tag.passport', { value });
    case 'address': {
      const truncated = value.length > 15 ? `${value.slice(0, 15)}…` : value;
      return t('screenings:freeform_search.tag.address', { value: truncated });
    }
    case 'registrationNumber':
      return t('screenings:freeform_search.tag.registration', { value });
    default:
      return null;
  }
}

function countryFormStringToValue(raw: string, language: string): SelectCountryValue | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const cc = trimmed.length <= 3 ? trimmed.toUpperCase() : trimmed;
  const res = tryCatch(() => CountryFlag.byCountryCode(cc));
  if (res.ok) {
    const c = res.value;
    return {
      isoAlpha2: c.isoAlpha2,
      isoAlpha3: c.isoAlpha3,
      name: formatCountryName(c.isoAlpha2, language) ?? c.nameEnglish,
      isManual: false,
    };
  }
  return { isoAlpha2: '', isoAlpha3: '', name: trimmed, isManual: true };
}

function countryValueToFormString(v: SelectCountryValue | null): string {
  if (!v) return '';
  if (v.isManual) return v.name;
  return v.isoAlpha3;
}
