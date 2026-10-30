import type { TracfinValue } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { blockLabel } from '../fields/labels';
import { blockAddress } from '../model/block-address';
import { usePersonNameOf } from '../persons/usePersonNames';

/** The declared object a reference candidate points to, by name (a person) or by block and short id. */
function ReferencedName({ blockId }: { blockId: string }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const personName = usePersonNameOf()(blockId);
  if (personName) return <>{personName}</>;
  const block = editor.blockAt(blockAddress(blockId));
  const catalogField = block ? editor.catalogIndex.field(block.catalog_id) : undefined;
  return (
    <>
      {catalogField ? `${blockLabel(t, catalogField)} · ` : ''}
      {blockId.slice(0, 8)}
    </>
  );
}

/**
 * What a candidate would put in the field, as the analyst reads it: the code with its label, a
 * yes / no, the exact decimal string, or the name of the declared object a reference designates.
 */
export function CandidateValue({ candidate, fieldId }: { candidate: TracfinValue; fieldId: string }) {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();

  switch (candidate.kind) {
    case 'boolean':
      return <>{candidate.boolean ? t('tracfin:draft.boolean.true') : t('tracfin:draft.boolean.false')}</>;
    case 'decimal':
      return <span className="font-mono">{candidate.decimal}</span>;
    case 'reference':
      return candidate.reference ? (
        <span>
          <ReferencedName blockId={candidate.reference.block_id} />
          {candidate.reference.person_block_id ? (
            <>
              {' · '}
              <ReferencedName blockId={candidate.reference.person_block_id} />
            </>
          ) : null}
        </span>
      ) : null;
    case 'cleared':
      return <>{t('tracfin:draft.value.cleared')}</>;
    case 'text': {
      const codes = catalogIndex.codesFor(fieldId);
      const label = Array.isArray(codes) ? codes.find((code) => code.value === candidate.text)?.label : undefined;
      return (
        <span>
          {candidate.text}
          {label ? <span className="text-grey-secondary"> — {label}</span> : null}
        </span>
      );
    }
  }
}
