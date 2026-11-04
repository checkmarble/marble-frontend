import type { TracfinValue } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { SourceLine } from '../fields/OriginBadge';

/**
 * Where a candidate comes from: its kind (customer base, decision, settings, calculated), then for
 * each source the table, record id, field, path steps and decision, and the mapping version.
 */
export function CandidateOrigin({ candidate }: { candidate: TracfinValue }) {
  const { t } = useTranslation(['tracfin']);
  const origin = candidate.origin;
  if (!origin) return <span className="text-grey-secondary text-xs">{t('tracfin:draft.origin.no_sources')}</span>;
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <Tag size="xs" color="blue" className="self-start">
        {t(`tracfin:draft.origin.${origin.source}`)}
      </Tag>
      <ul className="flex flex-col gap-xs" aria-label={t('tracfin:draft.origin.sources')}>
        {(origin.sources ?? []).map((source, index) => (
          <SourceLine key={index} source={source} />
        ))}
      </ul>
      {origin.mapping_version ? (
        <span className="text-xs">
          <span className="text-grey-secondary">{t('tracfin:draft.prefill.mapping_version')} : </span>
          <span className="font-mono">{origin.mapping_version.slice(0, 12)}</span>
        </span>
      ) : null}
    </div>
  );
}
