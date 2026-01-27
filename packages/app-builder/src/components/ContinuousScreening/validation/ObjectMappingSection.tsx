import { CreateMappingConfig } from '@app-builder/models/continuous-screening';
import { TableModel } from '@app-builder/models/data-model';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Collapsible } from 'ui-design-system';
import { Spinner } from '../../Spinner';
import { type EditionValidationPanelProps } from '../EditionValidationPanel';

export const ObjectMappingSection = ({ updatedConfig, baseConfig }: EditionValidationPanelProps) => {
  const dataModelQuery = useDataModelQuery();
  const { t } = useTranslation(['common', 'continuousScreening']);
  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.objectMapping.title')}</Collapsible.Title>
      <Collapsible.Content>
        {match(dataModelQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center h-50">
              <Spinner className="size-10" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="flex flex-col gap-v2-md items-center justify-center h-50">
              <div className="">{t('common:generic_fetch_data_error')}</div>
              <ButtonV2 variant="secondary" onClick={() => dataModelQuery.refetch()}>
                {t('common:retry')}
              </ButtonV2>
            </div>
          ))
          .with({ isSuccess: true }, ({ data: { dataModel } }) => {
            const hasChanges = updatedConfig.mappingConfigs.some((mappingConfig) => {
              const table = dataModel.find((table) => table.name === mappingConfig.objectType);
              if (!table) return false;

              return (
                Object.entries(mappingConfig.fieldMapping)
                  .map(([fieldId, ftmProperty]) => {
                    const field = table.fields.find((field) => field.id === fieldId);
                    return { field, ftmProperty };
                  })
                  .filter(({ field, ftmProperty }) => {
                    return field && ftmProperty !== null && !field.ftmProperty;
                  }).length > 0
              );
            });

            if (!hasChanges) {
              return (
                <div className="flex flex-col gap-v2-sm">
                  <span>{t('continuousScreening:edition.validation.objectMapping.no_changes')}</span>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 gap-v2-md">
                {updatedConfig.mappingConfigs.map((mappingConfig) => {
                  const table = dataModel.find((table) => table.name === mappingConfig.objectType);
                  return table ? (
                    <TableValidation key={mappingConfig.objectType} table={table} objectMapping={mappingConfig} />
                  ) : null;
                })}
              </div>
            );
          })
          .exhaustive()}
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const TableValidation = ({ table, objectMapping }: { table: TableModel; objectMapping: CreateMappingConfig }) => {
  const { t } = useTranslation(['continuousScreening']);
  const isAddedTable = !table.ftmEntity;
  const fieldsAdded = Object.entries(objectMapping.fieldMapping)
    .map(([fieldId, ftmProperty]) => {
      const field = table.fields.find((field) => field.id === fieldId);
      return { field, ftmProperty };
    })
    .filter(({ field, ftmProperty }) => {
      return field && ftmProperty !== null && !field.ftmProperty;
    });

  if (fieldsAdded.length === 0) return null;

  return (
    <div className="flex flex-col gap-v2-sm">
      <span>
        {t(`continuousScreening:edition.validation.objectMapping.${isAddedTable ? 'table_added' : 'table_modified'}`, {
          tableName: table.name,
        })}
      </span>
      <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-md p-v2-md max-h-50 overflow-y-auto">
        {fieldsAdded.map(({ field, ftmProperty }) => {
          return (
            <span key={field?.id}>
              {field?.name} &gt; {ftmProperty}
            </span>
          );
        })}
      </div>
    </div>
  );
};
