import { type AiCaseReviewListItem } from '@app-builder/models/cases';
import { useEnqueueCaseReviewMutation } from '@app-builder/queries/ask-case-review';
import { useCaseReviewQuery } from '@app-builder/queries/get-case-review';
import { useCaseReviewsQuery } from '@app-builder/queries/get-case-reviews';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { AIText, Button, Card } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AiReviewPanel } from './AiReviewPanel';
import { AiReviewStatusMessage } from './AiReviewStatusMessage';

const PENDING_POLL_INTERVAL_MS = 5000;

type AiReviewCardProps = {
  caseId: string;
  canManuallyReview: boolean;
};

export function AiReviewCard({ caseId, canManuallyReview }: AiReviewCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const enqueueReviewMutation = useEnqueueCaseReviewMutation();
  const queryClient = useQueryClient();
  const reviewsQuery = useCaseReviewsQuery(caseId, {
    refetchInterval: (query) =>
      (query.state.data ?? []).some((r) => r.status === 'pending') ? PENDING_POLL_INTERVAL_MS : false,
  });

  const reviews = reviewsQuery.data ?? [];
  const latestReview = reviews[0];

  return (
    <>
      <Card color="purple" className="flex flex-col gap-sm">
        <Header showSeeAll={!!latestReview} onSeeAll={() => setPanelOpen(true)} />
        {match(reviewsQuery)
          .with({ isLoading: true }, () => <LoadingBody />)
          .with({ isError: true }, () => <ErrorBody />)
          .otherwise(() =>
            !latestReview ? (
              <EmptyBody
                canManuallyReview={canManuallyReview}
                onGenerate={() =>
                  enqueueReviewMutation.mutateAsync(caseId).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['cases', caseId, 'reviews'] });
                  })
                }
                isGenerating={enqueueReviewMutation.isPending}
              />
            ) : latestReview.status === 'completed' ? (
              <PopulatedBody review={reviewsQuery.data?.[0]} />
            ) : (
              <AiReviewStatusMessage status={latestReview.status} />
            ),
          )}
      </Card>
      {latestReview ? (
        <AiReviewPanel
          caseId={caseId}
          canManuallyReview={canManuallyReview}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          reviews={reviews}
        />
      ) : null}
    </>
  );
}

function Header({ showSeeAll, onSeeAll }: { showSeeAll: boolean; onSeeAll: () => void }) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex items-center gap-xs">
      <Icon icon="ai-review" className="size-4 text-purple-primary shrink-0" />
      <span className="flex-1 text-default font-medium text-purple-primary">
        {t('cases:case.ai_reviews.extract_title')}
      </span>
      {showSeeAll ? (
        <Button variant="secondary" size="small" onClick={onSeeAll}>
          <Icon icon="visibility" className="size-4" />
          {t('cases:case.ai_reviews.see_all')}
        </Button>
      ) : null}
    </div>
  );
}

function EmptyBody({
  canManuallyReview,
  onGenerate,
  isGenerating,
}: {
  canManuallyReview: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex items-center justify-between gap-sm">
      <span className="text-small text-grey-secondary">{t('cases:case.ai_reviews.empty')}</span>
      {canManuallyReview ? (
        <Button variant="secondary" size="small" onClick={onGenerate} disabled={isGenerating}>
          <Icon icon={isGenerating ? 'spinner' : 'wand'} className={`size-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {t('cases:case.ai_reviews.generate')}
        </Button>
      ) : null}
    </div>
  );
}

function LoadingBody() {
  return (
    <div className="flex items-center gap-xs text-small text-grey-secondary">
      <Icon icon="spinner" className="size-4 animate-spin" />
    </div>
  );
}

function ErrorBody() {
  const { t } = useTranslation(['cases']);
  return <span className="text-small text-red-primary">{t('cases:case.ai_reviews.error_loading')}</span>;
}

function PopulatedBody({ review }: { review?: AiCaseReviewListItem }) {
  const reviewQuery = useCaseReviewQuery(review?.caseId ?? '', review?.id ?? '');

  if (reviewQuery.isLoading) return <LoadingBody />;
  if (reviewQuery.isError) return <ErrorBody />;

  if (reviewQuery.data) {
    const content = reviewQuery.data.review;
    const excerpt = content?.summary || stripMarkdown(content?.output?.trim() ?? '');
    if (!excerpt) return <AiReviewStatusMessage status="completed" />;
    return <AIText text={excerpt} maxLines={6} />;
  }
  return null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
