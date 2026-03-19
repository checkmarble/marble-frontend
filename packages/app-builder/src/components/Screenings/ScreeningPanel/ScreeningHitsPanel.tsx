import { CalloutV2 } from '@app-builder/components/Callout';
import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import type { Screening, ScreeningMatch } from '@app-builder/models/screening';
import { type ScreeningMatchPayload, type ScreeningStatus } from '@app-builder/models/screening';
import {
  useInvalidateScreeningDetail,
  useScreeningDetailQuery,
} from '@app-builder/queries/screening/get-screening-detail';
import { type action as refineAction } from '@app-builder/routes/ressources+/screenings+/refine';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
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
      setPreviewResults(null);
      invalidateScreeningDetail(decisionId, newScreeningId);
    },
    [invalidateScreeningDetail, decisionId],
  );

  // Preview state: search results shown on the left before validation
  const [previewResults, setPreviewResults] = useState<ScreeningMatchPayload[] | null>(null);
  const previewFormDataRef = useRef<FormData | null>(null);
  const refineFetcher = useFetcher<typeof refineAction>();

  const handleSearchComplete = useCallback((results: ScreeningMatchPayload[], formData: FormData) => {
    setPreviewResults(results);
    previewFormDataRef.current = formData;
  }, []);

  const handleValidate = useCallback(() => {
    if (previewFormDataRef.current) {
      refineFetcher.submit(previewFormDataRef.current, {
        method: 'POST',
        action: getRoute('/ressources/screenings/refine'),
      });
    }
  }, [refineFetcher]);

  const handleCancelPreview = useCallback(() => {
    setPreviewResults(null);
    previewFormDataRef.current = null;
  }, []);

  useEffect(() => {
    if (refineFetcher.data?.success) {
      handleRefineSuccess(refineFetcher.data.data.id);
    }
  }, [refineFetcher.data, handleRefineSuccess]);

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
                    {/* Left: Match cards (or preview results) */}
                    <PanelMatchList
                      screening={screening}
                      previewResults={previewResults}
                      onValidate={handleValidate}
                      onCancel={handleCancelPreview}
                    />

                    {/* Right: Search details sidebar */}
                    <PanelSearchDetails
                      screening={screening}
                      onRefineSuccess={handleRefineSuccess}
                      onSearchComplete={handleSearchComplete}
                    />
                  </div>
                </LoaderRevalidatorContext.Provider>
              );
            })}
        </PanelContent>
      </PanelContainer>
    </PanelRoot>
  );
}

function PanelMatchList({
  screening,
  previewResults,
  onValidate,
  onCancel,
}: {
  screening: Screening;
  previewResults: ScreeningMatchPayload[] | null;
  onValidate: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation(screeningsI18n);
  const matchesToReviewCount = filter(screening.matches, (m) => m.status === 'pending').length;

  const previewMatches = useMemo<ScreeningMatch[] | null>(() => {
    if (!previewResults) return null;
    return previewResults.map((payload) => ({
      id: payload.id,
      entityId: payload.id,
      queryIds: [],
      status: 'pending' as const,
      enriched: false,
      payload,
      comments: [],
    }));
  }, [previewResults]);

  const matches = previewMatches ?? screening.matches;

  return (
    <div className="flex flex-1 flex-col gap-2 pr-4">
      <span className="text-m font-medium">{t('screenings:potential_matches')}</span>
      <span className="text-s opacity-50">
        {t('screenings:callout.needs_review', {
          toReview: matchesToReviewCount,
          totalMatches: screening.matches.length,
        })}
      </span>

      {previewMatches ? (
        <CalloutV2>
          <div className="flex flex-1 items-center justify-between gap-4">
            <span className="text-s">{t('screenings:refine_inline.new_results_callout')}</span>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" appearance="stroked" size="small" onClick={onCancel}>
                {t('screenings:refine_inline.cancel')}
              </Button>
              <Button variant="primary" size="small" onClick={onValidate}>
                {t('screenings:refine_inline.validate_results')}
              </Button>
            </div>
          </div>
        </CalloutV2>
      ) : null}

      <div className="flex flex-col gap-2 mt-2">
        {matches.map((screeningMatch) => (
          <MatchCard
            key={screeningMatch.id}
            match={screeningMatch}
            defaultOpen={matches.length === 1}
            hideEnrich
            hideReview={!!previewMatches}
          />
        ))}
      </div>
    </div>
  );
}
