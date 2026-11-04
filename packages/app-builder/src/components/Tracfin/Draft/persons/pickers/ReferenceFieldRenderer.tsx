import { useTranslation } from 'react-i18next';
import { ReferenceControl } from '../../fields/ReferenceControl';
import { TextControl } from '../../fields/TextControl';
import type { TracfinFieldControlProps } from '../../fields/types';
import { referenceTargetOf } from '../person-kinds';
import { PersonReferenceControl } from './PersonReferenceControl';
import { PieceReferenceControl } from './PieceReferenceControl';
import { SupportReferenceControl } from './SupportReferencePicker';

function PickerOf(props: TracfinFieldControlProps) {
  const target = referenceTargetOf(props.field);
  switch (target?.kind) {
    case 'person':
      return <PersonReferenceControl {...props} />;
    case 'piece':
      return <PieceReferenceControl {...props} />;
    case 'support':
      return <SupportReferenceControl {...props} />;
    default:
      return <ReferenceControl {...props} />;
  }
}

/**
 * Renderer of the `reference` fields: the picker for what the field points to (a declared person, a
 * piece, a support of the person named in the same block). The backend decides the target by field
 * name (`referenceTarget`), so the picker does too.
 */
export function ReferenceFieldRenderer(props: TracfinFieldControlProps) {
  return <PickerOf {...props} />;
}

/**
 * Renderer of the `text_or_reference` fields (issuer and beneficiary of an operation and their
 * financial reference): the picker, or free text. Either one replaces the other.
 */
export function TextOrReferenceFieldRenderer(props: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  if (referenceTargetOf(props.field) === null) {
    return props.occurrence.state.kind === 'reference' ? <ReferenceControl {...props} /> : <TextControl {...props} />;
  }
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <PickerOf {...props} />
      <span className="text-grey-secondary text-xs">{t('tracfin:draft.persons.picker.or_free_text')}</span>
      <TextControl {...props} label={t('tracfin:draft.persons.picker.free_text_label', { field: props.label })} />
    </div>
  );
}
