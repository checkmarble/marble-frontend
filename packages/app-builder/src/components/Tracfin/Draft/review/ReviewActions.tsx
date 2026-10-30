import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { useTracfinReview } from './TracfinReviewContext';

/**
 * « Contrôler » and « Exporter », both on the SAVED revision: unsent edits are saved first, and the
 * revision the analyst sees in the header is the one that is checked or exported.
 */
export function ReviewActions() {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const review = useTracfinReview();

  const busyText =
    review.exportStatus === 'saving'
      ? t('tracfin:draft.review.busy.saving')
      : review.exportStatus === 'exporting'
        ? t('tracfin:draft.review.busy.exporting')
        : review.exportStatus === 'checking'
          ? t('tracfin:draft.review.busy.checking')
          : review.validating
            ? t('tracfin:draft.review.busy.validating')
            : null;

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-s text-grey-secondary">
        {t('tracfin:draft.review.saved_revision', { revision: editor.draft.revision })}
      </p>
      {editor.hasPendingChanges ? (
        <p className="text-s text-orange-primary" role="note">
          {t('tracfin:draft.review.pending', { count: editor.pendingCount })}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-sm">
        <Button variant="secondary" appearance="stroked" disabled={review.busy} onClick={() => void review.validate()}>
          {t('tracfin:draft.review.validate')}
        </Button>
        <Button variant="primary" disabled={review.busy} onClick={() => void review.exportDraft()}>
          {t('tracfin:draft.review.export')}
        </Button>
        {busyText ? (
          <span role="status" className="text-s text-grey-secondary">
            {busyText}
          </span>
        ) : null}
      </div>
    </div>
  );
}
