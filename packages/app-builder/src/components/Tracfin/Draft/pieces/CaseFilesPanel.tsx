import { useFormatDateTime } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { declaredPieces } from '../persons/document';
import { useTracfinCaseFiles } from './case-files-context';
import { addedFiles, pieceCapacity } from './pieces-model';
import type { useAddPiece } from './use-add-piece';

/**
 * The files attached to the case, from the case detail already loaded: each can be taken as a piece
 * (one that is taken is marked), and a file that is not there yet is added through the case itself —
 * this screen never uploads anything.
 */
export function CaseFilesPanel({ adder }: { adder: ReturnType<typeof useAddPiece> }) {
  const { t } = useTranslation(['tracfin']);
  const formatDateTime = useFormatDateTime();
  const { draft, caseId } = useTracfinDraftEditorContext();
  const caseFiles = useTracfinCaseFiles();
  const root = draft.document.root;
  const capacity = pieceCapacity(declaredPieces(root).length);
  const added = addedFiles(root);

  return (
    <section
      aria-label={t('tracfin:draft.pieces.files.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center gap-xs">
        <h3 className="text-default font-semibold">{t('tracfin:draft.pieces.files.title')}</h3>
      </header>
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.pieces.files.help')}</p>

      {caseFiles === null ? (
        <p className="text-s text-orange-primary" role="note">
          {t('tracfin:draft.pieces.files.unavailable')}
        </p>
      ) : caseFiles.files.length === 0 ? (
        <p className="text-grey-secondary text-s">{t('tracfin:draft.pieces.files.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {caseFiles.files.map((file) => {
            const existing = added.get(file.id);
            const busy = adder.busyFileId === file.id;
            return (
              <li
                key={file.id}
                data-file-id={file.id}
                className="border-grey-border flex flex-wrap items-center justify-between gap-sm rounded-md border px-md py-sm"
              >
                <div className="flex min-w-0 flex-col gap-2xs">
                  <span className="text-s min-w-0 break-words font-medium">{file.fileName}</span>
                  <span className="text-grey-secondary text-xs">
                    {t('tracfin:draft.pieces.files.added_on', {
                      date: formatDateTime(file.createdAt, { dateStyle: 'short', timeStyle: 'short' }),
                    })}
                  </span>
                </div>
                {existing ? (
                  <Tag size="xs" color="green">
                    {t('tracfin:draft.pieces.files.already', { index: existing.position })}
                  </Tag>
                ) : (
                  <Button
                    variant="secondary"
                    appearance="stroked"
                    size="small"
                    // Kept clickable at the maximum: the click is refused with a message (nothing is sent).
                    aria-disabled={capacity.full || busy}
                    aria-label={t('tracfin:draft.pieces.files.add_aria', { name: file.fileName })}
                    onClick={() => void adder.add(file)}
                  >
                    <Icon icon="plus" className="size-4" />
                    {t('tracfin:draft.pieces.files.add')}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-sm">
        <Link
          to="/cases/$caseId"
          params={{ caseId: fromUUIDtoSUUID(caseId) }}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-primary text-s underline"
        >
          {t('tracfin:draft.pieces.files.add_to_case')}
        </Link>
        {caseFiles?.refresh ? (
          <Button variant="secondary" appearance="link" size="small" onClick={caseFiles.refresh}>
            {t('tracfin:draft.pieces.files.refresh')}
          </Button>
        ) : null}
      </div>
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.pieces.files.add_to_case_help')}</p>
    </section>
  );
}
