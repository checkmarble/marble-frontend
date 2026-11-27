import { sortScreeningMatchesByTopics } from '@app-builder/components/Screenings/match-sorting';
import { Case } from '@app-builder/models/cases';
import { ContinuousScreening } from '@app-builder/models/continuous-screening';
import { useTranslation } from 'react-i18next';
import { MarkAllNoHitButton } from './MarkAllNoHitButton';
import { MatchCard } from './MatchCard';

type ScreeningMatchListProps = {
  screening: ContinuousScreening;
  caseDetail: Case;
};

export function ScreeningMatchList({ screening, caseDetail }: ScreeningMatchListProps) {
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="flex flex-col gap-sm order-3">
      <div className="flex items-center justify-between gap-sm">
        <div className="text-default font-medium">{t('continuousScreening:review.matches.title')}</div>
        <MarkAllNoHitButton caseId={caseDetail.id} screening={screening} />
      </div>
      <div className="flex flex-col gap-sm">
        {[...screening.matches].sort(sortScreeningMatchesByTopics).map((screeningMatch) => (
          <MatchCard
            key={screeningMatch.id}
            caseDetail={caseDetail}
            screening={screening}
            screeningMatch={screeningMatch}
          />
        ))}
      </div>
    </div>
  );
}
