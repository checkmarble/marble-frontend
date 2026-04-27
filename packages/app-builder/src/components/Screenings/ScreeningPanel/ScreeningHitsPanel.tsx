import { CalloutV2 } from '@app-builder/components/Callout';
import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import type { Screening, ScreeningMatch } from '@app-builder/models/screening';
import { type ScreeningMatchPayload, type ScreeningStatus } from '@app-builder/models/screening';
import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { useInvalidateCaseDecisions } from '@app-builder/queries/cases/list-decisions';
import { useBulkReviewMatchesMutation } from '@app-builder/queries/screening/bulk-review-matches';
import {
  useInvalidateScreeningAiSuggestions,
  useScreeningAiSuggestionsQuery,
} from '@app-builder/queries/screening/get-ai-suggestions';
import {
  useInvalidateScreeningDetail,
  useScreeningDetailQuery,
} from '@app-builder/queries/screening/get-screening-detail';
import { useRefineScreeningMutation } from '@app-builder/queries/screening/refine-screening';
import { type RefineSearchInput } from '@app-builder/server-fns/screenings';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button, Checkbox } from 'ui-design-system';
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
  const { t } = useTranslation([...screeningsI18n, 'common']);
  const [currentScreeningId, setCurrentScreeningId] = useState(initialScreeningId);
  useEffect(() => {
    setCurrentScreeningId(initialScreeningId);
  }, [initialScreeningId]);
  const invalidateScreeningDetail = useInvalidateScreeningDetail();
  const invalidateCaseDecisions = useInvalidateCaseDecisions();

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        invalidateCaseDecisions();
      }
    },
    [onOpenChange, invalidateCaseDecisions],
  );

  const screeningQuery = useScreeningDetailQuery(decisionId, currentScreeningId, open);
  const aiSuggestionsQuery = useScreeningAiSuggestionsQuery(currentScreeningId, open);
  const invalidateAiSuggestions = useInvalidateScreeningAiSuggestions();
  const bulkReviewMutation = useBulkReviewMatchesMutation();

  // Selection state (lifted here so header buttons can access it)
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

  const revalidate = useCallback(() => {
    invalidateScreeningDetail(decisionId, currentScreeningId);
  }, [invalidateScreeningDetail, decisionId, currentScreeningId]);

  const revalidateAfterBulk = useCallback(() => {
    invalidateScreeningDetail(decisionId, currentScreeningId);
    invalidateAiSuggestions(currentScreeningId);
  }, [invalidateScreeningDetail, invalidateAiSuggestions, decisionId, currentScreeningId]);

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
  const previewFormValuesRef = useRef<RefineSearchInput | null>(null);
  const refineMutation = useRefineScreeningMutation();

  const handleSearchComplete = useCallback((results: ScreeningMatchPayload[], formValues: RefineSearchInput) => {
    setPreviewResults(results);
    previewFormValuesRef.current = formValues;
  }, []);

  const handleValidate = useCallback(() => {
    if (previewFormValuesRef.current) {
      refineMutation.mutateAsync(previewFormValuesRef.current).then((data) => {
        handleRefineSuccess(data.id);
      });
    }
  }, [refineMutation]);

  const handleCancelPreview = useCallback(() => {
    setPreviewResults(null);
    previewFormValuesRef.current = null;
  }, []);

  const currentName = screeningQuery.data?.config.name ?? screeningName;
  const currentStatus = screeningQuery.data?.status ?? screeningStatus;

  // Compute bulk action visibility from screening data + AI suggestions
  const screening = screeningQuery.data;
  const aiSuggestions = aiSuggestionsQuery.data ?? [];
  const isInPreview = !!previewResults;

  const pendingMatches = useMemo(
    () => (screening ? filter(screening.matches, (m) => m.status === 'pending') : []),
    [screening],
  );

  const aiSuggestionsByMatchId = useMemo(() => {
    const map = new Map<string, ScreeningAiSuggestion>();
    for (const suggestion of aiSuggestions) {
      map.set(suggestion.matchId, suggestion);
    }
    return map;
  }, [aiSuggestions]);

  const probableFalsePositiveMatchIds = useMemo(
    () =>
      pendingMatches
        .filter((m) => aiSuggestionsByMatchId.get(m.id)?.confidence === 'probable_false_positive')
        .map((m) => m.id),
    [pendingMatches, aiSuggestionsByMatchId],
  );

  const showDismissButton = !isInPreview && probableFalsePositiveMatchIds.length >= 1;
  const showBulkButton = !isInPreview && selectedMatchIds.length >= 2;

  const handleDismissFalsePositives = useCallback(() => {
    bulkReviewMutation.mutate(probableFalsePositiveMatchIds, {
      onSuccess: revalidateAfterBulk,
      onError: () => toast.error(t('common:errors.unknown')),
    });
  }, [bulkReviewMutation, probableFalsePositiveMatchIds, revalidateAfterBulk, t]);

  const handleBulkMarkFalsePositive = useCallback(() => {
    bulkReviewMutation.mutate(selectedMatchIds, {
      onSuccess: revalidateAfterBulk,
      onError: () => toast.error(t('common:errors.unknown')),
    });
  }, [bulkReviewMutation, selectedMatchIds, revalidateAfterBulk, t]);

  return (
    <PanelRoot open={open} onOpenChange={handleOpenChange}>
      <PanelContainer size="max" className="!max-w-[80vw]">
        {/* Header: X | Name + Status Badge | Bulk action buttons */}
        <div className="flex items-center gap-4 pb-v2-lg">
          <Icon
            icon="cross"
            className="size-6 shrink-0 cursor-pointer text-grey-secondary hover:text-grey-primary"
            onClick={() => handleOpenChange(false)}
            aria-label="Close panel"
          />
          <div className="flex flex-1 items-center gap-2">
            <h2 className="text-xl font-semibold text-grey-primary tracking-[-0.8px] leading-0">{currentName}</h2>
            <ScreeningStatusTag status={currentStatus} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showBulkButton ? (
              <Button
                variant="primary"
                size="small"
                onClick={handleBulkMarkFalsePositive}
                disabled={bulkReviewMutation.isPending}
              >
                {t('screenings:panel.mark_all_false_positive')}
              </Button>
            ) : null}
            {showDismissButton ? (
              <Button
                variant="secondary"
                appearance="stroked"
                size="small"
                onClick={handleDismissFalsePositives}
                disabled={bulkReviewMutation.isPending}
              >
                <Icon icon="wand" className="size-4" />
                {t('screenings:panel.dismiss_false_positives')}
              </Button>
            ) : null}
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
              const screeningData = query.data;
              if (!screeningData) {
                return <div className="text-grey-secondary p-8 text-center text-s">{t('common:global_error')}</div>;
              }

              return (
                <LoaderRevalidatorContext.Provider value={revalidate}>
                  <div className="flex h-full items-start">
                    {/* Left: Match cards (or preview results) */}
                    <PanelMatchList
                      screening={screeningData}
                      previewResults={previewResults}
                      onValidate={handleValidate}
                      onCancel={handleCancelPreview}
                      aiSuggestionsByMatchId={aiSuggestionsByMatchId}
                      selectedMatchIds={selectedMatchIds}
                      setSelectedMatchIds={setSelectedMatchIds}
                      isInPreview={isInPreview}
                    />

                    {/* Separator */}
                    <div className="shrink-0 border-l border-grey-border self-stretch" />

                    {/* Right: Search details sidebar */}
                    <PanelSearchDetails
                      screening={screeningData}
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
  aiSuggestionsByMatchId,
  selectedMatchIds,
  setSelectedMatchIds,
  isInPreview,
}: {
  screening: Screening;
  previewResults: ScreeningMatchPayload[] | null;
  onValidate: () => void;
  onCancel: () => void;
  aiSuggestionsByMatchId: Map<string, ScreeningAiSuggestion>;
  selectedMatchIds: string[];
  setSelectedMatchIds: React.Dispatch<React.SetStateAction<string[]>>;
  isInPreview: boolean;
}) {
  const { t } = useTranslation(screeningsI18n);

  const pendingMatches = useMemo(() => filter(screening.matches, (m) => m.status === 'pending'), [screening.matches]);
  const matchesToReviewCount = pendingMatches.length;

  const toggleMatch = useCallback(
    (matchId: string, checked: boolean) => {
      setSelectedMatchIds((prev) => {
        if (checked) {
          return prev.includes(matchId) ? prev : [...prev, matchId];
        }
        return prev.filter((id) => id !== matchId);
      });
    },
    [setSelectedMatchIds],
  );

  const pendingMatchIds = useMemo(() => pendingMatches.map((m) => m.id), [pendingMatches]);
  const pendingMatchIdsSet = useMemo(() => new Set(pendingMatchIds), [pendingMatchIds]);
  const selectedMatchIdsSet = useMemo(() => new Set(selectedMatchIds), [selectedMatchIds]);

  // Keep selection limited to current pending matches after revalidation/status changes.
  useEffect(() => {
    setSelectedMatchIds((prev) => {
      const next = prev.filter((id) => pendingMatchIdsSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [pendingMatchIdsSet, setSelectedMatchIds]);

  const toggleAll = useCallback(() => {
    setSelectedMatchIds((prev) => {
      const allSelected = pendingMatchIds.every((id) => prev.includes(id));
      return allSelected ? [] : pendingMatchIds;
    });
  }, [pendingMatchIds, setSelectedMatchIds]);

  const showSelectControls = !isInPreview && pendingMatches.length >= 1;
  const allSelected = pendingMatchIds.length > 0 && pendingMatchIds.every((id) => selectedMatchIdsSet.has(id));

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

      {/* Select all / Deselect all */}
      {showSelectControls ? (
        <button
          type="button"
          className="text-s text-purple-primary hover:text-purple-hover w-fit cursor-pointer"
          onClick={toggleAll}
        >
          {allSelected ? t('screenings:panel.deselect_all') : t('screenings:panel.select_all')}
        </button>
      ) : null}

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
        {matches.map((screeningMatch) => {
          const isPending = screeningMatch.status === 'pending';
          const showCheckbox = showSelectControls && isPending;

          return (
            <div key={screeningMatch.id} className="flex items-start gap-2">
              {showCheckbox ? (
                <div className="flex shrink-0 items-start pt-5 w-4">
                  <Checkbox
                    size="small"
                    checked={selectedMatchIdsSet.has(screeningMatch.id)}
                    onCheckedChange={(checked) => toggleMatch(screeningMatch.id, checked === true)}
                  />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <MatchCard
                  match={screeningMatch}
                  defaultOpen={matches.length === 1}
                  hideEnrich
                  hideReview={!!previewMatches}
                  aiSuggestion={aiSuggestionsByMatchId.get(screeningMatch.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
