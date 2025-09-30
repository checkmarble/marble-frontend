import { Callout } from '@app-builder/components/Callout';
import {
  isScreeningError,
  isScreeningReviewCompleted,
  type Screening,
  ScreeningSuccess,
} from '@app-builder/models/screening';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MatchCard } from './MatchCard';
import { RefineSearchModal } from './RefineSearchModal';
import { ScreeningErrors } from './ScreeningErrors';
import { sanctionsI18n } from './screenings-i18n';

export type SanctionReviewSectionProps = {
  screening: Screening;
  onRefineSuccess: (screeningId: string) => void;
};

export function SanctionReviewSection({ screening, onRefineSuccess }: SanctionReviewSectionProps) {
  const { t } = useTranslation(sanctionsI18n);
  const [isRefining, setIsRefining] = useState(false);
  const matchesToReviewCount = filter(screening.matches, (m) => m.status === 'pending').length;
  const hasError = isScreeningError(screening);
  const isRefinable = !isScreeningReviewCompleted(screening);

  return (
    <div className="flex h-fit flex-2 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-m font-semibold">{t('sanctions:potential_matches')}</span>
          <span className="text-grey-50 text-s">
            {t('sanctions:callout.needs_review', {
              toReview: matchesToReviewCount,
              totalMatches: screening.matches.length,
            })}
          </span>
          {isRefinable ? (
            <Button className="ml-auto" variant="secondary" onClick={() => setIsRefining(true)}>
              <Icon icon="restart-alt" className="size-5" />
              {t('sanctions:refine_search')}
            </Button>
          ) : null}
        </div>
        {match(screening)
          .when(isScreeningError, (sc) => <ScreeningErrors screening={sc} />)
          .when(
            (sc) => sc.status === 'in_review' && sc.partial,
            (sc: ScreeningSuccess) => (
              <div className="text-s bg-red-95 text-red-47 flex items-center gap-2 rounded-sm p-2">
                <Icon icon="error" className="size-5 shrink-0" />
                {t('sanctions:callout.needs_refine', {
                  matchCount: sc.request.limit,
                })}
              </div>
            ),
          )
          .when(
            (sc) => sc.status === 'in_review',
            () => <Callout bordered>{t('sanctions:callout.review')}</Callout>,
          )
          .otherwise(() => null)}
      </div>
      <div className="flex flex-col gap-2">
        {screening.matches.map((screeningMatch) => (
          <MatchCard
            key={screeningMatch.id}
            match={screeningMatch}
            unreviewable={hasError}
            defaultOpen={screening.matches.length === 1}
          />
        ))}
      </div>
      {isRefining ? (
        <RefineSearchModal
          screeningId={screening.id}
          screening={screening}
          open={isRefining}
          onClose={() => setIsRefining(false)}
          onRefineSuccess={onRefineSuccess}
        />
      ) : null}
    </div>
  );
}
