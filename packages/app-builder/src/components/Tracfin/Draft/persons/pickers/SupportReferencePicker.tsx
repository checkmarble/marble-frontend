import type { TracfinReference } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../../editor/TracfinDraftEditorContext';
import type { TracfinFieldControlProps } from '../../fields/types';
import { referenceTargetOf, supportTypeOf } from '../person-kinds';
import { supportIdentifier, supportsOfPerson } from '../supports';
import { ReferencePicker } from './ReferencePicker';

type SupportReferencePickerProps = {
  /** The person the support must belong to (the issuer or beneficiary chosen in the same block); `null` until one is chosen. */
  personBlockId: string | null;
  value: TracfinReference | undefined;
  ariaLabel: string;
  clearLabel: string;
  disabled?: boolean;
  onChange: (reference: TracfinReference) => void;
  onClear: () => void;
};

/**
 * Picks a support (IBAN, card, contract...) of ONE person. The backend only accepts a support that
 * lies under the person named by the sibling field of the operation, so nothing else is offered.
 * Reused by the operations section for `refFinanciere*`.
 */
export function SupportReferencePicker({
  personBlockId,
  value,
  ariaLabel,
  clearLabel,
  disabled,
  onChange,
  onClear,
}: SupportReferencePickerProps) {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const supports = personBlockId ? supportsOfPerson(draft.document.root, personBlockId) : [];
  const options = supports.map((support) => {
    const type = supportTypeOf(support.catalog_id);
    const typeLabel = type ? t(`tracfin:draft.persons.support_types.${type}`) : support.catalog_id;
    const identifier = supportIdentifier(support);
    return { value: support.id, label: identifier ? `${typeLabel} · ${identifier}` : typeLabel };
  });

  return (
    <ReferencePicker
      value={value?.block_id}
      options={options}
      ariaLabel={ariaLabel}
      clearLabel={clearLabel}
      placeholder={t('tracfin:draft.persons.picker.support_placeholder')}
      emptyHint={
        personBlockId
          ? t('tracfin:draft.persons.picker.no_support')
          : t('tracfin:draft.persons.picker.support_needs_person')
      }
      unknownLabel={t('tracfin:draft.persons.picker.removed')}
      disabled={disabled}
      onChange={(blockId) =>
        onChange({ block_id: blockId, ...(personBlockId ? { person_block_id: personBlockId } : {}) })
      }
      onClear={onClear}
    />
  );
}

/** The field control for `refFinanciere*`: the person comes from the sibling field of the same block. */
export function SupportReferenceControl({
  field,
  label,
  occurrence,
  disabled,
  onSet,
  onClear,
  onCommit,
}: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const target = referenceTargetOf(field);
  const personFieldId = target?.kind === 'support' ? field.id.replace(/[^/]+$/, target.personFieldName) : null;
  const personOccurrence = personFieldId
    ? editor.occurrences({ address: occurrence.target.block, fieldId: personFieldId, single: false })[0]
    : undefined;
  const personBlockId = personOccurrence?.state.kind === 'reference' ? personOccurrence.state.reference.block_id : null;
  const { state } = occurrence;

  return (
    <SupportReferencePicker
      personBlockId={personBlockId}
      value={state.kind === 'reference' ? state.reference : undefined}
      ariaLabel={label}
      clearLabel={t('tracfin:draft.clear_value', { field: label })}
      disabled={disabled}
      onChange={(reference) => {
        onSet({ kind: 'reference', reference });
        onCommit();
      }}
      onClear={() => {
        onClear();
        onCommit();
      }}
    />
  );
}
