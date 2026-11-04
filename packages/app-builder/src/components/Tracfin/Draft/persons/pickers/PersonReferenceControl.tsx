import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../../editor/TracfinDraftEditorContext';
import type { TracfinFieldControlProps } from '../../fields/types';
import { PersonKindBadge } from '../PersonKindBadge';
import { useDeclaredPersons } from '../usePersonNames';
import { holderPersonId } from './holder';
import { ReferencePicker } from './ReferencePicker';

/**
 * Picks a declared person for a person reference (a manager, a beneficial owner, the other end of a
 * link, the issuer or beneficiary of an operation). The person that holds the field is not offered:
 * nobody is their own manager, nobody is linked to themselves. People are declared in the Persons
 * section, never here.
 */
export function PersonReferenceControl({
  label,
  occurrence,
  disabled,
  onSet,
  onClear,
  onCommit,
}: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const persons = useDeclaredPersons();
  const self = holderPersonId(draft.document.root, occurrence.target.block);
  const options = persons
    .filter((person) => person.id !== self)
    .map((person) => ({
      value: person.id,
      label: person.name,
      badge: <PersonKindBadge kind={person.kind} />,
    }));
  const { state } = occurrence;
  const value = state.kind === 'reference' ? state.reference.block_id : undefined;

  return (
    <ReferencePicker
      value={value}
      options={options}
      ariaLabel={label}
      clearLabel={t('tracfin:draft.clear_value', { field: label })}
      placeholder={t('tracfin:draft.persons.picker.person_placeholder')}
      emptyHint={t('tracfin:draft.persons.picker.no_person')}
      unknownLabel={t('tracfin:draft.persons.picker.removed')}
      disabled={disabled}
      onChange={(blockId) => {
        onSet({ kind: 'reference', reference: { block_id: blockId } });
        onCommit();
      }}
      onClear={() => {
        onClear();
        onCommit();
      }}
    />
  );
}
