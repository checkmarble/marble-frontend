import { useTranslation } from 'react-i18next';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import type { PieceFileIssue } from './pieces-model';

/**
 * A piece whose file is absent, gone from the case or changed: the export omits it, with a diagnostic.
 * The only way back is to remove the piece and add the file again — a new piece is a new block, so its
 * metadata and the references to it must be entered again; the text says so.
 */
export function PieceFileNotice({
  issues,
  exportRevision,
}: {
  issues: readonly PieceFileIssue[];
  exportRevision: number | null;
}) {
  const { t } = useTranslation(['tracfin']);
  if (issues.length === 0) return null;
  return (
    <ErrorBanner>
      {issues.map((issue) => (
        <div key={issue.kind} data-issue={issue.kind} className="flex flex-col gap-2xs">
          <p className="font-semibold">{t(`tracfin:draft.pieces.issue.${issue.kind}`)}</p>
          {issue.evidence.includes('case_files') ? (
            <p className="text-xs">{t('tracfin:draft.pieces.issue.evidence_case_files')}</p>
          ) : null}
          {issue.evidence.includes('export') && issue.kind !== 'no_file' ? (
            <p className="text-xs">
              {exportRevision !== null
                ? t('tracfin:draft.pieces.issue.evidence_export', { revision: exportRevision })
                : t('tracfin:draft.pieces.issue.evidence_server')}
            </p>
          ) : null}
        </div>
      ))}
      <p>{t('tracfin:draft.pieces.issue.guidance')}</p>
    </ErrorBanner>
  );
}
