import type { CaseFile } from '@app-builder/models/cases';
import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { blockAddress } from '../model/block-address';
import { RemoveBlockButton } from '../persons/RemoveBlockButton';
import { PieceFileNotice } from './PieceFileNotice';
import { PieceUsage } from './PieceUsage';
import {
  fileSizeParts,
  identityDetailsExpected,
  PIECE_CATALOG_ID,
  pieceDisplayName,
  piecesReferencing,
  shortHash,
} from './pieces-model';
import { usePieceFileIssues } from './use-piece-file-issues';

function FileSize({ bytes }: { bytes: number }) {
  const { t, i18n } = useTranslation(['tracfin']);
  const { value, unit } = fileSizeParts(bytes);
  return (
    <>
      {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(value)}{' '}
      {t(`tracfin:draft.pieces.size.${unit}`)}
    </>
  );
}

/** What the draft holds of the file: name (from the case listing), size and short SHA-256 as the server proved them. */
function AttachmentSummary({ piece, file }: { piece: TracfinBlock; file: CaseFile | undefined }) {
  const { t } = useTranslation(['tracfin']);
  const attachment = piece.attachment;
  if (!attachment) return null;
  return (
    <dl className="text-s grid grid-cols-[max-content_1fr] gap-x-md gap-y-2xs">
      <dt className="text-grey-secondary">{t('tracfin:draft.pieces.card.file')}</dt>
      <dd className="min-w-0 break-words font-medium">
        {file
          ? file.fileName
          : t('tracfin:draft.pieces.card.file_unlisted', { id: attachment.source_file_id.slice(0, 8) })}
      </dd>
      <dt className="text-grey-secondary">{t('tracfin:draft.pieces.card.size')}</dt>
      <dd>
        <FileSize bytes={attachment.size} />
      </dd>
      <dt className="text-grey-secondary">{t('tracfin:draft.pieces.card.sha256')}</dt>
      <dd>
        <code className="font-mono text-xs" title={attachment.sha256}>
          {shortHash(attachment.sha256)}…
        </code>
      </dd>
    </dl>
  );
}

/**
 * One piece of the declaration: the file it holds (name, size, short hash), the problems of that
 * file, the metadata in the generic editor (`contenu` and `@id` are calculated and never shown),
 * and who references it.
 */
export function PieceCard({
  piece,
  index,
  files,
}: {
  piece: TracfinBlock;
  /** 1-based position among the pieces. */
  index: number;
  files: readonly CaseFile[] | null;
}) {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const { issues, exportRevision } = usePieceFileIssues(piece);
  const name = pieceDisplayName(piece);
  const title = name ?? t('tracfin:draft.persons.picker.piece_unnamed', { index });
  const file = files?.find((entry) => entry.id === piece.attachment?.source_file_id);
  const referencedBy = piecesReferencing(draft.document.root, piece.id).length;

  return (
    <section
      aria-label={t('tracfin:draft.pieces.card.aria', { index })}
      data-block-id={piece.id}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex items-start justify-between gap-sm">
        <h4 className="text-default min-w-0 break-words font-semibold">{title}</h4>
        <RemoveBlockButton
          blockId={piece.id}
          title={title}
          description={
            referencedBy > 0
              ? t('tracfin:draft.pieces.card.remove_referenced', { count: referencedBy })
              : t('tracfin:draft.pieces.card.remove')
          }
        />
      </header>
      <AttachmentSummary piece={piece} file={file} />
      <PieceFileNotice issues={issues} exportRevision={exportRevision} />
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.pieces.card.date_help')}</p>
      <TracfinBlockEditor address={blockAddress(piece.id)} catalogId={PIECE_CATALOG_ID} showDiagnostics={false} />
      {identityDetailsExpected(piece) ? (
        <p role="note" className="text-s text-orange-primary">
          {t('tracfin:draft.pieces.card.identity_expected')}
        </p>
      ) : null}
      <PieceUsage pieceId={piece.id} />
    </section>
  );
}
