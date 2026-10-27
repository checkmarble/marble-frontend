import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { blockAddress } from '../model/block-address';
import { blockLabel } from './labels';
import { TextControl } from './TextControl';
import type { TracfinFieldControlProps } from './types';

/** The block a reference points to, named by its catalog block and a short id. */
function ReferenceName({ blockId }: { blockId: string }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const block = editor.blockAt(blockAddress(blockId));
  const catalogField = block ? editor.catalogIndex.field(block.catalog_id) : undefined;
  return (
    <span className="font-mono text-xs">
      {catalogField ? `${blockLabel(t, catalogField)} · ` : ''}
      {blockId.slice(0, 8)}
    </span>
  );
}

/**
 * Default renderer of a reference: shows what is referenced and where it is defined. The Persons and
 * Operations sections replace it (by field id in the renderer registry) with a picker.
 */
export function ReferenceControl({ occurrence }: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const { state } = occurrence;

  return (
    <div className="flex min-w-0 flex-col gap-2xs">
      {state.kind === 'reference' ? (
        <div className="flex flex-wrap items-center gap-xs">
          <Tag size="small" color="grey">
            <ReferenceName blockId={state.reference.block_id} />
          </Tag>
          {state.reference.person_block_id ? <ReferenceName blockId={state.reference.person_block_id} /> : null}
        </div>
      ) : (
        <span className="text-s text-grey-placeholder">{t('tracfin:draft.reference.none')}</span>
      )}
      <span className="text-grey-secondary text-xs">
        {t('tracfin:draft.reference.defined_in', { section: t('tracfin:draft.sections.persons') })}
      </span>
    </div>
  );
}

/** `text_or_reference`: free text, unless the value already is a reference (then it is shown as one). */
export function TextOrReferenceControl(props: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  if (props.occurrence.state.kind === 'reference') return <ReferenceControl {...props} />;
  return (
    <div className="flex min-w-0 flex-col gap-2xs">
      <TextControl {...props} />
      <span className="text-grey-secondary text-xs">
        {t('tracfin:draft.reference.text_or_reference_hint', { section: t('tracfin:draft.sections.persons') })}
      </span>
    </div>
  );
}
