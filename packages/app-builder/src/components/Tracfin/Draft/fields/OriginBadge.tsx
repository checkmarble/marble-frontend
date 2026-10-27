import type { TracfinOrigin, TracfinSourceRef } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Tag, type TagProps, Tooltip } from 'ui-design-system';
import type { FieldOccurrence } from '../model/field-values';

type OriginKind = 'settings' | 'ingested' | 'decision_snapshot' | 'manual' | 'calculated' | 'cleared';

const COLORS: Record<OriginKind, TagProps['color']> = {
  settings: 'purple',
  ingested: 'blue',
  decision_snapshot: 'blue',
  manual: 'grey',
  calculated: 'green',
  cleared: 'grey',
};

/** What the badge says: an unsaved edit is a manual entry, an emptied value is « effacé ». */
export function originKindOf(occurrence: FieldOccurrence): OriginKind | null {
  if (occurrence.state.kind === 'cleared') return 'cleared';
  if (occurrence.pending && occurrence.pending.op.type === 'set') return 'manual';
  if (occurrence.server?.kind === 'cleared' || occurrence.server?.origin?.resolution === 'cleared') return 'cleared';
  return occurrence.origin?.source ?? null;
}

function SourceLine({ source }: { source: TracfinSourceRef }) {
  const { t } = useTranslation(['tracfin']);
  const parts: [string, string | undefined][] = [
    [t('tracfin:draft.origin.source.kind'), source.kind],
    [t('tracfin:draft.origin.source.table'), source.table],
    [t('tracfin:draft.origin.source.record'), source.record_id],
    [t('tracfin:draft.origin.source.field'), source.field],
    [t('tracfin:draft.origin.source.decision'), source.decision_id],
    [t('tracfin:draft.origin.source.historical_type'), source.historical_type],
    [t('tracfin:draft.origin.source.path'), source.path?.map((step) => step.table).join(' → ')],
  ];
  return (
    <li className="flex flex-col gap-0.5">
      {parts
        .filter(([, value]) => value)
        .map(([name, value]) => (
          <span key={name} className="text-xs">
            <span className="text-grey-secondary">{name} : </span>
            <span className="font-mono">{value}</span>
          </span>
        ))}
    </li>
  );
}

function OriginTooltip({ origin }: { origin: TracfinOrigin | null }) {
  const { t } = useTranslation(['tracfin']);
  const sources = origin?.sources ?? [];
  if (sources.length === 0) return <span className="text-xs">{t('tracfin:draft.origin.no_sources')}</span>;
  return (
    <ul className="flex flex-col gap-xs" aria-label={t('tracfin:draft.origin.sources')}>
      {sources.map((source, index) => (
        <SourceLine key={index} source={source} />
      ))}
    </ul>
  );
}

/** Where a value comes from (settings, customer data, decision, manual entry, calculated, cleared), with its sources on hover. */
export function OriginBadge({ occurrence }: { occurrence: FieldOccurrence }) {
  const { t } = useTranslation(['tracfin']);
  const kind = originKindOf(occurrence);
  if (!kind) return null;
  return (
    <Tooltip.Default content={<OriginTooltip origin={occurrence.pending ? null : occurrence.origin} />}>
      <span tabIndex={0} className="inline-flex">
        <Tag size="xs" color={COLORS[kind]}>
          {t(`tracfin:draft.origin.${kind}`)}
        </Tag>
      </span>
    </Tooltip.Default>
  );
}
