import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type FtmEntityPersonOption, type FtmEntityV2, ftmEntities, ftmEntityPersonOptions } from '@app-builder/models';
import { useDataModel } from '@app-builder/services/data/data-model';
import { getFieldErrors } from '@app-builder/utils/form';
import { useSelector } from '@tanstack/react-form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Input, SelectV2 } from 'ui-design-system';
import { isValidDataModelName } from '../../shared/dataModelNameValidation';
import { isLinkableTable } from '../Shared/semanticData-types';
import { useCreateTableFormContext } from './CreateTableContext';
import { requiresLink, type TablePropertyError } from './createTable-types';

export function CreateTableEntityStep({ errorFields }: { errorFields?: ReadonlySet<TablePropertyError['field']> }) {
  const form = useCreateTableFormContext();
  const { t } = useTranslation(['data']);
  const dataModel = useDataModel();

  const selectedEntityType = useSelector(form.store, (state) => state.values.entityType);
  const selectedSubEntity = useSelector(form.store, (state) => state.values.subEntity);
  const selectedBelongsToTableId = useSelector(form.store, (state) => state.values.belongsToTableId);

  // Tables that qualify as "person" or "other" for the transaction/event link requirement
  const personOrOtherTables = useMemo(() => dataModel.filter(isLinkableTable), [dataModel]);

  const canSelectTypeThatNeedsAPerson = personOrOtherTables.length > 0;
  const hasNameError = errorFields?.has('name') ?? false;
  const hasEntityTypeError = errorFields?.has('entityType') ?? false;
  const hasSubEntityError = errorFields?.has('subEntity') ?? false;
  const hasBelongsToError = errorFields?.has('belongsToTableId') ?? false;

  const linkTargetOptions = useMemo(
    () =>
      personOrOtherTables.map((table) => ({
        label: table.alias || table.name,
        value: table.id,
      })),
    [personOrOtherTables],
  );

  function handleEntitySelect(entity: FtmEntityV2) {
    form.setFieldValue('entityType', entity);
    form.setFieldValue('subEntity', 'moral');
    form.setFieldValue('belongsToTableId', '');
  }

  function handleSubEntitySelect(sub: string) {
    form.setFieldValue('subEntity', sub as FtmEntityPersonOption);
  }

  function isEntityDisabled(entity: FtmEntityV2): boolean {
    return requiresLink(entity) && !canSelectTypeThatNeedsAPerson;
  }

  return (
    <div className="flex flex-col gap-lg">
      {/* Name + Alias */}
      <div className="flex gap-md">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (value.length > 0 && !isValidDataModelName(value)) {
                return { message: t('data:create_table.name_regex_error') };
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-1 flex-col gap-sm">
              <label htmlFor={field.name}>{t('data:create_table.name_label')}</label>
              <Input
                id={field.name}
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                aria-invalid={field.state.meta.errors.length > 0 || hasNameError || undefined}
                borderColor={field.state.meta.errors.length === 0 && !hasNameError ? 'greyfigma-90' : 'redfigma-47'}
                placeholder={t('data:create_table.name_placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="alias">
          {(field) => (
            <div className="flex flex-1 flex-col gap-sm">
              <label htmlFor={field.name}>{t('data:create_table.alias_label')}</label>
              <Input
                id={field.name}
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                aria-invalid={field.state.meta.errors.length > 0 || undefined}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                placeholder={t('data:create_table.alias_placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>

      {/* Entity type selection */}
      <div className={cn('flex flex-col gap-md rounded-lg', hasEntityTypeError && 'border border-red-primary p-md')}>
        <span className="text-s font-medium">{t('data:create_table.choose_entity')}</span>
        <div className="flex flex-col gap-sm">
          {ftmEntities.map((entity) => {
            const isSelected = selectedEntityType === entity;
            const disabled = isEntityDisabled(entity);

            return (
              <div key={entity} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => !disabled && handleEntitySelect(entity)}
                  disabled={disabled}
                  className={cn(
                    'flex items-center gap-sm rounded-md px-md py-xs text-left text-s transition-colors',
                    isSelected && 'text-purple-primary font-medium',
                    !isSelected && !disabled && 'text-grey-primary hover:bg-grey-background',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      isSelected ? 'border-purple-primary' : 'border-grey-border',
                    )}
                  >
                    {isSelected ? <span className="size-2 rounded-full bg-purple-primary" /> : null}
                  </span>
                  <span>{t(`data:upload_data.ftm_entity.${entity}`)}</span>
                </button>

                {/* Disabled hint for transaction/event */}
                {disabled ? (
                  <span className="ms-3xl text-xs text-grey-secondary">
                    {t('data:create_table.entity_disabled_hint')}
                  </span>
                ) : null}

                {/* Sub-entity options */}
                {isSelected && entity === 'person' ? (
                  <SubEntityOptions
                    options={ftmEntityPersonOptions}
                    selected={selectedSubEntity}
                    onSelect={handleSubEntitySelect}
                    hasError={hasSubEntityError}
                  />
                ) : null}

                {/* Belongs-to link for transaction/event */}
                {isSelected && requiresLink(entity) ? (
                  <div className="ms-3xl mt-xs flex items-center gap-sm">
                    <span className="text-xs text-grey-secondary">{t('data:create_table.belongs_to')}</span>
                    <SelectV2
                      value={selectedBelongsToTableId}
                      placeholder={t('data:create_table.select_destination_table')}
                      onChange={(value) => form.setFieldValue('belongsToTableId', value)}
                      options={linkTargetOptions}
                      className={cn('w-60', hasBelongsToError && 'border-red-primary')}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SubEntityOptions({
  options,
  selected,
  onSelect,
  hasError,
}: {
  options: readonly FtmEntityPersonOption[];
  selected: string;
  onSelect: (value: FtmEntityPersonOption) => void;
  hasError?: boolean;
}) {
  const { t } = useTranslation(['data']);

  return (
    <div
      className={cn(
        'ms-3xl flex flex-col gap-xs rounded-md bg-grey-background-light p-sm',
        hasError && 'border border-red-primary',
      )}
    >
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'flex items-center gap-sm rounded px-xs py-2xs text-left text-s transition-colors',
              isSelected && 'text-purple-primary font-medium',
              !isSelected && 'text-grey-primary hover:bg-grey-border',
            )}
          >
            <span
              className={cn(
                'flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isSelected ? 'border-purple-primary' : 'border-grey-border',
              )}
            >
              {isSelected ? <span className="size-1.5 rounded-full bg-purple-primary" /> : null}
            </span>
            <span>{t(`data:upload_data.ftm_entity_person.${option}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
