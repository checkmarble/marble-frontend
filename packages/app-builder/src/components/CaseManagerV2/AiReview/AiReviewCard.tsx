import { type AiCaseReviewListItem } from '@app-builder/models/cases';
import { useEnqueueCaseReviewMutation } from '@app-builder/queries/ask-case-review';
import { useCaseReviewsQuery } from '@app-builder/queries/get-case-reviews';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AiReviewPanel } from './AiReviewPanel';

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
      <Card color="purple" className="flex flex-col gap-v2-sm">
        <Header
          showSeeAll={!!latestReview && latestReview.status === 'completed'}
          onSeeAll={() => setPanelOpen(true)}
        />
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
            ) : latestReview.status === 'pending' ? (
              <PendingBody />
            ) : (
              <PopulatedBody review={latestReview} />
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
    <div className="flex items-center gap-v2-xs">
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
    <div className="flex items-center justify-between gap-v2-sm">
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

function PendingBody() {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex items-center gap-v2-xs text-small text-grey-secondary">
      <Icon icon="spinner" className="size-4 animate-spin" />
      <span>{t('cases:case.ai_reviews.generating')}</span>
    </div>
  );
}

function LoadingBody() {
  return (
    <div className="flex items-center gap-v2-xs text-small text-grey-secondary">
      <Icon icon="spinner" className="size-4 animate-spin" />
    </div>
  );
}

function ErrorBody() {
  const { t } = useTranslation(['cases']);
  return <span className="text-small text-red-primary">{t('cases:case.ai_reviews.error_loading')}</span>;
}

function PopulatedBody({ review }: { review: AiCaseReviewListItem }) {
  const output = review.review?.output?.trim();
  if (!output) return null;
  const excerpt = stripMarkdown(output);
  return <p className="line-clamp-6 text-small text-grey-primary whitespace-pre-line">{excerpt}</p>;
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
