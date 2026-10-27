import { CalloutV2 } from '@app-builder/components/Callout';
import type { TracfinExport } from '@app-builder/models/tracfin';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { fileSizeParts } from '../pieces/pieces-model';
import { DiagnosticsList } from './DiagnosticsList';
import { diagnosticTarget, dropUnlocatedTwins, isAttachmentDiagnosticCode } from './diagnostic-model';
import { useReviewDiagnosticText } from './diagnostic-text';
import { ExportDownload } from './ExportDownload';
import { ExportStatements } from './ExportStatements';
import { lastExportRelation } from './export-outcome';
import { LayersTable } from './LayersTable';
import { useTracfinFocus } from './TracfinFocusContext';
import { useTracfinReview } from './TracfinReviewContext';

function ExportSize({ bytes }: { bytes: number }) {
  const { t, i18n } = useTranslation(['tracfin']);
  const { value, unit } = fileSizeParts(bytes);
  const number = (amount: number, digits: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: digits }).format(amount);
  return (
    <span title={`${number(bytes, 0)} ${t('tracfin:draft.pieces.size.B')}`}>
      {number(value, 1)} {t(`tracfin:draft.pieces.size.${unit}`)}
    </span>
  );
}

/** The pieces the export left out (file missing or changed): the report of the export is where the server says so. */
function OmittedPieces({ tracfinExport }: { tracfinExport: TracfinExport }) {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const { goTo } = useTracfinFocus();
  const text = useReviewDiagnosticText();
  const omitted = dropUnlocatedTwins(tracfinExport.validation.diagnostics ?? []).filter((diagnostic) =>
    isAttachmentDiagnosticCode(diagnostic.code),
  );
  if (omitted.length === 0) return null;
  return (
    <CalloutV2 role="note">
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <p className="font-semibold">
          {t('tracfin:draft.review.last_export.omitted_title', { count: omitted.length })}
        </p>
        <p className="text-xs">{t('tracfin:draft.review.last_export.omitted_help')}</p>
        <ul className="flex flex-col gap-xs">
          {omitted.map((diagnostic, index) => {
            const target = diagnosticTarget(diagnostic, draft.document.root);
            return (
              <li key={`${diagnostic.code}-${diagnostic.field?.block_id ?? ''}-${index}`} className="text-s">
                <span>{text(diagnostic)}</span>{' '}
                {target ? (
                  <Button
                    variant="secondary"
                    appearance="link"
                    size="small"
                    onClick={() => goTo({ ...target, section: 'pieces' })}
                  >
                    {t('tracfin:draft.review.last_export.go_to_pieces')}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </CalloutV2>
  );
}

/**
 * The last export of the draft: which revision it is of against the revision being edited, its date,
 * size and SHA-256, what the internal checks said of it, and the download. The XML is the exported
 * artifact of THAT revision, however far the draft has moved since.
 */
export function LastExportCard() {
  const { t } = useTranslation(['tracfin']);
  const formatDateTime = useFormatDateTime();
  const { draft, caseId, hasPendingChanges } = useTracfinDraftEditorContext();
  const review = useTracfinReview();
  const tracfinExport = draft.last_export;

  if (!tracfinExport) {
    return (
      <section
        aria-label={t('tracfin:draft.review.last_export.title')}
        className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
      >
        <h3 className="text-default font-semibold">{t('tracfin:draft.review.last_export.title')}</h3>
        <p className="text-s text-grey-secondary">{t('tracfin:draft.review.last_export.none')}</p>
      </section>
    );
  }

  const relation = lastExportRelation(tracfinExport, draft.revision);
  const reportDiagnostics = dropUnlocatedTwins(tracfinExport.validation.diagnostics ?? []).filter(
    (diagnostic) => !isAttachmentDiagnosticCode(diagnostic.code),
  );

  return (
    <section
      aria-label={t('tracfin:draft.review.last_export.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <h3 className="text-default font-semibold">{t('tracfin:draft.review.last_export.title')}</h3>

      {relation.kind === 'current' ? (
        <p className="text-s" data-testid="export-relation">
          {t('tracfin:draft.review.last_export.current', { revision: relation.revision })}
        </p>
      ) : (
        <CalloutV2 role="note">
          <div className="flex min-w-0 flex-1 flex-col gap-xs" data-testid="export-relation">
            <p className="font-semibold">
              {t('tracfin:draft.review.last_export.older', {
                exportRevision: relation.exportRevision,
                draftRevision: relation.draftRevision,
              })}
            </p>
            {relation.kind === 'older' ? (
              <Button
                variant="primary"
                size="small"
                className="self-start"
                disabled={review.busy}
                onClick={() => void review.exportDraft()}
              >
                {t('tracfin:draft.review.last_export.export_again')}
              </Button>
            ) : null}
          </div>
        </CalloutV2>
      )}
      {hasPendingChanges ? (
        <p className="text-s text-orange-primary" role="note">
          {t('tracfin:draft.review.last_export.pending_not_included')}
        </p>
      ) : null}

      <ExportStatements tracfinExport={tracfinExport} />

      <dl className="text-s grid grid-cols-[max-content_1fr] gap-x-md gap-y-2xs">
        <dt className="text-grey-secondary">{t('tracfin:draft.review.last_export.date')}</dt>
        <dd>{formatDateTime(tracfinExport.created_at, { dateStyle: 'medium', timeStyle: 'short' })}</dd>
        <dt className="text-grey-secondary">{t('tracfin:draft.review.last_export.size')}</dt>
        <dd>
          <ExportSize bytes={tracfinExport.size} />
        </dd>
        <dt className="text-grey-secondary">{t('tracfin:draft.review.last_export.sha256')}</dt>
        <dd className="min-w-0">
          <code className="font-mono text-xs break-all">{tracfinExport.sha256}</code>
        </dd>
        <dt className="text-grey-secondary">{t('tracfin:draft.review.last_export.profile')}</dt>
        <dd>{tracfinExport.profile_version}</dd>
      </dl>

      <OmittedPieces tracfinExport={tracfinExport} />

      <ExportDownload tracfinExport={tracfinExport} caseId={caseId} />

      <div className="flex flex-col gap-sm">
        <h4 className="text-default font-semibold">{t('tracfin:draft.review.last_export.report')}</h4>
        <LayersTable validation={tracfinExport.validation} />
        {reportDiagnostics.length > 0 ? <DiagnosticsList diagnostics={reportDiagnostics} /> : null}
      </div>
    </section>
  );
}
