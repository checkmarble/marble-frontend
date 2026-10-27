import type { TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { describeConfigurationErrorCode } from './configuration-error-text';

type MappingRowProps = {
  mapping: TracfinMapping;
  catalogIndex: TracfinCatalogIndex;
  selected: boolean;
  errorCodes: string[];
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

/** « users › accounts › cards · number »: where the value is read. */
function useSourceSummary(mapping: TracfinMapping): string {
  const { t } = useTranslation(['tracfin']);
  const { source } = mapping;
  if (source.kind === 'ingested') {
    const chain = [source.table, ...(source.path ?? []).map((step) => step.table)].filter(Boolean).join(' › ');
    return [t(`tracfin:settings.mapping.entity.${source.entity_type ?? 'Person'}`), chain, source.field]
      .filter(Boolean)
      .join(' · ');
  }
  if (source.kind === 'decision_snapshot') {
    return [t('tracfin:settings.mapping.kind.decision_snapshot'), source.historical_type, source.field]
      .filter(Boolean)
      .join(' · ');
  }
  return [t('tracfin:settings.mapping.kind.settings'), source.field].filter(Boolean).join(' · ');
}

export function MappingRow({
  mapping,
  catalogIndex,
  selected,
  errorCodes,
  onSelect,
  onDuplicate,
  onRemove,
}: MappingRowProps) {
  const { t } = useTranslation(['tracfin']);
  const summary = useSourceSummary(mapping);
  const target = catalogIndex.field(mapping.target_field);
  const targetName = target?.name ?? mapping.target_field;
  const codeCount = mapping.codes?.length ?? 0;

  return (
    <div
      role="group"
      aria-label={t('tracfin:settings.mapping.row_aria', { target: targetName, id: mapping.id })}
      className={cn(
        'flex flex-col gap-xs rounded-md border p-sm',
        selected ? 'border-purple-primary bg-purple-background-light' : 'border-grey-border bg-surface-card',
      )}
    >
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col items-start gap-2xs text-start"
          aria-expanded={selected}
          onClick={onSelect}
        >
          <span className="text-s font-semibold">{targetName}</span>
          <span className="text-grey-secondary w-full truncate font-mono text-xs">{mapping.target_field}</span>
          <span className="text-s w-full truncate">{summary || t('tracfin:settings.mapping.source_incomplete')}</span>
        </button>
        <div className="flex shrink-0 items-center gap-xs">
          {codeCount > 0 ? (
            <Tag size="small" color="grey">
              {t('tracfin:settings.mapping.codes_count', { count: codeCount })}
            </Tag>
          ) : null}
          {mapping.source.kind === 'settings' ? (
            <Tag size="small" color="grey">
              {t('tracfin:settings.mapping.read_only_source')}
            </Tag>
          ) : null}
          <Button
            variant="secondary"
            appearance="link"
            mode="icon"
            aria-label={t('tracfin:settings.mapping.duplicate_aria', { target: targetName, id: mapping.id })}
            onClick={onDuplicate}
          >
            <Icon icon="copy" className="size-4" />
          </Button>
          <Button
            variant="secondary"
            appearance="link"
            mode="icon"
            aria-label={t('tracfin:settings.mapping.remove_aria', { target: targetName, id: mapping.id })}
            onClick={onRemove}
          >
            <Icon icon="delete" className="size-4" />
          </Button>
        </div>
      </div>
      {errorCodes.length > 0 ? (
        <ul
          className="text-red-primary text-xs"
          aria-label={t('tracfin:settings.errors.of_mapping', { target: targetName })}
        >
          {errorCodes.map((code) => (
            <li key={code}>{describeConfigurationErrorCode(t, code)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
