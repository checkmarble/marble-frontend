import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { useResizeObserver } from '@app-builder/hooks/useResizeObserver';
import { tryCatch } from '@app-builder/utils/tryCatch';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import CountryFlag from 'country-flag-emojis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn, Input, SelectCountry, SelectCountryValue, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';

export interface EntityTypePopoverProps {
  disabled: boolean;
  entityType: SearchableSchema | undefined;
  fields: Record<string, string | undefined>;
  onEntityTypeChange: (entityType: SearchableSchema) => void;
  onFieldChange: (fieldName: string, value: string) => void;
}

export function EntityTypePopover({
  disabled,
  entityType,
  fields,
  onEntityTypeChange,
  onFieldChange,
}: EntityTypePopoverProps) {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);
  const [additionalFieldsOpenRequest, setAdditionalFieldsOpenRequest] = useState(0);
  const { ref: tagRef, dimensions } = useResizeObserver<HTMLDivElement>({ observeHeight: false });

  const handleSelect = (schema: SearchableSchema) => {
    onEntityTypeChange(schema);
    setOpen(false);
    if (schema !== 'Thing') {
      setAdditionalFieldsOpenRequest((count) => count + 1);
    }
  };

  const hasSelection = entityType && entityType !== 'Thing';
  const schemas = R.keys(SEARCH_ENTITIES);

  return (
    <div className="flex items-center gap-2 relative">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <div className="flex items-center gap-2 flex-wrap" ref={tagRef}>
            <Tag
              color={disabled ? 'grey' : 'purple'}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">
                {hasSelection
                  ? t(`screenings:refine_modal.schema.${entityType.toLowerCase()}`)
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
                const schemaKey = schema.toLowerCase() as Lowercase<typeof schema>;
                const fieldForSchema = SEARCH_ENTITIES[schema].fields;
                const isSelected = entityType === schema;

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
      {hasSelection && (
        <AdditionalEntityTypePopover
          offset={dimensions.width}
          disabled={disabled}
          entityType={entityType}
          fields={fields}
          openRequest={additionalFieldsOpenRequest}
          onFieldChange={onFieldChange}
        />
      )}
    </div>
  );
}

function getDraftFieldsFromCommitted(
  entityTypeFields: string[],
  committedFields: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(entityTypeFields.map((fieldName) => [fieldName, committedFields[fieldName] ?? '']));
}

function validateBirthDate(value: string): boolean {
  if (!value) return true;
  return /^\d{4}(-\d{2}-\d{2})?$/.test(value);
}

interface AdditionalEntityTypePopoverProps {
  offset: number;
  disabled: boolean;
  entityType: SearchableSchema;
  fields: Record<string, string | undefined>;
  openRequest: number;
  onFieldChange: (fieldName: string, value: string) => void;
}

function AdditionalEntityTypePopover({
  offset,
  disabled,
  entityType,
  fields: committedFields,
  openRequest,
  onFieldChange,
}: AdditionalEntityTypePopoverProps) {
  const [open, setOpen] = useState(false);
  const entityTypeFields = SEARCH_ENTITIES[entityType].fields.filter((f) => f !== 'name');
  const { t } = useTranslation(screeningsI18n);

  const [draftFields, setDraftFields] = useState<Record<string, string>>(() =>
    getDraftFieldsFromCommitted(entityTypeFields, committedFields),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const lastProcessedOpenRequest = useRef(0);
  const hasSelection = entityType && entityType !== 'Thing';

  const filterTags = hasSelection
    ? SEARCH_ENTITIES[entityType].fields
        .filter((f) => f !== 'name')
        .map((fieldName) => {
          const fieldValue = committedFields[fieldName];
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

  useEffect(() => {
    if (openRequest <= lastProcessedOpenRequest.current || disabled) return;
    lastProcessedOpenRequest.current = openRequest;
    setDraftFields(getDraftFieldsFromCommitted(entityTypeFields, committedFields));
    setFieldErrors({});
    setOpen(true);
  }, [openRequest, disabled]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (disabled) return;
      if (isOpen) {
        setDraftFields(getDraftFieldsFromCommitted(entityTypeFields, committedFields));
        setFieldErrors({});
      }
      setOpen(isOpen);
    },
    [committedFields, disabled, entityTypeFields],
  );

  const updateDraftField = (fieldName: string, value: string) => {
    setDraftFields((prev) => ({ ...prev, [fieldName]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleApply = () => {
    const errors: Record<string, string> = {};
    for (const fieldName of entityTypeFields) {
      if (fieldName === 'birthDate' && !validateBirthDate(draftFields[fieldName] ?? '')) {
        errors[fieldName] = t('screenings:freeform_search.birth_date_invalid');
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    for (const fieldName of entityTypeFields) {
      onFieldChange(fieldName, draftFields[fieldName] ?? '');
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild disabled={disabled}>
        <div className="flex items-center gap-2 flex-wrap">
          {filterTags}
          <Icon
            icon="plus"
            className={cn(
              'size-4 text-purple-primary cursor-pointer ',
              disabled && 'text-grey-placeholder opacity-50 cursor-not-allowed ',
            )}
          />
        </div>
      </Popover.Trigger>
      <Popover.Content
        className="bg-surface-card border-grey-border z-50 flex w-[400px] flex-col rounded-lg border shadow-lg"
        sideOffset={8}
        align="start"
        alignOffset={-(offset + 8)} // 8px is the gap
      >
        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1 p-2">
          {entityTypeFields.map((fieldName, index) => {
            const isLastOdd = index === entityTypeFields.length - 1 && entityTypeFields.length % 2 === 1;
            const value = draftFields[fieldName] ?? '';

            if (fieldName === 'country' || fieldName === 'nationality') {
              return (
                <SelectCountry
                  key={fieldName}
                  name={fieldName}
                  rootClassName={cn('w-full', isLastOdd && 'col-span-2 lg:col-span-1')}
                  className="w-full"
                  value={countryFormStringToValue(value)}
                  onValueChange={(v) => updateDraftField(fieldName, countryValueToFormString(v))}
                  placeholder={t(`screenings:entity.property.${fieldName}`)}
                />
              );
            }
            if (fieldName === 'birthDate') {
              return (
                <div key={fieldName} className={cn('flex flex-col gap-1', isLastOdd && 'col-span-2 lg:col-span-1')}>
                  <Input
                    name={fieldName}
                    value={value}
                    onChange={(e) => updateDraftField(fieldName, e.target.value)}
                    className="w-full"
                    placeholder={t('screenings:entity.property.birthDate.format')}
                  />
                  {fieldErrors[fieldName] && <span className="text-red-primary text-xs">{fieldErrors[fieldName]}</span>}
                </div>
              );
            }
            return (
              <Input
                key={fieldName}
                name={fieldName}
                value={value}
                onChange={(e) => updateDraftField(fieldName, e.target.value)}
                className={cn('w-full', isLastOdd && 'col-span-2 lg:col-span-1')}
                placeholder={t(`screenings:entity.property.${fieldName}`)}
              />
            );
          })}
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="default"
              className="w-full justify-center"
              onClick={handleApply}
            >
              {t('screenings:freeform_search.apply')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="default"
              className="w-full justify-center"
              onClick={handleCancel}
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

function countryFormStringToValue(raw: string): SelectCountryValue | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const cc = trimmed.length <= 3 ? trimmed.toUpperCase() : trimmed;
  const res = tryCatch(() => CountryFlag.byCountryCode(cc));
  if (res.ok) {
    const c = res.value;
    return {
      isoAlpha2: c.isoAlpha2,
      isoAlpha3: c.isoAlpha3,
      name: c.nameEnglish,
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
