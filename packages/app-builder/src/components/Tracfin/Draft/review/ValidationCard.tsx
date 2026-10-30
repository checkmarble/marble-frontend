import { CalloutV2 } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { DiagnosticsList } from './DiagnosticsList';
import { LayersTable } from './LayersTable';
import { tagValidationDiagnostics } from './review-state';
import { useTracfinReview } from './TracfinReviewContext';
import { useSaveFailureText } from './useSaveFailureText';

/**
 * The internal checks of the saved revision: layer table, then the diagnostics (those of the last
 * check and those the draft itself carries) grouped by section and block.
 */
export function ValidationCard() {
  const { t } = useTranslation(['tracfin']);
  const { draft, hasPendingChanges } = useTracfinDraftEditorContext();
  const review = useTracfinReview();
  const saveFailureText = useSaveFailureText();
  const run = review.validation;
  const failure = review.validationFailure;
  const diagnostics = [...tagValidationDiagnostics(run, draft.revision), ...(draft.diagnostics ?? [])];

  return (
    <section
      aria-label={t('tracfin:draft.review.validation.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center gap-xs">
        <h3 className="text-default font-semibold">{t('tracfin:draft.review.validation.title')}</h3>
        {run ? (
          <span className="text-grey-secondary text-xs">
            {t('tracfin:draft.review.validation.for_revision', { revision: run.revision })}
          </span>
        ) : null}
        {run && review.validationStale ? (
          <Tag size="xs" color="orange">
            {t('tracfin:draft.review.validation.stale_tag', { revision: draft.revision })}
          </Tag>
        ) : null}
      </header>

      {failure ? (
        <ErrorBanner>
          <p className="font-semibold">
            {failure.kind === 'save_failed'
              ? saveFailureText(failure.error, 'validation')
              : failure.kind === 'conflict'
                ? t('tracfin:draft.review.validation.conflict')
                : t('tracfin:draft.review.validation.failed')}
          </p>
          {failure.kind === 'failed' && failure.error.message ? (
            <p className="font-mono text-xs">{failure.error.message}</p>
          ) : null}
        </ErrorBanner>
      ) : null}

      {run ? null : <p className="text-s text-grey-secondary">{t('tracfin:draft.review.validation.not_run')}</p>}
      {run && review.validationStale ? (
        <CalloutV2 role="note">
          <p>{t('tracfin:draft.review.validation.stale', { revision: run.revision, current: draft.revision })}</p>
        </CalloutV2>
      ) : null}
      {run && hasPendingChanges ? (
        <p className="text-s text-orange-primary" role="note">
          {t('tracfin:draft.review.validation.unsaved_not_covered')}
        </p>
      ) : null}

      <LayersTable validation={run?.validation ?? null} />

      {diagnostics.length > 0 ? (
        <div className="flex flex-col gap-sm">
          <h4 className="text-default font-semibold">{t('tracfin:draft.review.validation.diagnostics')}</h4>
          <DiagnosticsList diagnostics={diagnostics} />
        </div>
      ) : run ? (
        <p className="text-s text-grey-secondary">{t('tracfin:draft.review.validation.no_diagnostics')}</p>
      ) : null}
    </section>
  );
}
