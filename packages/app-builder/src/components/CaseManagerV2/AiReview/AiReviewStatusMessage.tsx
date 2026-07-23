import { type AiCaseReviewStatus } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiReviewStatusMessageProps = {
  status: AiCaseReviewStatus;
  className?: string;
};

// Message shown for an AI review that has no readable content to display: pending
// (being generated), failed, insufficient funds, or completed with empty content.
// Consumers render this only when there is no review content, so the `completed`
// case falls back to a neutral "no content" message. Callers pass `className` for
// layout (e.g. `h-full justify-center` for centered panels).
export function AiReviewStatusMessage({ status, className }: AiReviewStatusMessageProps) {
  const { t } = useTranslation(['cases']);

  return match(status)
    .with('pending', () => (
      <div className={cn('flex items-center gap-xs text-small text-grey-secondary', className)}>
        <Icon icon="spinner" className="size-4 animate-spin" />
        <span>{t('cases:case.ai_reviews.generating')}</span>
      </div>
    ))
    .with('failed', 'insufficient_funds', (s) => (
      <div className={cn('flex items-center gap-xs text-small text-red-primary', className)}>
        <Icon icon="warning" className="size-4 shrink-0" />
        <span>
          {s === 'insufficient_funds'
            ? t('cases:case.ai_reviews.insufficient_funds')
            : t('cases:case.ai_reviews.failed')}
        </span>
      </div>
    ))
    .with('completed', () => (
      <div className={cn('flex items-center gap-xs text-small text-grey-secondary', className)}>
        <span>{t('cases:case.ai_reviews.no_content')}</span>
      </div>
    ))
    .exhaustive();
}
