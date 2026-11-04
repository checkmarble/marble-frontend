import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { FieldEditor } from '../fields/FieldEditor';
import { fieldLabel } from '../fields/labels';
import { blockAddress } from '../model/block-address';
import { CandidateOrigin } from './CandidateOrigin';
import { CandidateValue } from './CandidateValue';
import type { PlacedProposal } from './prefill-model';
import { useTracfinPrefill } from './TracfinPrefillContext';

/**
 * Two sources disagree: the candidates are side by side with their origins, the analyst picks one
 * (it is applied as that candidate, nothing else) or types another value in the generic editor.
 * A manual entry is a plain `set_field`, which also stops the field from being proposed again.
 */
export function ConflictCard({ placed, blockId }: { placed: PlacedProposal; blockId: string }) {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  const prefill = useTracfinPrefill();
  const [manual, setManual] = useState(false);
  const { proposal, fieldId } = placed;
  const field = catalogIndex.field(fieldId);
  const label = field ? fieldLabel(t, field) : fieldId;
  const disabled = prefill.stale || prefill.status !== 'idle';
  const parentValueId = proposal.candidates[0]?.parent_value_id ?? null;

  return (
    <li>
      <section
        aria-label={t('tracfin:draft.prefill.conflict_of', { field: label })}
        className="border-orange-border flex min-w-0 flex-col gap-sm rounded-md border p-sm"
      >
        <p className="text-s font-medium">{label}</p>
        <ul className="grid min-w-0 gap-sm md:grid-cols-2">
          {proposal.candidates.map((candidate, index) => (
            <li key={candidate.id} className="border-grey-border flex min-w-0 flex-col gap-xs rounded-md border p-sm">
              <p className="text-s font-medium break-words">
                <CandidateValue candidate={candidate} fieldId={fieldId} />
              </p>
              <CandidateOrigin candidate={candidate} />
              <Button
                variant="primary"
                size="small"
                className="self-start"
                disabled={disabled}
                aria-label={t('tracfin:draft.prefill.choose_candidate_aria', { field: label, number: index + 1 })}
                onClick={() => void prefill.apply([{ proposalId: proposal.id, candidateId: candidate.id }])}
              >
                {t('tracfin:draft.prefill.choose_candidate')}
              </Button>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          className="self-start"
          aria-expanded={manual}
          onClick={() => setManual((previous) => !previous)}
        >
          {t('tracfin:draft.prefill.enter_other')}
        </Button>
        {manual && field ? (
          <div className="border-grey-border flex flex-col gap-xs rounded-md border p-sm">
            <p className="text-grey-secondary text-xs">{t('tracfin:draft.prefill.enter_other_note')}</p>
            <FieldEditor
              address={blockAddress(blockId)}
              field={field}
              parentValueId={parentValueId}
              showDiagnostics={false}
            />
          </div>
        ) : null}
      </section>
    </li>
  );
}
