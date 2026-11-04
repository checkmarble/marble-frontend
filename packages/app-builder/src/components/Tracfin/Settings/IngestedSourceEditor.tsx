import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinMapping } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import {
  listRootTables,
  removePathFrom,
  setEntityType,
  setRootTable,
  setSourceField,
  type TracfinEntityType,
} from './mapping-edits';
import { OptionPicker } from './OptionPicker';
import { PathEditor } from './PathEditor';
import { getPathEndTable, type TracfinPathHop } from './path-hops';

type IngestedSourceEditorProps = {
  mapping: TracfinMapping;
  dataModel: DataModel;
  onChange: (mapping: TracfinMapping) => void;
  onChooseHop: (index: number, hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>) => void;
};

const ENTITY_TYPES: TracfinEntityType[] = ['Person', 'Company'];

/**
 * An ingested source: a root table of the chosen entity type (partners are never roots), the jumps to
 * the table that holds the value, and the field of that table.
 */
export function IngestedSourceEditor({ mapping, dataModel, onChange, onChooseHop }: IngestedSourceEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const { source } = mapping;
  const entityType = source.entity_type ?? 'Person';
  const rootTables = listRootTables(dataModel, entityType);
  const rootTable = source.table ?? '';
  const path = source.path ?? [];
  const endTable = getPathEndTable(rootTable, path);
  const endTableModel = dataModel.find((table) => table.name === endTable);
  const fieldNames = endTableModel?.fields.map((field) => field.name) ?? [];

  return (
    <div className="flex flex-col gap-md">
      <div className="grid gap-sm md:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <span className="text-s">{t('tracfin:settings.mapping.entity_type')}</span>
          <OptionPicker
            value={entityType}
            options={ENTITY_TYPES.map((type) => ({ value: type, label: t(`tracfin:settings.mapping.entity.${type}`) }))}
            onChange={(type) => onChange(setEntityType(mapping, type === 'Company' ? 'Company' : 'Person', dataModel))}
            ariaLabel={t('tracfin:settings.mapping.entity_type')}
            placeholder={t('tracfin:settings.mapping.entity_type')}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <span className="text-s">{t('tracfin:settings.mapping.root_table')}</span>
          <OptionPicker
            value={rootTable || undefined}
            options={rootTables.map((name) => ({ value: name, label: name }))}
            onChange={(table) => onChange(setRootTable(mapping, table))}
            ariaLabel={t('tracfin:settings.mapping.root_table')}
            placeholder={t('tracfin:settings.mapping.root_table_placeholder')}
            searchPlaceholder={t('tracfin:settings.mapping.search_table')}
            emptyLabel={t('tracfin:settings.mapping.no_root_table')}
            hasError={rootTable !== '' && !rootTables.includes(rootTable)}
          />
          {rootTable !== '' && !rootTables.includes(rootTable) ? (
            <p className="text-red-primary text-xs">
              {t('tracfin:settings.mapping.root_table_invalid', {
                table: rootTable,
                entity: t(`tracfin:settings.mapping.entity.${entityType}`),
              })}
            </p>
          ) : null}
        </div>
      </div>

      {rootTable !== '' ? (
        <>
          <PathEditor
            dataModel={dataModel}
            rootTable={rootTable}
            path={path}
            onChooseHop={onChooseHop}
            onRemoveFrom={(index) => onChange(removePathFrom(mapping, index))}
          />
          <div className="flex flex-col gap-xs">
            <span className="flex items-center gap-xs text-s">
              {t('tracfin:settings.mapping.source_field')}
              <Tag size="xs" color="grey">
                {endTable}
              </Tag>
            </span>
            <OptionPicker
              value={source.field || undefined}
              options={fieldNames.map((name) => ({ value: name, label: name }))}
              onChange={(field) => onChange(setSourceField(mapping, field))}
              ariaLabel={t('tracfin:settings.mapping.source_field')}
              placeholder={t('tracfin:settings.mapping.source_field_placeholder')}
              searchPlaceholder={t('tracfin:settings.mapping.search_field')}
              emptyLabel={t('tracfin:settings.mapping.no_field')}
              hasError={
                Boolean(source.field) && endTableModel !== undefined && !fieldNames.includes(source.field ?? '')
              }
              className="max-w-sm"
            />
            {endTableModel === undefined ? (
              <p className="text-red-primary text-xs">
                {t('tracfin:settings.mapping.table_missing', { table: endTable })}
              </p>
            ) : source.field && !fieldNames.includes(source.field) ? (
              <p className="text-red-primary text-xs">
                {t('tracfin:settings.mapping.field_missing', { field: source.field, table: endTable })}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
