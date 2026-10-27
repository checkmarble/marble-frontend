import { CalloutV2 } from '@app-builder/components/Callout';
import type { TracfinApiError } from '@app-builder/models/tracfin';
import { tracfinKeys } from '@app-builder/queries/tracfin/keys';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { fieldLabel } from '../fields/labels';
import { refusalTarget } from './diagnostic-model';
import type { ExportRefusal } from './export-refusal';
import { useTracfinFocus } from './TracfinFocusContext';
import { useTracfinReview } from './TracfinReviewContext';
import { useSaveFailureText } from './useSaveFailureText';

function useCauseText() {
  const { t } = useTranslation(['tracfin']);
  return (cause: TracfinApiError): string =>
    t(
      `tracfin:draft.review.outcome.cause.${cause.kind === 'timeout' || cause.kind === 'network' ? cause.kind : 'server'}`,
    );
}

function RefusalNotice({ refusal, message }: { refusal: ExportRefusal | null; message: string | null }) {
  const { t } = useTranslation(['tracfin']);
  const { draft, catalogIndex } = useTracfinDraftEditorContext();
  const { goTo } = useTracfinFocus();
  const target = refusal ? refusalTarget(refusal, draft.document.root) : null;
  const catalogField = refusal ? catalogIndex.field(refusal.fieldId) : undefined;
  const field = catalogField ? fieldLabel(t, catalogField) : (refusal?.fieldId ?? '');

  return (
    <ErrorBanner>
      <p className="font-semibold">
        {refusal
          ? t(`tracfin:draft.review.outcome.refused.${refusal.reason}`, { field, codePoint: refusal.codePoint })
          : t('tracfin:draft.review.outcome.refused.other')}
      </p>
      <p className="text-xs">{t('tracfin:draft.review.outcome.refused.explanation')}</p>
      {message ? <p className="font-mono text-xs break-words">{message}</p> : null}
      {target ? (
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          className="self-start"
          onClick={() => goTo(target)}
        >
          {t('tracfin:draft.review.outcome.refused.go_to_field', { field })}
        </Button>
      ) : null}
    </ErrorBanner>
  );
}

/** What the last attempt to export came to, in words that never overstate it. */
export function ExportOutcomeNotice() {
  const { t } = useTranslation(['tracfin']);
  const review = useTracfinReview();
  const editor = useTracfinDraftEditorContext();
  const queryClient = useQueryClient();
  const causeText = useCauseText();
  const saveFailureText = useSaveFailureText();
  const outcome = review.exportOutcome;
  if (!outcome) return null;

  const retry = (
    <Button
      variant="secondary"
      appearance="stroked"
      size="small"
      className="self-start"
      disabled={review.busy}
      onClick={() => void review.exportDraft()}
    >
      {t('tracfin:draft.review.outcome.retry')}
    </Button>
  );

  switch (outcome.kind) {
    case 'exported':
      return (
        <CalloutV2 role="status">
          <p>{t('tracfin:draft.review.outcome.exported', { revision: outcome.export.draft_revision })}</p>
        </CalloutV2>
      );
    case 'confirmed':
      return (
        <CalloutV2 role="status">
          <div className="flex flex-col gap-xs">
            <p>
              {t('tracfin:draft.review.outcome.confirmed', {
                cause: causeText(outcome.cause),
                revision: outcome.export.draft_revision,
              })}
            </p>
          </div>
        </CalloutV2>
      );
    case 'not_confirmed':
      return (
        <ErrorBanner>
          <p className="font-semibold">
            {t('tracfin:draft.review.outcome.not_confirmed', { cause: causeText(outcome.cause) })}
          </p>
          <p className="text-xs">{t('tracfin:draft.review.outcome.not_confirmed_detail')}</p>
          {outcome.previous ? (
            <p className="text-xs">
              {t('tracfin:draft.review.outcome.previous_kept', { revision: outcome.previous.draft_revision })}
            </p>
          ) : null}
          {retry}
        </ErrorBanner>
      );
    case 'moved':
      return (
        <ErrorBanner>
          <p className="font-semibold">
            {t('tracfin:draft.review.outcome.moved', {
              cause: causeText(outcome.cause),
              revision: outcome.revision,
            })}
          </p>
          {retry}
        </ErrorBanner>
      );
    case 'unknown':
      return (
        <ErrorBanner>
          <p className="font-semibold">
            {t('tracfin:draft.review.outcome.unknown', { cause: causeText(outcome.cause) })}
          </p>
          <p className="text-xs">{t('tracfin:draft.review.outcome.unknown_detail')}</p>
          <Button
            variant="secondary"
            appearance="stroked"
            size="small"
            className="self-start"
            onClick={() => {
              review.dismissExportOutcome();
              void queryClient.invalidateQueries({ queryKey: tracfinKeys.draft(editor.caseId) });
            }}
          >
            {t('tracfin:draft.review.outcome.reread')}
          </Button>
        </ErrorBanner>
      );
    case 'refused':
      return <RefusalNotice refusal={outcome.refusal} message={outcome.message} />;
    case 'conflict':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.review.outcome.conflict')}</p>
          <p className="text-xs">{t('tracfin:draft.review.outcome.conflict_detail')}</p>
        </ErrorBanner>
      );
    case 'too_large':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.review.outcome.too_large')}</p>
          <p className="text-xs">{t('tracfin:draft.review.outcome.too_large_detail')}</p>
          {outcome.message ? <p className="font-mono text-xs break-words">{outcome.message}</p> : null}
        </ErrorBanner>
      );
    case 'rejected':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.review.outcome.rejected')}</p>
          {outcome.error.message ? <p className="font-mono text-xs break-words">{outcome.error.message}</p> : null}
        </ErrorBanner>
      );
    case 'save_failed':
      return (
        <ErrorBanner>
          <p className="font-semibold">{saveFailureText(outcome.error, 'export')}</p>
        </ErrorBanner>
      );
    case 'unsent_edits':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.review.outcome.unsent_edits')}</p>
          <p className="text-xs">{t('tracfin:draft.review.outcome.unsent_edits_detail')}</p>
        </ErrorBanner>
      );
  }
}
