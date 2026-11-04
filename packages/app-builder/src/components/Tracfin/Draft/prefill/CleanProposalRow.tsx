import { useTranslation } from 'react-i18next';
import { Checkbox, Tag, Tooltip } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { fieldLabel } from '../fields/labels';
import { CandidateOrigin } from './CandidateOrigin';
import { CandidateValue } from './CandidateValue';
import type { PlacedProposal } from './prefill-model';
import { useTracfinPrefill } from './TracfinPrefillContext';

/** A proposal without conflict: its value and origin, and a checkbox to leave it out of the batch. */
export function CleanProposalRow({ placed }: { placed: PlacedProposal }) {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  const prefill = useTracfinPrefill();
  const { proposal, fieldId } = placed;
  const candidate = proposal.candidates[0]!;
  const field = catalogIndex.field(fieldId);
  const label = field ? fieldLabel(t, field) : fieldId;
  const partial = proposal.resolution === 'partial' || candidate.needs_review === true;

  return (
    <li className="flex min-w-0 flex-wrap items-center gap-sm">
      <Checkbox
        size="small"
        aria-label={t('tracfin:draft.prefill.include', { field: label })}
        checked={!prefill.excluded.has(proposal.id)}
        disabled={prefill.stale || prefill.status !== 'idle'}
        onCheckedChange={() => prefill.toggleExcluded(proposal.id)}
      />
      <span className="text-s min-w-0 font-medium">{label}</span>
      <span className="text-s min-w-0 break-words">
        <CandidateValue candidate={candidate} fieldId={fieldId} />
      </span>
      <Tooltip.Default content={<CandidateOrigin candidate={candidate} />}>
        <span tabIndex={0} className="inline-flex" aria-label={t('tracfin:draft.prefill.origin_of', { field: label })}>
          <Tag size="xs" color="blue">
            {t(`tracfin:draft.origin.${candidate.origin?.source ?? 'manual'}`)}
          </Tag>
        </span>
      </Tooltip.Default>
      {partial ? (
        <Tag size="xs" color="orange">
          {t('tracfin:draft.prefill.partial_tag')}
        </Tag>
      ) : null}
    </li>
  );
}
