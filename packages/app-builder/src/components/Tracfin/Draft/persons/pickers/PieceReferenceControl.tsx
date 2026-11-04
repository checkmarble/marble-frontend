import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../../editor/TracfinDraftEditorContext';
import type { TracfinFieldControlProps } from '../../fields/types';
import { declaredPieces, firstText } from '../document';
import { PIECE_CATALOG_ID } from '../person-kinds';
import { ReferencePicker } from './ReferencePicker';

/** Picks one of the pieces of the declaration (`/ds/pieceJointe/piece`); the pieces themselves are added in the Pieces section. */
export function PieceReferenceControl({
  label,
  occurrence,
  disabled,
  onSet,
  onClear,
  onCommit,
}: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const pieces = declaredPieces(draft.document.root);
  const options = pieces.map((piece, index) => ({
    value: piece.id,
    label:
      firstText(piece, `${PIECE_CATALOG_ID}/libelle`) ??
      firstText(piece, `${PIECE_CATALOG_ID}/nom`) ??
      t('tracfin:draft.persons.picker.piece_unnamed', { index: index + 1 }),
  }));
  const { state } = occurrence;
  const value = state.kind === 'reference' ? state.reference.block_id : undefined;

  return (
    <ReferencePicker
      value={value}
      options={options}
      ariaLabel={label}
      clearLabel={t('tracfin:draft.clear_value', { field: label })}
      placeholder={t('tracfin:draft.persons.picker.piece_placeholder')}
      emptyHint={t('tracfin:draft.persons.picker.no_piece', { section: t('tracfin:draft.sections.pieces') })}
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
