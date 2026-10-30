import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { blockLabel } from '../fields/labels';
import { personDisplayName } from '../persons/display-name';
import { personContaining } from '../persons/document';
import { CleanProposalRow } from './CleanProposalRow';
import { ConflictCard } from './ConflictCard';
import { DiagnosticNotice } from './DiagnosticNotice';
import { diagnosticFixOf } from './diagnostic-codes';
import type { BlockGroup } from './prefill-model';
import { useTracfinPrefill } from './TracfinPrefillContext';

/** The display name of a block: its catalog title, behind the name of the declared person it belongs to. */
function useBlockTitle(group: BlockGroup): string {
  const { t } = useTranslation(['tracfin']);
  const { draft, catalogIndex } = useTracfinDraftEditorContext();
  const catalogField = catalogIndex.field(group.catalogId);
  const label = catalogField ? blockLabel(t, catalogField) : group.catalogId;
  const holder = personContaining(draft.document.root, group.blockId);
  if (!holder) return label;
  const name = personDisplayName(holder.block, holder.kind) ?? t('tracfin:draft.persons.unnamed');
  return holder.block.id === group.blockId ? name : `${name} — ${label}`;
}

/** One block of the panel: its proposals without conflict, its conflicts and its diagnostics. */
export function PrefillBlockCard({ group }: { group: BlockGroup }) {
  const { t } = useTranslation(['tracfin']);
  const prefill = useTracfinPrefill();
  const title = useBlockTitle(group);
  const stale = prefill.stale;

  return (
    <section
      aria-label={title}
      className="border-grey-border bg-grey-background flex min-w-0 flex-col gap-sm rounded-md border p-sm"
    >
      <h4 className="text-s font-semibold">{title}</h4>
      {group.clean.length > 0 ? (
        <ul className="flex flex-col gap-xs" aria-label={t('tracfin:draft.prefill.clean_list')}>
          {group.clean.map((placed) => (
            <CleanProposalRow key={placed.proposal.id} placed={placed} />
          ))}
        </ul>
      ) : null}
      {group.conflicts.length > 0 ? (
        <ul className="flex flex-col gap-sm" aria-label={t('tracfin:draft.prefill.conflict_list')}>
          {group.conflicts.map((placed) => (
            <ConflictCard key={placed.proposal.id} placed={placed} blockId={group.blockId} />
          ))}
        </ul>
      ) : null}
      {group.diagnostics.map((diagnostic, index) => (
        <DiagnosticNotice
          key={`${diagnostic.code}-${index}`}
          diagnostic={{ ...diagnostic, stale }}
          showField
          withFix={diagnosticFixOf(diagnostic.code) !== null}
        />
      ))}
    </section>
  );
}
