import type { TracfinDiagnostic } from '@app-builder/models/tracfin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import type { BlockDiagnostic } from '../fields/block-diagnostics';
import { FieldEditor } from '../fields/FieldEditor';
import { fieldLabel } from '../fields/labels';
import { blockAddress } from '../model/block-address';
import { diagnosticFixOf, isKnownPrefillDiagnosticCode } from './diagnostic-codes';

/** The French explanation of a diagnostic code; an unknown code gets the generic sentence, never the raw message. */
export function useDiagnosticText() {
  const { t } = useTranslation(['tracfin']);
  return (diagnostic: TracfinDiagnostic): string =>
    isKnownPrefillDiagnosticCode(diagnostic.code)
      ? t(`tracfin:draft.prefill.diagnostics.${diagnostic.code}`)
      : t('tracfin:draft.prefill.diagnostics.UNKNOWN_DIAGNOSTIC', { code: diagnostic.code });
}

/** Opens the field of a diagnostic in the generic editor: a manual `set_field` on this draft only. */
function FixField({ diagnostic }: { diagnostic: TracfinDiagnostic }) {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  const [open, setOpen] = useState(false);
  const fix = diagnosticFixOf(diagnostic.code);
  const field = diagnostic.field;
  const catalogField = field ? catalogIndex.field(field.field_id) : undefined;
  if (!fix || !field || !catalogField) return null;

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
          <FieldEditor address={blockAddress(field.block_id)} field={catalogField} showDiagnostics={false} />
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
  const text = useDiagnosticText()(diagnostic);
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
