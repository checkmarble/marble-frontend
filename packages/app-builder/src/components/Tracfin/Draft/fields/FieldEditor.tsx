import type { TracfinCatalogField } from '@app-builder/models/tracfin';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import type { TracfinBlockAddress } from '../model/block-address';
import { type FieldOccurrence, hasContent } from '../model/field-values';
import { valueRefKey } from '../model/pending-edits';
import { fieldLabel } from './labels';
import { OriginBadge } from './OriginBadge';
import { resolveFieldRenderer, useTracfinFieldRenderers } from './registry';

type FieldEditorProps = {
  address: TracfinBlockAddress;
  field: TracfinCatalogField;
  /** Set for an attribute of simple content: the owner occurrence it belongs to. */
  parentValueId?: string | null;
  /** The owner of an attribute is not saved yet: the attribute is shown, disabled. */
  ownerUnsaved?: boolean;
  nested?: boolean;
};

/**
 * One catalog field of a block: its label, every occurrence (a list when the catalog allows several,
 * with « Ajouter » up to the maximum), and under each occurrence its attributes. The control of an
 * occurrence comes from the renderer registry.
 */
export function FieldEditor({
  address,
  field,
  parentValueId = null,
  ownerUnsaved = false,
  nested = false,
}: FieldEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const renderers = useTracfinFieldRenderers();
  const baseId = useId();

  const cardinality = editor.catalogIndex.cardinality(field.id) ?? { min: 0, max: 1 };
  const single = cardinality.max === 1;
  const occurrences = editor.occurrences({
    address,
    fieldId: field.id,
    parentValueId,
    // A slot to type in is always there for a single-valued field, and for one the catalog expects.
    single: single || cardinality.min >= 1,
  });
  const codes = editor.catalogIndex.codesFor(field.id);
  const Control = resolveFieldRenderer(renderers, field, codes);
  const label = fieldLabel(t, field);
  const attributes = editor.catalogIndex.attributesOf(field.id).filter((entry) => !entry.calculated);
  const canAdd = !single && !ownerUnsaved && (cardinality.max === null || occurrences.length < cardinality.max);

  return (
    <div className={cn('flex min-w-0 flex-col gap-xs', nested && 'border-grey-border ms-md border-s ps-md')}>
      <div className="flex flex-wrap items-center gap-xs">
        <span className="text-s font-medium">{label}</span>
        {cardinality.min >= 1 ? (
          <Tag size="xs" color="orange">
            {t('tracfin:draft.expected_by_tracfin')}
          </Tag>
        ) : null}
        {field.documentation ? (
          <Tooltip.Default content={<p className="max-w-80 text-xs">{field.documentation}</p>}>
            <span tabIndex={0} aria-label={t('tracfin:draft.field_help', { field: label })}>
              <Icon icon="tip" className="text-grey-secondary size-4" />
            </span>
          </Tooltip.Default>
        ) : null}
        {!single ? (
          <span className="text-grey-secondary text-xs">
            {t('tracfin:draft.occurrences', { count: occurrences.length, max: cardinality.max ?? '∞' })}
          </span>
        ) : null}
      </div>

      {codes === 'unavailable' ? (
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.codes_unavailable')}</p>
      ) : null}

      <ul className="flex flex-col gap-sm">
        {occurrences.map((occurrence) => {
          const key = valueRefKey(occurrence.target);
          const inputId = `${baseId}-${key}`;
          const ownerReady = occurrence.target.valueId !== null && hasContent(occurrence.state);
          return (
            <li key={key} className="flex min-w-0 flex-col gap-xs">
              <div className="flex min-w-0 items-start gap-xs">
                <div className="min-w-0 flex-1">
                  <Control
                    field={field}
                    label={label}
                    inputId={inputId}
                    occurrence={occurrence}
                    codes={codes}
                    disabled={ownerUnsaved}
                    onSet={(input) => editor.setField(occurrence.target, input)}
                    onClear={() => editor.clearField(occurrence.target)}
                    onInvalidDecimal={(text) => editor.setInvalidDecimal(occurrence.target, text)}
                    onCommit={() => void editor.autoFlush()}
                  />
                </div>
                <OccurrenceActions occurrence={occurrence} single={single} label={label} />
              </div>
              <OccurrenceStatus occurrence={occurrence} />
              {attributes.map(({ field: attribute }) => (
                <FieldEditor
                  key={attribute.id}
                  address={address}
                  field={attribute}
                  parentValueId={ownerReady ? occurrence.target.valueId : null}
                  ownerUnsaved={!ownerReady}
                  nested
                />
              ))}
              {attributes.length > 0 && !ownerReady ? (
                <p className="text-grey-secondary text-xs">{t('tracfin:draft.attribute_needs_owner')}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {canAdd ? (
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          className="self-start"
          onClick={() => editor.addOccurrence({ address, fieldId: field.id, parentValueId })}
        >
          <Icon icon="plus" className="size-4" />
          {t('tracfin:draft.add_occurrence', { field: label })}
        </Button>
      ) : null}
    </div>
  );
}

/** The origin badge, and « À revoir » with « Confirmer » for a value the server flagged. */
function OccurrenceStatus({ occurrence }: { occurrence: FieldOccurrence }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  return (
    <div className="flex flex-wrap items-center gap-xs">
      <OriginBadge occurrence={occurrence} />
      {occurrence.pending && occurrence.pending.op.type !== 'blank' ? (
        <span className="text-grey-secondary text-xs">{t('tracfin:draft.unsaved')}</span>
      ) : null}
      {occurrence.needsReview ? (
        <>
          <Tag size="xs" color="orange">
            {t('tracfin:draft.needs_review')}
          </Tag>
          <Button variant="secondary" appearance="stroked" size="small" onClick={() => void editor.confirm(occurrence)}>
            {t('tracfin:draft.confirm')}
          </Button>
        </>
      ) : null}
    </div>
  );
}

/** Multi-valued occurrences can be removed: an unsaved one is dropped, a saved one is cleared. */
function OccurrenceActions({
  occurrence,
  single,
  label,
}: {
  occurrence: FieldOccurrence;
  single: boolean;
  label: string;
}) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  if (single) return null;
  const saved = occurrence.target.valueId !== null;
  if (saved && occurrence.state.kind === 'cleared') return null;
  if (!saved && !occurrence.pending) return null;
  return (
    <Button
      variant="secondary"
      appearance="link"
      mode="icon"
      aria-label={t(saved ? 'tracfin:draft.clear_occurrence' : 'tracfin:draft.discard_occurrence', { field: label })}
      onClick={() => {
        if (saved) {
          editor.clearField(occurrence.target);
          void editor.autoFlush();
        } else if (occurrence.pending) {
          editor.discard(occurrence.pending.key);
        }
      }}
    >
      <Icon icon="cross" className="size-4" />
    </Button>
  );
}
