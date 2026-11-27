import { Callout } from '@app-builder/components/Callout';
import { type ContinuousScreening } from '@app-builder/models/continuous-screening';
import { SCREENING_REVIEW_COMMENT_MAX } from '@app-builder/models/screening-review';
import { useMarkPendingMatchesAsNoHitMutation } from '@app-builder/queries/continuous-screening/mark-pending-matches-as-no-hit';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function MarkAllNoHitButton({ caseId, screening }: { caseId: string; screening: ContinuousScreening }) {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const markAllMutation = useMarkPendingMatchesAsNoHitMutation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  const pendingCount = screening.matches.filter(({ status }) => status === 'pending').length;
  if (screening.status !== 'in_review' || !pendingCount) return null;

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setComment('');
  };

  // Some matches may be saved even when the request fails, so every outcome refreshes the page.
  const markAll = () => {
    markAllMutation
      .mutateAsync({ caseId, screeningId: screening.id, comment })
      .then((result) => {
        // `undefined`: a redirect already navigates away.
        if (!result) return;
        if (!result.ok) toast.error(t('continuousScreening:review.mark_all_no_hit.failed'));
        else if (result.failed) {
          toast.error(t('continuousScreening:review.mark_all_no_hit.partially_failed', { count: result.failed }));
        } else toast.success(t('continuousScreening:review.mark_all_no_hit.success'));
        onOpenChange(false);
        router.invalidate();
      })
      .catch(() => {
        toast.error(t('continuousScreening:review.mark_all_no_hit.failed'));
        onOpenChange(false);
        router.invalidate();
      });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>
        <Button variant="secondary" size="small">
          <Icon icon="tick" className="size-4" />
          {t('continuousScreening:review.mark_all_no_hit.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('continuousScreening:review.mark_all_no_hit.button')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <div>{t('continuousScreening:review.mark_all_no_hit.modal.description', { count: pendingCount })}</div>
          {screening.partial ? (
            <Callout color="orange">
              {t('continuousScreening:review.mark_all_no_hit.modal.partial_search_warning')}
            </Callout>
          ) : (
            <div>{t('continuousScreening:review.mark_all_no_hit.modal.case_closure')}</div>
          )}
          <TextArea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={SCREENING_REVIEW_COMMENT_MAX}
            placeholder={t('continuousScreening:review.mark_all_no_hit.modal.comment_placeholder')}
            className="h-25"
          />
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('continuousScreening:review.mark_all_no_hit.modal.confirm_button')}
            onClick={markAll}
            disabled={markAllMutation.isPending}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
