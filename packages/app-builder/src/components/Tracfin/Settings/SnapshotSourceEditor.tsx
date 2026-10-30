import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinMapping } from '@app-builder/models/tracfin';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Switch } from 'ui-design-system';
import { setHistoricalType, setSourceField, setUnitOperation, supportsUnitOperation } from './mapping-edits';

type SnapshotSourceEditorProps = {
  mapping: TracfinMapping;
  dataModel: DataModel;
  onChange: (mapping: TracfinMapping) => void;
};

/**
 * A decision snapshot: the historical type is free text, because a decision may have been taken on
 * an object type that no longer exists in the data model; the table names are only suggestions.
 */
export function SnapshotSourceEditor({ mapping, dataModel, onChange }: SnapshotSourceEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const listId = useId();
  const { source } = mapping;

  return (
    <div className="flex flex-col gap-sm">
      <div className="grid gap-sm md:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <span className="text-s">{t('tracfin:settings.mapping.historical_type')}</span>
          <Input
            size="medium"
            list={listId}
            value={source.historical_type ?? ''}
            aria-label={t('tracfin:settings.mapping.historical_type')}
            onChange={(event) => onChange(setHistoricalType(mapping, event.currentTarget.value))}
          />
          <datalist id={listId}>
            {dataModel.map((table) => (
              <option key={table.name} value={table.name} />
            ))}
          </datalist>
          <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.historical_type_help')}</p>
        </div>
        <div className="flex flex-col gap-xs">
          <span className="text-s">{t('tracfin:settings.mapping.snapshot_field')}</span>
          <Input
            size="medium"
            value={source.field ?? ''}
            aria-label={t('tracfin:settings.mapping.snapshot_field')}
            onChange={(event) => onChange(setSourceField(mapping, event.currentTarget.value))}
          />
        </div>
      </div>

      {supportsUnitOperation(mapping.target_field) ? (
        <div className="flex items-center gap-sm">
          <Switch
            id={`unit-operation-${mapping.id}`}
            checked={source.unit_operation === true}
            onCheckedChange={(checked) => onChange(setUnitOperation(mapping, checked))}
          />
          <label htmlFor={`unit-operation-${mapping.id}`} className="text-s">
            {t('tracfin:settings.mapping.unit_operation')}
          </label>
        </div>
      ) : null}
    </div>
  );
}
