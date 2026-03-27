import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useDataModel } from '@app-builder/services/data/data-model';
import { getFieldErrors } from '@app-builder/utils/form';
import { useStore } from '@tanstack/react-form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, SelectV2 } from 'ui-design-system';
import { isValidDataModelName } from '../shared/dataModelNameValidation';
import {
  type FtmEntityV2,
  ftmEntities,
  ftmEntityPersonOptions,
  ftmEntityVehicleOptions,
} from '../UploadData/uploadData-types';
import { useCreateTableFormContext } from './CreateTableDrawer';
import { requiresLink } from './createTable-types';

export function CreateTableEntityStep() {
  const form = useCreateTableFormContext();
  const { t } = useTranslation(['data']);
  const dataModel = useDataModel();

  const selectedEntityType = useStore(form.store, (state) => state.values.entityType);
  const selectedSubEntity = useStore(form.store, (state) => state.values.subEntity);

  // Tables that qualify as "person" or "other" for the transaction/event link requirement
  const personOrOtherTables = useMemo(
    () =>
      dataModel.filter(
        (table) =>
          table.ftmEntity === 'Person' ||
          table.ftmEntity === 'Company' ||
          table.ftmEntity === 'Organization' ||
          !table.ftmEntity,
      ),
    [dataModel],
  );

  const canSelectTransactionOrEvent = personOrOtherTables.length > 0;

  const linkTargetOptions = useMemo(
    () =>
      personOrOtherTables.map((table) => ({
        label: table.description || table.name,
        value: table.id,
      })),
    [personOrOtherTables],
  );

  function handleEntitySelect(entity: FtmEntityV2) {
    form.setFieldValue('entityType', entity);
    form.setFieldValue('subEntity', '');
    form.setFieldValue('belongsToTableId', '');
  }

  function handleSubEntitySelect(sub: string) {
    form.setFieldValue('subEntity', sub);
  }

  function isEntityDisabled(entity: FtmEntityV2): boolean {
    return (entity === 'transaction' || entity === 'event') && !canSelectTransactionOrEvent;
  }

  return (
    <div className="flex flex-col gap-v2-lg">
      {/* Name + Alias */}
      <div className="flex gap-v2-md">
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
            <div className="flex flex-1 flex-col gap-2">
              <FormLabel name={field.name}>{t('data:create_table.name_label')}</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('data:create_table.name_placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="alias">
          {(field) => (
            <div className="flex flex-1 flex-col gap-2">
              <FormLabel name={field.name}>{t('data:create_table.alias_label')}</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('data:create_table.alias_placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>

      {/* Entity type selection */}
      <div className="flex flex-col gap-v2-md">
        <span className="text-s font-medium">{t('data:create_table.choose_entity')}</span>
        <div className="flex flex-col gap-v2-sm">
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
                    'flex items-center gap-v2-sm rounded-md px-3 py-2 text-left text-s transition-colors',
                    isSelected && 'text-purple-primary font-medium',
                    !isSelected && !disabled && 'text-grey-primary hover:bg-grey-bg',
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
                  <span className="ml-7 text-xs text-grey-secondary">
                    {t('data:create_table.entity_disabled_hint')}
                  </span>
                ) : null}

                {/* Sub-entity options */}
                {isSelected && entity === 'person' ? (
                  <SubEntityOptions
                    options={[...ftmEntityPersonOptions]}
                    selected={selectedSubEntity}
                    onSelect={handleSubEntitySelect}
                    labelPrefix="data:upload_data.ftm_entity_person"
                  />
                ) : null}
                {isSelected && entity === 'vehicle' ? (
                  <SubEntityOptions
                    options={[...ftmEntityVehicleOptions]}
                    selected={selectedSubEntity}
                    onSelect={handleSubEntitySelect}
                    labelPrefix="data:upload_data.ftm_entity_vehicle"
                  />
                ) : null}

                {/* Belongs-to link for transaction/event */}
                {isSelected && requiresLink(entity) ? (
                  <div className="ml-7 mt-1 flex items-center gap-v2-sm">
                    <span className="text-xs text-grey-secondary">{t('data:create_table.belongs_to')}</span>
                    <SelectV2
                      value={form.getFieldValue('belongsToTableId')}
                      placeholder={t('data:create_table.select_destination_table')}
                      onChange={(value) => form.setFieldValue('belongsToTableId', value)}
                      options={linkTargetOptions}
                      className="w-60"
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
  labelPrefix,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  labelPrefix: string;
}) {
  const { t } = useTranslation(['data']);

  return (
    <div className="ml-7 flex flex-col gap-v2-xs rounded-md bg-grey-bg p-2">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'flex items-center gap-v2-sm rounded px-2 py-1 text-left text-s transition-colors',
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
            <span>{t(`${labelPrefix}.${option}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
