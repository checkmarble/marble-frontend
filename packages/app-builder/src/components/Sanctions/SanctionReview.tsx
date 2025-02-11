import { Callout } from '@app-builder/components/Callout';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchCard } from './MatchCard';
import { RefineSearchModal } from './RefineSearchModal';
import { sanctionsI18n } from './sanctions-i18n';

export type SanctionReviewSectionProps = {
  decisionId: string;
  sanctionCheck: SanctionCheck;
};

export function SanctionReviewSection({
  decisionId,
  sanctionCheck,
}: SanctionReviewSectionProps) {
  const { t } = useTranslation(sanctionsI18n);
  const [isRefining, setIsRefining] = useState(false);
  const matchesToReviewCount = filter(
    sanctionCheck.matches,
    (m) => m.status === 'pending',
  ).length;
  const needsRefine = sanctionCheck.partial;

  return (
    <div className="flex h-fit flex-[2] flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-m font-semibold">Potential matches</span>
          <span className="text-grey-50 text-s">
            {matchesToReviewCount}/{sanctionCheck.matches.length} to review
          </span>
          {needsRefine ? (
            <Button
              className="ml-auto"
              variant="secondary"
              onClick={() => setIsRefining(true)}
            >
              <Icon icon="restart-alt" className="size-5" />
              {t('sanctions:refine_search')}
            </Button>
          ) : null}
        </div>
        {!needsRefine ? (
          <Callout bordered>{t('sanctions:callout.review')}</Callout>
        ) : (
          <div className="text-s bg-red-95 text-red-47 flex items-center gap-2 rounded p-2">
            <Icon icon="error" className="size-5 shrink-0" />
            {t('sanctions:callout.needs_refine', {
              matchCount: matchesToReviewCount,
            })}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {sanctionCheck.matches.map((sanctionMatch) => (
          <MatchCard
            key={sanctionMatch.id}
            match={sanctionMatch}
            disabled={needsRefine}
          />
        ))}
      </div>
      {needsRefine && isRefining ? (
        <RefineSearchModal
          decisionId={decisionId}
          sanctionCheck={sanctionCheck}
          open={isRefining}
          onClose={() => setIsRefining(false)}
        />
      ) : null}
    </div>
  );
}
