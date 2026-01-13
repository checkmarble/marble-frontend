import { Callout } from '@app-builder/components/Callout';
import { TableModel } from '@app-builder/models/data-model';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { computed } from '@preact/signals-react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { FtmEntity } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  ContinuousScreeningCreationStepper,
  PartialCreateContinuousScreeningConfig,
} from '../../context/CreationStepper';
import { Field } from '../../shared/Field';

const propertyPerEntity: Record<FtmEntity, string[]> = {
  Company: ['name', 'address', 'phone', 'email'],
  Person: ['name', 'address', 'phone', 'email'],
  Vessel: ['name', 'address', 'phone', 'email'],
};

type PartialCreateMappingConfig = PartialCreateContinuousScreeningConfig['mappingConfigs'][number];

const newMappingConfigFromTable = (table: TableModel): PartialCreateMappingConfig => {
  const fieldMappingEntries: [string, string | null][] = table.fields.map((field) => {
    return [field.id, field.ftmProperty ?? null];
  });

  return {
    objectType: table.name,
    ftmEntity: table.ftmEntity ?? null,
    fieldMapping: Object.fromEntries(fieldMappingEntries),
  };
};

export const ObjectMapping = () => {
  const { t } = useTranslation(['continuousScreening']);
  const dataModelQuery = useDataModelQuery();
  const mappingConfigs = ContinuousScreeningCreationStepper.select((state) => state.data.$mappingConfigs);
  const [isEditingNewObject, setIsEditingNewObject] = useState(mappingConfigs.value.length === 0);

  const availableTables = computed(() => {
    if (!dataModelQuery.isSuccess) return [];
    const dataModel = dataModelQuery.data.dataModel;
    return dataModel.filter(
      (table) => !mappingConfigs.value.some((mappingConfig) => mappingConfig.objectType === table.name),
    );
  });

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-surface-card">
        {t('continuousScreening:creation.objectMapping.callout')}
      </Callout>
      {mappingConfigs.value.map((mappingConfig, index) => (
        <ObjectMappingConfigurator
          key={index}
          availableTables={availableTables.value}
          mappingConfig={mappingConfig}
          onUpdate={(updatedMappingConfig) => {
            mappingConfigs.value[index] = updatedMappingConfig;
          }}
        />
      ))}
      {isEditingNewObject ? (
        <ObjectMappingConfigurator
          availableTables={availableTables.value}
          mappingConfig={null}
          onUpdate={(mappingConfig) => {
            mappingConfigs.value.push(mappingConfig);
            setIsEditingNewObject(false);
          }}
        />
      ) : null}
      <div>
        <ButtonV2
          variant="primary"
          appearance="stroked"
          disabled={isEditingNewObject || mappingConfigs.value.length === 0}
          onClick={() => setIsEditingNewObject(true)}
        >
          <Icon icon="plus" className="size-4" />
          {t('continuousScreening:creation.objectMapping.addTable')}
        </ButtonV2>
      </div>
    </div>
  );
};

const ObjectMappingConfigurator = ({
  availableTables,
  mappingConfig,
  onUpdate,
}: {
  availableTables: TableModel[];
  mappingConfig: PartialCreateMappingConfig | null;
  onUpdate: (mappingConfig: PartialCreateMappingConfig) => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const dataModelQuery = useDataModelQuery();
  const [isTableOpen, setIsTableOpen] = useState(false);

  if (!dataModelQuery.isSuccess) return null;

  return (
    <Collapsible.Root
      defaultOpen={true}
      className="bg-surface-card rounded-v2-lg border border-grey-border p-v2-md flex flex-col gap-v2-sm"
    >
      <Collapsible.Trigger asChild>
        <div className="flex items-center gap-v2-md">
          <Icon
            icon="caret-down"
            className="size-6 group-radix-state-open:rotate-180 transition-transform duration-200"
          />
          <span className="text-h2 font-semibold">
            {mappingConfig?.objectType ??
              t('continuousScreening:creation.objectMapping.configurator.title_placeholder')}
          </span>
          {mappingConfig?.ftmEntity ? (
            <span className="text-s text-grey-secondary">{mappingConfig.ftmEntity}</span>
          ) : null}
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col gap-v2-sm mt-v2-sm radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        <MenuCommand.Menu open={isTableOpen} onOpenChange={setIsTableOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="w-full shrink-0">
              {mappingConfig?.objectType ??
                t('continuousScreening:creation.objectMapping.configurator.tableName.placeholder')}
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content side="bottom" align="start" sideOffset={4} sameWidth>
            <MenuCommand.List>
              {availableTables.map((table) => (
                <MenuCommand.Item
                  key={table.id}
                  value={table.id}
                  onSelect={() => {
                    onUpdate(newMappingConfigFromTable(table));
                  }}
                >
                  {table.name}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
        {mappingConfig ? <ObjectMappingFtmContent mappingConfig={mappingConfig} onUpdate={onUpdate} /> : null}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const ObjectMappingFtmContent = ({
  mappingConfig,
  onUpdate,
}: {
  mappingConfig: PartialCreateMappingConfig;
  onUpdate: (mappingConfig: PartialCreateMappingConfig) => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const dataModelQuery = useDataModelQuery();
  const table = dataModelQuery.data?.dataModel.find((table) => table.name === mappingConfig.objectType);
  if (!table) return null;

  const ftmEntity = table.ftmEntity ?? mappingConfig.ftmEntity;
  const availableProperties = ftmEntity ? propertyPerEntity[ftmEntity] : [];

  return (
    <>
      <FTMEntitySelector
        ftmEntity={ftmEntity}
        availableEntities={['Person', 'Company', 'Vessel']}
        disabled={table.ftmEntity !== undefined}
        onChange={(ftmEntity) => {
          onUpdate({
            ...mappingConfig,
            ftmEntity,
          });
        }}
      />
      {ftmEntity ? (
        <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-lg bg-surface-card">
          <div className="flex items-center justify-between p-v2-md border-b border-grey-border">
            <div className="text-h3 font-semibold">
              {t('continuousScreening:creation.objectMapping.configurator.fieldMapping.title')}
            </div>
          </div>
          <div className="grid grid-cols-[auto_40px_1fr] gap-v2-sm p-v2-md">
            {table.fields.map((field) => {
              const ftmProperty = field.ftmProperty ?? mappingConfig.fieldMapping[field.id] ?? null;
              const hasSavedMapping = field.ftmProperty !== undefined;

              return (
                <div key={field.id} className="grid grid-cols-subgrid col-span-full items-center">
                  <div className="flex items-center px-v2-sm h-10">
                    {mappingConfig.objectType}.{field.name}
                  </div>
                  <div className={cn('p-v2-sm', { 'opacity-50': hasSavedMapping })}>
                    <Icon icon="arrow-forward" className="size-6 text-purple-primary" />
                  </div>
                  <FtmFieldSelector
                    disabled={hasSavedMapping}
                    ftmEntity={ftmEntity}
                    ftmProperty={ftmProperty}
                    availableProperties={availableProperties}
                    onChange={(ftmProperty) => {
                      onUpdate({
                        ...mappingConfig,
                        fieldMapping: { ...mappingConfig.fieldMapping, [field.id]: ftmProperty },
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
};

const FTMEntitySelector = ({
  ftmEntity,
  availableEntities,
  disabled,
  onChange,
}: {
  ftmEntity: FtmEntity | null;
  availableEntities: FtmEntity[];
  disabled: boolean;
  onChange: (ftmObject: FtmEntity) => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const [isOpen, setOpen] = useState(false);

  return (
    <Field
      title={t('continuousScreening:creation.objectMapping.configurator.ftmEntity.title')}
      description={t('continuousScreening:creation.objectMapping.configurator.ftmEntity.subtitle')}
      titleClassName="text-default"
    >
      <MenuCommand.Menu open={isOpen} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton disabled={disabled} className="w-full">
            {ftmEntity ?? t('continuousScreening:creation.objectMapping.configurator.ftmEntity.placeholder')}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content side="bottom" align="start" sideOffset={4} sameWidth>
          <MenuCommand.List>
            {availableEntities.map((schema) => (
              <MenuCommand.Item key={schema} value={schema} onSelect={() => onChange(schema)}>
                {schema}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </Field>
  );
};

const FtmFieldSelector = ({
  ftmEntity,
  ftmProperty,
  availableProperties,
  disabled,
  onChange,
}: {
  ftmEntity: string;
  ftmProperty: string | null;
  availableProperties: string[];
  disabled: boolean;
  onChange: (ftmProperty: string | null) => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MenuCommand.Menu open={isOpen} onOpenChange={setIsOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton disabled={disabled}>
          {ftmProperty
            ? `${ftmEntity}.${ftmProperty}`
            : t('continuousScreening:creation.objectMapping.configurator.fieldMapping.placeholder')}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content side="bottom" align="start" sideOffset={4} sameWidth>
        <MenuCommand.List>
          <MenuCommand.Item key="none" onSelect={() => onChange(null)}>
            {t('continuousScreening:creation.objectMapping.configurator.fieldMapping.none')}
          </MenuCommand.Item>
          {availableProperties.map((availableProperty) => (
            <MenuCommand.Item key={availableProperty} onSelect={() => onChange(availableProperty)}>
              {ftmEntity}.{availableProperty}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
