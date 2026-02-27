import { type AiCaseReviewListItem, type AiCaseReviewStatus } from '@app-builder/models/cases';
import { useAddReviewToCaseCommentsMutation } from '@app-builder/queries/add-review-to-case-comments';
import { useEnqueueCaseReviewMutation } from '@app-builder/queries/ask-case-review';
import { useCaseReviewFeedbackMutation } from '@app-builder/queries/case-review-feedback';
import { useCaseReviewsQuery } from '@app-builder/queries/get-case-reviews';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Markdown, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

function InsufficientFundsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M10 9.5c0-.83.67-1.5 2-1.5s2 .67 2 1.5-.67 1.5-2 1.5-2 .67-2 1.5.67 1.5 2 1.5 2-.67 2-1.5" />
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
    </svg>
  );
}

function ReviewStatusIcon({ status }: { status: AiCaseReviewStatus }) {
  switch (status) {
    case 'completed':
      return <Icon icon="tick" className="size-4 text-green-primary" />;
    case 'pending':
      return <Icon icon="spinner" className="size-4 text-grey-secondary animate-spin" />;
    case 'failed':
      return <Icon icon="cross" className="size-4 text-red-primary" />;
    case 'insufficient_funds':
      return <InsufficientFundsIcon className="size-4 text-orange-primary" />;
  }
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

function ReviewSidePanel({
  review,
  caseId,
  onClose,
}: {
  review: AiCaseReviewListItem;
  caseId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(['cases']);
  const formatDateTime = useFormatDateTime();
  const feedbackMutation = useCaseReviewFeedbackMutation(caseId, review.id);
  const addCommentMutation = useAddReviewToCaseCommentsMutation(caseId, review.id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="absolute inset-0 flex">
      {/* Grey blurred overlay for left side */}
      <div className="flex-1 bg-grey-primary/20 backdrop-blur-sm" onClick={onClose} />
      {/* Panel content */}
      <div className="bg-grey-background z-10 flex h-full w-[60%] flex-col overflow-hidden shadow-xl">
        <div className="border-grey-border flex shrink-0 items-center gap-2 border-b p-4">
          <Button variant="secondary" size="small" onClick={onClose} aria-label={t('cases:case.ai_reviews.side_panel.back')}>
            <Icon icon="arrow-left" className="size-4" />
          </Button>
          <span className="text-s font-medium text-grey-primary">
            {formatDateTime(review.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {review.review && !review.review.ok ? (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-primary bg-red-primary/10 p-3">
              <Icon icon="warning" className="size-4 shrink-0 text-red-primary" />
              <span className="text-s font-medium text-red-primary">
                {t('cases:case_detail.ai_review.consistency_warning')}
              </span>
            </div>
          ) : null}
          <div className="rounded-lg border border-grey-border bg-surface-card p-4">
            <Markdown>{review.review?.output ?? ''}</Markdown>
          </div>
        </div>

        <div className="border-grey-border flex shrink-0 gap-2 border-t p-4">
          <Button
            variant={review.reaction === 'ok' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => feedbackMutation.mutate('ok')}
          >
            <Icon icon="thumb-up" className="size-4" />
            {t('cases:case_detail.ai_review.actions.feedback_ok')}
          </Button>
          <Button
            variant={review.reaction === 'ko' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => feedbackMutation.mutate('ko')}
          >
            <Icon icon="thumb-down" className="size-4" />
            {t('cases:case_detail.ai_review.actions.feedback_ko')}
          </Button>
          <Button variant="secondary" size="small" onClick={() => addCommentMutation.mutate()}>
            <Icon icon="comment" className="size-4" />
            {t('cases:case_detail.ai_review.actions.add_to_comment')}
          </Button>
        </div>
      </div>

    </div>
  );
}

export function CaseReviewsModal({ caseId }: { caseId: string }) {
  const { t } = useTranslation(['cases']);
  const formatDateTime = useFormatDateTime();
  const reviewsQuery = useCaseReviewsQuery(caseId);
  const enqueueReviewMutation = useEnqueueCaseReviewMutation();
  const [selectedReview, setSelectedReview] = useState<AiCaseReviewListItem | null>(null);
  const [isGenerateCoolingDown, setIsGenerateCoolingDown] = useState(false);

  const reviews = reviewsQuery.data ?? [];

  return (
    <div className="relative h-full overflow-hidden">
      {/* Main list view */}
      <div className={cn('flex h-full flex-col', selectedReview && 'pointer-events-none')}>
        {/* Header */}
        <div className="border-grey-border flex shrink-0 items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Icon icon="ai-review" className="size-5 text-purple-primary" />
            <span className="text-l font-semibold text-grey-primary">
              {t('cases:case.ai_reviews.title')}
            </span>
            {reviews.length > 0 ? (
              <span className="rounded-full bg-purple-background px-2 py-0.5 text-xs font-medium text-purple-primary">
                {reviews.length}
              </span>
            ) : null}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => reviewsQuery.refetch()}
            disabled={reviewsQuery.isFetching}
            aria-label={t('cases:case.ai_reviews.refresh')}
          >
            <Icon
              icon="restart-alt"
              className={cn('size-4', reviewsQuery.isFetching && 'animate-spin')}
            />
          </Button>
        </div>

        {/* Reviews list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {reviewsQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Icon icon="spinner" className="size-6 animate-spin text-grey-secondary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-full items-center justify-center text-s text-grey-secondary">
              {t('cases:case.ai_reviews.empty')}
            </div>
          ) : (
            <ul className="divide-y divide-grey-border">
              {reviews.map((review) => (
                <li key={review.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      review.status === 'completed'
                        ? 'cursor-pointer hover:bg-grey-background-light'
                        : 'cursor-default',
                    )}
                    onClick={review.status === 'completed' ? () => setSelectedReview(review) : undefined}
                    disabled={review.status !== 'completed'}
                  >
                    <ReviewStatusIcon status={review.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <ReviewStatusBadge status={review.status} />
                        <time className="text-xs text-grey-secondary" dateTime={review.createdAt}>
                          {formatDateTime(review.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                        </time>
                      </div>
                    </div>
                    {review.status === 'completed' ? (
                      <Icon icon="arrow-forward" className="size-4 shrink-0 text-grey-secondary" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-grey-border border-t p-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              enqueueReviewMutation.mutate(caseId);
              setIsGenerateCoolingDown(true);
              setTimeout(() => {
                setIsGenerateCoolingDown(false);
                reviewsQuery.refetch();
              }, 2000);
            }}
            disabled={isGenerateCoolingDown || enqueueReviewMutation.isPending}
          >
            <Icon icon="ai-review" className="size-4" />
            {isGenerateCoolingDown
              ? t('cases:case.ai_reviews.review_requested')
              : t('cases:case.ai_reviews.generate')}
          </Button>
        </div>
      </div>

      {/* Side panel overlay */}
      {selectedReview ? (
        <ReviewSidePanel
          review={selectedReview}
          caseId={caseId}
          onClose={() => setSelectedReview(null)}
        />
      ) : null}
    </div>
  );
}
