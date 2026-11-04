import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex, TracfinCodeOption } from '@app-builder/models/tracfin/catalog-index';
import { useTranslation } from 'react-i18next';
import { AmountEditor } from './AmountEditor';
import { CodesTable } from './CodesTable';
import { DiscriminatorEditor } from './DiscriminatorEditor';
import { IngestedSourceEditor } from './IngestedSourceEditor';
import { setSourceKind, setTargetField } from './mapping-edits';
import { listMappingTargetFields } from './mapping-targets';
import { OptionPicker } from './OptionPicker';
import { getPathEndTable, type TracfinPathHop } from './path-hops';
import { SnapshotSourceEditor } from './SnapshotSourceEditor';

const CURRENCY_CATALOG = 'devises.csv';

type MappingEditorProps = {
  mapping: TracfinMapping;
  catalogIndex: TracfinCatalogIndex;
  dataModel: DataModel;
  onChange: (mapping: TracfinMapping) => void;
  onChooseHop: (index: number, hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>) => void;
};

/** Everything that can be configured for one mapping; the server decides whether it is valid. */
export function MappingEditor({ mapping, catalogIndex, dataModel, onChange, onChooseHop }: MappingEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const targetField = catalogIndex.field(mapping.target_field);
  const codes = catalogIndex.codesFor(mapping.target_field);
  const { source } = mapping;

  const targetOptions = listMappingTargetFields(catalogIndex).map((field) => ({
    value: field.id,
    label: field.name,
    hint: field.id,
  }));

  // `settings` is not offered for a new mapping, but an existing one keeps it.
  const sourceKinds: TracfinMapping['source']['kind'][] =
    source.kind === 'settings' ? ['ingested', 'decision_snapshot', 'settings'] : ['ingested', 'decision_snapshot'];

  const endTable = dataModel.find((table) => table.name === getPathEndTable(source.table ?? '', source.path ?? []));
  const ingestedFieldNames = source.kind === 'ingested' ? (endTable?.fields.map((field) => field.name) ?? []) : [];
  const currencies: readonly TracfinCodeOption[] | null = Object.hasOwn(catalogIndex.profile.codes, CURRENCY_CATALOG)
    ? (catalogIndex.profile.codes[CURRENCY_CATALOG] ?? null)
    : null;

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <span className="text-s font-medium">{t('tracfin:settings.mapping.target_field')}</span>
        <OptionPicker
          value={mapping.target_field}
          options={targetOptions}
          onChange={(field) => onChange(setTargetField(mapping, field, catalogIndex))}
          ariaLabel={t('tracfin:settings.mapping.target_field')}
          placeholder={t('tracfin:settings.mapping.target_field_placeholder')}
          searchPlaceholder={t('tracfin:settings.mapping.search_target')}
          emptyLabel={t('tracfin:settings.mapping.no_target')}
          hasError={targetField === undefined}
        />
        {targetField === undefined ? (
          <p className="text-red-primary text-xs">{t('tracfin:settings.mapping.target_unknown')}</p>
        ) : (
          <p className="text-grey-secondary font-mono text-xs">{targetField.id}</p>
        )}
      </div>

      <div className="flex flex-col gap-xs">
        <span className="text-s font-medium">{t('tracfin:settings.mapping.source_kind')}</span>
        <OptionPicker
          value={source.kind}
          options={sourceKinds.map((kind) => ({ value: kind, label: t(`tracfin:settings.mapping.kind.${kind}`) }))}
          onChange={(kind) =>
            onChange(
              setSourceKind(
                mapping,
                kind === 'decision_snapshot' ? 'decision_snapshot' : kind === 'settings' ? 'settings' : 'ingested',
              ),
            )
          }
          ariaLabel={t('tracfin:settings.mapping.source_kind')}
          placeholder={t('tracfin:settings.mapping.source_kind')}
          className="max-w-sm"
        />
      </div>

      {source.kind === 'ingested' ? (
        <IngestedSourceEditor mapping={mapping} dataModel={dataModel} onChange={onChange} onChooseHop={onChooseHop} />
      ) : null}
      {source.kind === 'decision_snapshot' ? (
        <SnapshotSourceEditor mapping={mapping} dataModel={dataModel} onChange={onChange} />
      ) : null}
      {source.kind === 'settings' ? (
        <p className="text-s text-grey-secondary">
          {t('tracfin:settings.mapping.settings_source', { field: source.field ?? '' })}
        </p>
      ) : null}

      {codes !== null ? <CodesTable mapping={mapping} codes={codes} onChange={onChange} /> : null}

      {targetField?.value_kind === 'decimal' ? (
        <AmountEditor
          mapping={mapping}
          targetField={targetField}
          currencies={currencies}
          sourceFieldNames={source.kind === 'ingested' ? ingestedFieldNames : null}
          onChange={onChange}
        />
      ) : null}

      <DiscriminatorEditor mapping={mapping} fieldSuggestions={ingestedFieldNames} onChange={onChange} />
    </div>
  );
}
