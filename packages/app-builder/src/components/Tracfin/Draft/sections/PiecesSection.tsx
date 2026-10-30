import { TRACFIN_MAX_PIECES } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { declaredPieces } from '../persons/document';
import { AddPieceErrorBanner } from '../pieces/AddPieceError';
import { CaseFilesPanel } from '../pieces/CaseFilesPanel';
import { useTracfinCaseFiles } from '../pieces/case-files-context';
import { PieceCard } from '../pieces/PieceCard';
import { pieceCapacity } from '../pieces/pieces-model';
import { useAddPiece } from '../pieces/use-add-piece';

/**
 * The attachments of the declaration: files that already belong to the case are taken as pieces
 * (at most 15), their metadata completed, and a file that disappeared or changed is shown with how to
 * recover. Nothing is uploaded here.
 */
export function PiecesSection() {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const caseFiles = useTracfinCaseFiles();
  const adder = useAddPiece();
  const pieces = declaredPieces(draft.document.root);
  const capacity = pieceCapacity(pieces.length);

  return (
    <div className="flex flex-col gap-lg">
      <Typo as="h2" variant="title2">
        {t('tracfin:draft.sections.pieces')}
      </Typo>
      <p className="text-grey-secondary text-s">{t('tracfin:draft.pieces.intro')}</p>

      {adder.error ? <AddPieceErrorBanner error={adder.error} onDismiss={adder.clearError} /> : null}
      <CaseFilesPanel adder={adder} />

      <section
        aria-label={t('tracfin:draft.pieces.list.title')}
        className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
      >
        <header className="flex flex-wrap items-center gap-xs">
          <h3 className="text-default font-semibold">{t('tracfin:draft.pieces.list.title')}</h3>
          <span className="text-grey-secondary text-xs">
            {t('tracfin:draft.occurrences', { count: pieces.length, max: TRACFIN_MAX_PIECES })}
          </span>
        </header>
        {capacity.overMaximum ? (
          <p role="note" className="text-s text-orange-primary">
            {t('tracfin:draft.pieces.list.over_maximum', { count: capacity.count, max: capacity.max })}
          </p>
        ) : capacity.full ? (
          <p role="note" className="text-grey-secondary text-xs">
            {t('tracfin:draft.pieces.list.at_maximum', { max: capacity.max })}
          </p>
        ) : null}
        {pieces.length === 0 ? (
          <p className="text-grey-secondary text-s">{t('tracfin:draft.pieces.list.empty')}</p>
        ) : (
          <div className="flex flex-col gap-md">
            {pieces.map((piece, position) => (
              <PieceCard key={piece.id} piece={piece} index={position + 1} files={caseFiles?.files ?? null} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
