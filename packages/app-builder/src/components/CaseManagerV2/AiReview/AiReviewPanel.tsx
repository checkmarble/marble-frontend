import { type AiCaseReviewListItem, type AiCaseReviewStatus } from '@app-builder/models/cases';
import { useAddReviewToCaseCommentsMutation } from '@app-builder/queries/add-review-to-case-comments';
import { useEnqueueCaseReviewMutation } from '@app-builder/queries/ask-case-review';
import { useCaseReviewFeedbackMutation } from '@app-builder/queries/case-review-feedback';
import { useCaseReviewQuery } from '@app-builder/queries/get-case-review';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Markdown, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelRoot } from '../../Panel';

type AiReviewPanelProps = {
  caseId: string;
  canManuallyReview: boolean;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  reviews: AiCaseReviewListItem[];
};

export function AiReviewPanel({ caseId, canManuallyReview, open, onOpenChange, reviews }: AiReviewPanelProps) {
  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <AiReviewPanelContent {...{ caseId, canManuallyReview, open, onOpenChange, reviews }} />
    </PanelRoot>
  );
}

function AiReviewPanelContent({ caseId, canManuallyReview, onOpenChange, reviews }: AiReviewPanelProps) {
  const { t } = useTranslation(['cases', 'common']);
  const formatDateTime = useFormatDateTime();
  const enqueueReviewMutation = useEnqueueCaseReviewMutation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedListItem = reviews[selectedIndex] ?? reviews[0];
  const reviewQuery = useCaseReviewQuery(caseId, selectedListItem?.id ?? '');
  const review = reviewQuery.data;

  const hasPreviousReport = selectedIndex < reviews.length - 1;

  if (!selectedListItem) return null;

  return (
    <PanelContainer size="max" className="max-w-[80vw]!">
      <div className="flex items-center gap-sm pb-md border-b border-grey-border">
        <Icon
          icon="cross"
          className="size-5 cursor-pointer text-grey-secondary hover:text-grey-primary shrink-0"
          onClick={() => onOpenChange(false)}
          aria-label={t('common:close')}
        />
        <Icon icon="ai-review" className="size-4 text-purple-primary shrink-0" />
        <Typo variant="title2" className="text-grey-primary">
          {t('cases:case_detail.ai_review.panel.title')}
        </Typo>
        <ReviewStatusBadge status={selectedListItem.status} />
        <time className="text-xs text-grey-secondary" dateTime={selectedListItem.createdAt}>
          {formatDateTime(selectedListItem.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
        </time>
        <div className="ms-auto flex items-center gap-xs">
          <Button
            variant="secondary"
            size="small"
            onClick={() => setSelectedIndex((i) => Math.min(i + 1, reviews.length - 1))}
            disabled={!hasPreviousReport}
          >
            {t('cases:case.ai_reviews.see_previous_report')}
          </Button>
          {canManuallyReview ? (
            <Button
              variant="secondary"
              size="small"
              onClick={() => enqueueReviewMutation.mutate(caseId)}
              disabled={enqueueReviewMutation.isPending}
            >
              <Icon icon="wand" className="size-4 text-purple-primary" />
              <span className="text-purple-primary">{t('cases:case.ai_reviews.generate')}</span>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-md flex-1 overflow-y-auto py-md">
        <div className="flex-1 min-w-0 text-small">
          {reviewQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Icon icon="spinner" className="size-6 animate-spin text-grey-secondary" />
            </div>
          ) : reviewQuery.isError ? (
            <div className="flex h-full items-center justify-center text-s text-red-primary">
              {t('cases:case.ai_reviews.error_loading')}
            </div>
          ) : review ? (
            <Markdown>{review.review.output}</Markdown>
          ) : null}
        </div>
        {review && !review.review.ok ? <SanityCheckWarning message={review.review.sanityCheck} /> : null}
      </div>

      {review ? <PanelFooter caseId={caseId} reviewId={review.id} reaction={review.reaction} /> : null}
    </PanelContainer>
  );
}

function SanityCheckWarning({ message }: { message: string }) {
  const { t } = useTranslation(['cases']);
  return (
    <aside className="w-[403px] shrink-0">
      <div className="bg-red-background-light border border-red-border rounded-md p-md flex flex-col gap-xs">
        <div className="flex items-center gap-xs">
          <Icon icon="warning" className="size-4 text-red-primary shrink-0" />
          <span className="text-default font-medium text-red-primary">
            {t('cases:case_detail.ai_review.sanity_check_warning_title')}
          </span>
        </div>
        <p className="text-small text-grey-primary whitespace-pre-line">{message}</p>
      </div>
    </aside>
  );
}

function PanelFooter({
  caseId,
  reviewId,
  reaction,
}: {
  caseId: string;
  reviewId: string;
  reaction: 'ok' | 'ko' | null;
}) {
  const { t } = useTranslation(['cases', 'common']);
  const feedbackMutation = useCaseReviewFeedbackMutation(caseId, reviewId);
  const addCommentMutation = useAddReviewToCaseCommentsMutation(caseId, reviewId);

  return (
    <div className="pt-md border-t border-grey-border mt-auto flex items-center justify-end gap-xs">
      <Button
        variant={reaction === 'ok' ? 'primary' : 'secondary'}
        size="small"
        onClick={() => feedbackMutation.mutate('ok')}
      >
        <Icon icon="thumb-up" className="size-4" />
        {t('cases:case_detail.ai_review.actions.feedback_ok')}
      </Button>
      <Button
        variant={reaction === 'ko' ? 'primary' : 'secondary'}
        size="small"
        onClick={() => feedbackMutation.mutate('ko')}
      >
        <Icon icon="thumb-down" className="size-4" />
        {t('cases:case_detail.ai_review.actions.feedback_ko')}
      </Button>
      <Button
        variant="secondary"
        size="small"
        onClick={() =>
          addCommentMutation.mutate(undefined, {
            onSuccess: () => toast.success(t('cases:case_detail.ai_review.actions.add_to_comment.success')),
            onError: () => toast.error(t('common:errors.unknown')),
          })
        }
      >
        <Icon icon="comment" className="size-4" />
        {t('cases:case_detail.ai_review.actions.add_to_comment')}
      </Button>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: AiCaseReviewStatus }) {
  const { t } = useTranslation(['cases']);
  switch (status) {
    case 'completed':
      return (
        <Tag color="green" size="small">
          {t('cases:case.ai_reviews.status.completed')}
        </Tag>
      );
    case 'pending':
      return (
        <Tag color="grey" size="small">
          {t('cases:case.ai_reviews.status.pending')}
        </Tag>
      );
    case 'failed':
      return (
        <Tag color="red" size="small">
          {t('cases:case.ai_reviews.status.failed')}
        </Tag>
      );
    case 'insufficient_funds':
      return (
        <Tag color="orange" size="small">
          {t('cases:case.ai_reviews.status.insufficient_funds')}
        </Tag>
      );
  }
}
