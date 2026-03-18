import { casesI18n, scenarioI18n } from '@app-builder/components';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DetailedCaseDecision } from '@app-builder/models/cases';
import { type DataModelWithTableOptions, type Pivot } from '@app-builder/models/data-model';
import {
  isScreeningReviewCompleted,
  type Screening,
  type ScreeningQuery,
  type ScreeningStatus,
} from '@app-builder/models/screening';
import {
  useInvalidateScreeningDetail,
  useScreeningDetailQuery,
} from '@app-builder/queries/screening/get-screening-detail';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelContent, PanelRoot } from '../Panel/Panel';
import { Spinner } from '../Spinner';
import { MatchCard } from './MatchCard';
import { RefineSearchModal } from './RefineSearchModal';
import { ScreeningStatusTag } from './ScreeningStatusTag';
import { screeningsI18n } from './screenings-i18n';

interface ScreeningHitsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionId: string;
  screeningId: string;
  screeningName: string;
  screeningStatus: ScreeningStatus;
  decision: DetailedCaseDecision;
  dataModel: DataModelWithTableOptions;
  pivots: Pivot[];
}

export function ScreeningHitsPanel({
  open,
  onOpenChange,
  decisionId,
  screeningId: initialScreeningId,
  screeningName,
  screeningStatus,
  decision,
  dataModel,
  pivots,
}: ScreeningHitsPanelProps) {
  const { t } = useTranslation(screeningsI18n);
  const [currentScreeningId, setCurrentScreeningId] = useState(initialScreeningId);
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

  const currentStatus = screeningQuery.data?.status ?? screeningStatus;
  const matchesToReviewCount = screeningQuery.data
    ? filter(screeningQuery.data.matches, (m) => m.status === 'pending').length
    : 0;

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
            <h2 className="text-xl font-semibold text-grey-primary tracking-[-0.8px]">{screeningName}</h2>
            <ScreeningStatusTag status={currentStatus} />
          </div>
          {currentStatus === 'in_review' && matchesToReviewCount > 0 ? (
            <Button variant="secondary" size="small" className="shrink-0">
              <Icon icon="wand" className="size-4" />
              {t('screenings:panel.dismiss_false_positives')}
            </Button>
          ) : null}
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
              if (!screening) return null;

              return (
                <LoaderRevalidatorContext.Provider value={revalidate}>
                  <div className="flex h-full items-start">
                    {/* Left: Match cards */}
                    <PanelMatchList screening={screening} />

                    {/* Right: Search details sidebar */}
                    <PanelSearchDetails
                      screening={screening}
                      decision={decision}
                      dataModel={dataModel}
                      pivots={pivots}
                      onRefineSuccess={handleRefineSuccess}
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

function SearchDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start text-s">
      <span className="w-[133px] shrink-0 opacity-50">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function QueryProperties({ query }: { query: ScreeningQuery }) {
  const { t } = useTranslation(scenarioI18n);

  const entityTypeLabel = match(query.schema)
    .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
    .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
    .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
    .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
    .otherwise(() => query.schema);

  return (
    <>
      {Object.entries(query.properties).map(([key, values]) => (
        <SearchDetailRow key={key} label={key}>
          <span>{values.join(', ')}</span>
        </SearchDetailRow>
      ))}
      <SearchDetailRow label={t('screenings:search_entity_type')}>
        <span className="inline-flex items-center rounded-full border border-grey-border bg-white px-2 py-0.5 text-xs text-grey-secondary">
          {entityTypeLabel}
        </span>
      </SearchDetailRow>
    </>
  );
}

function PanelSearchDetails({
  screening,
  decision,
  dataModel,
  pivots,
  onRefineSuccess,
}: {
  screening: Screening;
  decision: DetailedCaseDecision;
  dataModel: DataModelWithTableOptions;
  pivots: Pivot[];
  onRefineSuccess: (screeningId: string) => void;
}) {
  const { t } = useTranslation([...screeningsI18n, ...casesI18n]);
  const [isRefining, setIsRefining] = useState(false);
  const [objectLink, setObjectLink] = useState<{
    tableName: string;
    objectId: string;
  } | null>(null);
  const isRefinable = !isScreeningReviewCompleted(screening);
  // const pivotValues = usePivotValues(decision.pivotValues, pivots);

  const request = screening.request;
  const queries = request ? Object.values(request.queries) : [];

  return (
    <div className="sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-4 border-l border-grey-border pl-4">
      <span className="text-m font-medium">{t('screenings:panel.search_details')}</span>

      {request ? (
        <div className="bg-grey-background-light border border-grey-border flex flex-col rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <span className="text-s font-medium">{t('screenings:panel.search_label')}</span>

            {/* Query properties */}
            <div className="flex flex-col gap-2">
              {queries.map((query, idx) => (
                <QueryProperties key={idx} query={query} />
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-grey-border my-2" />

          {/* Config: threshold */}
          <div className="flex flex-col gap-2">
            <SearchDetailRow label={t('screenings:match_threshold')}>
              <span>{`> ${request.threshold}%`}</span>
            </SearchDetailRow>
          </div>
        </div>
      ) : null}

      {isRefinable ? (
        <Button
          variant="primary"
          appearance="stroked"
          size="small"
          className="w-fit"
          onClick={() => setIsRefining(true)}
        >
          {t('screenings:refine_search')}
        </Button>
      ) : null}

      {/* Pivot values */}
      {/* {pivotValues.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-grey-primary text-xs font-medium first-letter:capitalize">
            {t('cases:case_detail.pivot_values')}
          </span>
          <CasePivotValues pivotValues={pivotValues} />
        </div>
      ) : null} */}

      {/* Trigger object */}
      <div className="flex flex-col gap-2">
        <span className="text-grey-primary text-xs font-medium first-letter:capitalize">
          {t('cases:case_detail.trigger_object')}
        </span>
        <CaseDetailTriggerObject
          className="h-fit max-h-[50dvh] overflow-auto"
          dataModel={dataModel}
          triggerObject={decision.triggerObject}
          triggerObjectType={decision.triggerObjectType}
          onLinkClicked={(tableName, objectId) => setObjectLink({ tableName, objectId })}
        />
        {objectLink ? (
          <IngestedObjectDetailModal
            dataModel={dataModel}
            tableName={objectLink.tableName}
            objectId={objectLink.objectId}
            onClose={() => setObjectLink(null)}
          />
        ) : null}
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
