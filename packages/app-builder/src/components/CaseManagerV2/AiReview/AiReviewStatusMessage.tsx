import { type AiCaseReviewStatus } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiReviewStatusMessageProps = {
  status: AiCaseReviewStatus;
  className?: string;
};

// Message shown for an AI review that carries no readable content yet: pending
// (being generated), failed, or insufficient funds. Renders nothing for statuses
// that have content (e.g. completed). Callers pass `className` for layout
// (e.g. `h-full justify-center` for centered panels).
export function AiReviewStatusMessage({ status, className }: AiReviewStatusMessageProps) {
  const { t } = useTranslation(['cases']);

  if (status === 'pending') {
    return (
      <div className={cn('flex items-center gap-xs text-small text-grey-secondary', className)}>
        <Icon icon="spinner" className="size-4 animate-spin" />
        <span>{t('cases:case.ai_reviews.generating')}</span>
      </div>
    );
  }

  if (status === 'failed' || status === 'insufficient_funds') {
    return (
      <div className={cn('flex items-center gap-xs text-small text-red-primary', className)}>
        <Icon icon="warning" className="size-4 shrink-0" />
        <span>
          {status === 'insufficient_funds'
            ? t('cases:case.ai_reviews.insufficient_funds')
            : t('cases:case.ai_reviews.failed')}
        </span>
      </div>
    );
  }

  return null;
}
