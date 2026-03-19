import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import type { Screening } from '@app-builder/models/screening';
import { type ScreeningStatus } from '@app-builder/models/screening';
import {
  useInvalidateScreeningDetail,
  useScreeningDetailQuery,
} from '@app-builder/queries/screening/get-screening-detail';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { match } from 'ts-pattern';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelContent, PanelRoot } from '../../Panel/Panel';
import { Spinner } from '../../Spinner';
import { MatchCard } from '../MatchCard';
import { ScreeningStatusTag } from '../ScreeningStatusTag';
import { screeningsI18n } from '../screenings-i18n';
import { PanelSearchDetails } from './PanelSearchDetails';

interface ScreeningHitsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionId: string;
  screeningId: string;
  screeningName: string;
  screeningStatus: ScreeningStatus;
}

export function ScreeningHitsPanel({
  open,
  onOpenChange,
  decisionId,
  screeningId: initialScreeningId,
  screeningName,
  screeningStatus,
}: ScreeningHitsPanelProps) {
  const { t } = useTranslation(screeningsI18n);
  const [currentScreeningId, setCurrentScreeningId] = useState(initialScreeningId);
  useEffect(() => {
    setCurrentScreeningId(initialScreeningId);
  }, [initialScreeningId]);
  const invalidateScreeningDetail = useInvalidateScreeningDetail();

  const screeningQuery = useScreeningDetailQuery(decisionId, currentScreeningId, open);

  const revalidate = useCallback(() => {
    invalidateScreeningDetail(decisionId, currentScreeningId);
  }, [invalidateScreeningDetail, decisionId, currentScreeningId]);

  const handleRefineSuccess = useCallback(
    (newScreeningId: string) => {
      setCurrentScreeningId(newScreeningId);
      invalidateScreeningDetail(decisionId, newScreeningId);
    },
    [invalidateScreeningDetail, decisionId],
  );

  const currentName = screeningQuery.data?.config.name ?? screeningName;
  const currentStatus = screeningQuery.data?.status ?? screeningStatus;

  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="max" className="!max-w-[80vw]">
        {/* Header: X | Name + Status Badge | Action button */}
        <div className="flex items-center gap-4 pb-v2-lg">
          <Icon
            icon="cross"
            className="size-6 shrink-0 cursor-pointer text-grey-secondary hover:text-grey-primary"
            onClick={() => onOpenChange(false)}
            aria-label="Close panel"
          />
          <div className="flex flex-1 items-center gap-1">
            <h2 className="text-xl font-semibold text-grey-primary tracking-[-0.8px]">{currentName}</h2>
            <ScreeningStatusTag status={currentStatus} />
          </div>
        </div>

        {/* Body */}
        <PanelContent>
          {match(screeningQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center p-8">
                <Spinner />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="text-grey-secondary p-8 text-center text-s">{t('common:global_error')}</div>
            ))
            .otherwise((query) => {
              const screening = query.data;
              if (!screening) {
                return <div className="text-grey-secondary p-8 text-center text-s">{t('common:global_error')}</div>;
              }

              return (
                <LoaderRevalidatorContext.Provider value={revalidate}>
                  <div className="flex h-full items-start">
                    {/* Left: Match cards */}
                    <PanelMatchList screening={screening} />

                    {/* Right: Search details sidebar */}
                    <PanelSearchDetails screening={screening} onRefineSuccess={handleRefineSuccess} />
                  </div>
                </LoaderRevalidatorContext.Provider>
              );
            })}
        </PanelContent>
      </PanelContainer>
    </PanelRoot>
  );
}

function PanelMatchList({ screening }: { screening: Screening }) {
  const { t } = useTranslation(screeningsI18n);
  const matchesToReviewCount = filter(screening.matches, (m) => m.status === 'pending').length;

  return (
    <div className="flex flex-1 flex-col gap-2 pr-4">
      <span className="text-m font-medium">{t('screenings:potential_matches')}</span>
      <span className="text-s opacity-50">
        {t('screenings:callout.needs_review', {
          toReview: matchesToReviewCount,
          totalMatches: screening.matches.length,
        })}
      </span>
      <div className="flex flex-col gap-2 mt-2">
        {screening.matches.map((screeningMatch) => (
          <MatchCard key={screeningMatch.id} match={screeningMatch} defaultOpen={screening.matches.length === 1} />
        ))}
      </div>
    </div>
  );
}
