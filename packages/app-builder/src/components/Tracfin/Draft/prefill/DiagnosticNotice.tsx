import type { TracfinDiagnostic } from '@app-builder/models/tracfin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import type { BlockDiagnostic } from '../fields/block-diagnostics';
import { FieldEditor } from '../fields/FieldEditor';
import { fieldLabel } from '../fields/labels';
import { blockAddress } from '../model/block-address';
import { useReviewDiagnosticText } from '../review/diagnostic-text';
import { diagnosticFixOf } from './diagnostic-codes';

/** Opens the field of a diagnostic in the generic editor: a manual `set_field` on this draft only. */
function FixField({ diagnostic }: { diagnostic: TracfinDiagnostic }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const { catalogIndex } = editor;
  const [open, setOpen] = useState(false);
  const fix = diagnosticFixOf(diagnostic.code);
  const field = diagnostic.field;
  const catalogField = field ? catalogIndex.field(field.field_id) : undefined;
  if (!fix || !field || !catalogField) return null;

  // An attribute of simple content belongs to ONE occurrence of its owner field: without exactly one
  // saved owner there is nothing to attach the manual value to, and none is sent.
  const owner = catalogIndex.field(catalogField.parent);
  const ownerOccurrences =
    owner?.kind === 'field'
      ? (editor.blockAt(blockAddress(field.block_id))?.fields?.[owner.id] ?? []).filter(
          (value) => value.kind !== 'cleared',
        )
      : null;
  const parentValueId = ownerOccurrences?.length === 1 ? ownerOccurrences[0]!.id : null;
  const ownerMissing = ownerOccurrences !== null && parentValueId === null;

  return (
    <div className="flex flex-col gap-xs">
      <Button
        variant="secondary"
        appearance="stroked"
        size="small"
        className="self-start"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        {t(
          fix === 'choose_code' ? 'tracfin:draft.prefill.fix.choose_code' : 'tracfin:draft.prefill.fix.choose_object',
          {
            field: fieldLabel(t, catalogField),
          },
        )}
      </Button>
      {open ? (
        <div className="border-grey-border flex flex-col gap-xs rounded-md border p-sm">
          {fix === 'choose_code' ? (
            <p className="text-grey-secondary text-xs">{t('tracfin:draft.prefill.fix.choose_code_note')}</p>
          ) : null}
          {ownerMissing && owner ? (
            <p className="text-grey-secondary text-xs">
              {t('tracfin:draft.prefill.fix.owner_required', { owner: fieldLabel(t, owner) })}
            </p>
          ) : (
            <FieldEditor
              address={blockAddress(field.block_id)}
              field={catalogField}
              parentValueId={parentValueId}
              showDiagnostics={false}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * One diagnostic, in French, with « à recalculer » when the draft moved past the revision it was
 * computed on. `withFix` adds the action that lets the analyst settle it from the field (choose the
 * TRACFIN code for this draft, or the declared object).
 */
export function DiagnosticNotice({
  diagnostic,
  withFix = false,
  showField = false,
}: {
  diagnostic: BlockDiagnostic;
  withFix?: boolean;
  showField?: boolean;
}) {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  // A code with no French text shows the server's own message (see `useReviewDiagnosticText`).
  const text = useReviewDiagnosticText()(diagnostic);
  const catalogField = diagnostic.field?.field_id ? catalogIndex.field(diagnostic.field.field_id) : undefined;
  return (
    <div role="note" data-diagnostic-code={diagnostic.code} className="flex min-w-0 flex-col gap-xs">
      <p className="text-s text-orange-primary flex flex-wrap items-center gap-xs">
        {showField && catalogField ? <span className="font-medium">{fieldLabel(t, catalogField)} : </span> : null}
        <span>{text}</span>
        {diagnostic.stale ? (
          <Tag size="xs" color="grey">
            {t('tracfin:draft.prefill.stale_tag')}
          </Tag>
        ) : null}
      </p>
      {withFix ? <FixField diagnostic={diagnostic} /> : null}
    </div>
  );
}
